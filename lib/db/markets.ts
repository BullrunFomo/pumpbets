import { createServiceClient } from '@/lib/supabase/server';
import type { Market, BinaryMarket, MultipleMarket, Category } from '@/lib/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`;
  return `$${v}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMarket(row: any, options: any[]): Market {
  const base = {
    id:        row.id,
    category:  row.category as Category,
    question:  row.question,
    totalBet:  fmtVolume(Number(row.total_volume)),
    volume:    Number(row.total_volume),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    image:     row.image ?? undefined,
    comments:  row._comment_count ?? 0,
  };

  if (row.type === 'binary') {
    return {
      ...base,
      type:       'binary',
      yesPercent: row.yes_percent ?? 50,
      noPercent:  row.no_percent  ?? 50,
    } as BinaryMarket;
  }

  return {
    ...base,
    type:    'multiple',
    options: options
      .filter((o) => o.market_id === row.id)
      .sort((a, b) => a.display_order - b.display_order)
      .map((o) => ({ label: o.label, percent: o.percent })),
  } as MultipleMarket;
}

// ── queries ───────────────────────────────────────────────────────────────────

export async function getAllMarkets(): Promise<Market[]> {
  const db = createServiceClient();

  const [{ data: rows }, { data: opts }, { data: counts }] = await Promise.all([
    db.from('markets').select('*').eq('resolved', false).order('created_at', { ascending: false }),
    db.from('market_options').select('*'),
    db.from('comments').select('market_id').then(({ data }) => ({
      data: data?.reduce<Record<string, number>>((acc, c) => {
        acc[c.market_id] = (acc[c.market_id] ?? 0) + 1;
        return acc;
      }, {}),
    })),
  ]);

  return (rows ?? []).map((row) =>
    rowToMarket({ ...row, _comment_count: (counts as Record<string, number>)?.[row.id] ?? 0 }, opts ?? [])
  );
}

export async function getMarketById(id: string): Promise<Market | null> {
  const db = createServiceClient();

  const [{ data: row }, { data: opts }, { data: commentCount }] = await Promise.all([
    db.from('markets').select('*').eq('id', id).single(),
    db.from('market_options').select('*').eq('market_id', id),
    db.from('comments').select('id', { count: 'exact', head: true }).eq('market_id', id),
  ]);

  if (!row) return null;
  return rowToMarket(
    { ...row, _comment_count: (commentCount as unknown as { count: number })?.count ?? 0 },
    opts ?? []
  );
}

export async function createMarket(input: {
  question: string;
  type: 'binary' | 'multiple';
  category: string;
  image?: string;
  expiresAt: string;
  options?: string[];
  createdBy?: string;
}): Promise<string> {
  const db = createServiceClient();
  const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const even = input.options?.length ? Math.round(100 / input.options.length) : 0;

  const { error } = await db.from('markets').insert({
    id,
    question:     input.question,
    type:         input.type,
    category:     input.category,
    image:        input.image ?? null,
    yes_percent:  input.type === 'binary' ? 50 : null,
    no_percent:   input.type === 'binary' ? 50 : null,
    total_volume: 0,
    expires_at:   input.expiresAt,
    resolved:     false,
    created_by:   input.createdBy ?? null,
  });
  if (error) throw new Error(error.message);

  if (input.type === 'multiple' && input.options?.length) {
    await db.from('market_options').insert(
      input.options.map((label, i) => ({ market_id: id, label, percent: even, display_order: i }))
    );
  }
  return id;
}

/** Recompute and persist odds after a new bet is placed, and record a price snapshot */
export async function refreshOdds(marketId: string): Promise<void> {
  const db = createServiceClient();
  const { data: market } = await db.from('markets').select('type').eq('id', marketId).single();
  if (!market) return;

  const { data: positions } = await db
    .from('positions')
    .select('option_label, amount_usd')
    .eq('market_id', marketId)
    .neq('status', 'cancelled');

  if (!positions || positions.length === 0) return;

  const totalVol = positions.reduce((s, p) => s + Number(p.amount_usd), 0);

  if (market.type === 'binary') {
    const yesBets = positions.filter((p) => p.option_label === 'YES').reduce((s, p) => s + Number(p.amount_usd), 0);
    const yesPercent = totalVol > 0 ? Math.round((yesBets / totalVol) * 100) : 50;
    const noPercent  = 100 - yesPercent;
    await db.from('markets').update({
      yes_percent:  yesPercent,
      no_percent:   noPercent,
      total_volume: totalVol,
    }).eq('id', marketId);
    await db.from('market_price_history').insert({
      market_id:    marketId,
      yes_percent:  yesPercent,
      no_percent:   noPercent,
      total_volume: totalVol,
    });
  } else {
    const { data: opts } = await db.from('market_options').select('id, label').eq('market_id', marketId);
    const optionPercents: { label: string; percent: number }[] = [];
    for (const opt of opts ?? []) {
      const optBets = positions.filter((p) => p.option_label === opt.label).reduce((s, p) => s + Number(p.amount_usd), 0);
      const pct = totalVol > 0 ? Math.round((optBets / totalVol) * 100) : 0;
      await db.from('market_options').update({ percent: pct }).eq('id', opt.id);
      optionPercents.push({ label: opt.label, percent: pct });
    }
    await db.from('markets').update({ total_volume: totalVol }).eq('id', marketId);
    await db.from('market_price_history').insert({
      market_id:       marketId,
      option_percents: optionPercents,
      total_volume:    totalVol,
    });
  }
}
