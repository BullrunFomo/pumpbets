import { createServiceClient } from '@/lib/supabase/server';

export interface AdminMarket {
  id: string;
  question: string;
  type: string;
  category: string;
  resolved: boolean;
  winning_option: string | null;
  expires_at: string;
  total_volume: number;
  options: string[]; // option labels
}

export async function getAllMarketsForAdmin(): Promise<AdminMarket[]> {
  const db = createServiceClient();
  const [{ data: markets }, { data: opts }] = await Promise.all([
    db.from('markets').select('id,question,type,category,resolved,winning_option,expires_at,total_volume').order('created_at', { ascending: false }),
    db.from('market_options').select('market_id,label,display_order'),
  ]);

  return (markets ?? []).map((m) => ({
    id:             m.id,
    question:       m.question,
    type:           m.type,
    category:       m.category,
    resolved:       m.resolved,
    winning_option: m.winning_option,
    expires_at:     m.expires_at,
    total_volume:   Number(m.total_volume),
    options:        m.type === 'binary'
      ? ['YES', 'NO']
      : (opts ?? []).filter((o) => o.market_id === m.id).sort((a, b) => a.display_order - b.display_order).map((o) => o.label),
  }));
}

export async function resolveMarket(marketId: string, winningOption: string): Promise<void> {
  const db = createServiceClient();

  const { data: positions } = await db
    .from('positions')
    .select('*')
    .eq('market_id', marketId)
    .eq('status', 'open');

  if (positions && positions.length > 0) {
    const totalPool    = positions.reduce((s, p) => s + Number(p.amount_usd), 0);
    const winners      = positions.filter((p) => p.option_label === winningOption);
    const winShares    = winners.reduce((s, p) => s + Number(p.shares), 0);

    for (const pos of positions) {
      if (pos.option_label === winningOption) {
        const payout = winShares > 0 ? (Number(pos.shares) / winShares) * totalPool : 0;
        await db.from('positions').update({ status: 'won', payout }).eq('id', pos.id);
      } else {
        await db.from('positions').update({ status: 'lost', payout: 0 }).eq('id', pos.id);
      }
    }
  }

  await db.from('markets').update({ resolved: true, winning_option: winningOption }).eq('id', marketId);
}
