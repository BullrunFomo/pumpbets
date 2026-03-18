import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const RANGE_HOURS: Record<string, number> = {
  '1H': 1, '6H': 6, '1D': 24, '1W': 168, '1M': 720, 'ALL': 0,
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const range = req.nextUrl.searchParams.get('range') ?? 'ALL';
  const hours = RANGE_HOURS[range] ?? 0;

  const db = createServiceClient();

  const [{ data: market }, { data: positions }, { data: opts }] = await Promise.all([
    db.from('markets').select('type').eq('id', id).single(),
    db.from('positions')
      .select('option_label, amount_usd, created_at')
      .eq('market_id', id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true }),
    db.from('market_options')
      .select('label')
      .eq('market_id', id)
      .order('display_order', { ascending: true }),
  ]);

  if (!market || !positions || positions.length === 0) return NextResponse.json([]);

  const isBinary = market.type === 'binary';
  const optionLabels = isBinary ? ['YES', 'NO'] : (opts ?? []).map((o) => o.label);
  // Map lowercase → canonical label so positions stored with .toUpperCase() still match
  const labelMap: Record<string, string> = Object.fromEntries(optionLabels.map((l) => [l.toLowerCase(), l]));
  const running: Record<string, number> = Object.fromEntries(optionLabels.map((l) => [l, 0]));

  // Compute a data point after every bet (rolling odds)
  const allPoints = positions.map((p) => {
    const canonical = labelMap[p.option_label.toLowerCase()] ?? p.option_label;
    running[canonical] = (running[canonical] ?? 0) + Number(p.amount_usd);
    const total = Object.values(running).reduce((s, v) => s + v, 0);

    if (isBinary) {
      const yesPct = total > 0 ? Math.round((running['YES'] ?? 0) / total * 100) : 50;
      return { yes_percent: yesPct, no_percent: 100 - yesPct, option_percents: null, total_volume: total, recorded_at: p.created_at };
    }

    return {
      yes_percent: null,
      no_percent: null,
      option_percents: optionLabels.map((l) => ({
        label: l,
        percent: total > 0 ? Math.round((running[l] ?? 0) / total * 100) : 0,
      })),
      total_volume: total,
      recorded_at: p.created_at,
    };
  });

  // Filter to the requested time window
  const sinceMs = hours > 0 ? Date.now() - hours * 3600 * 1000 : null;
  const filtered = sinceMs ? allPoints.filter((p) => new Date(p.recorded_at).getTime() >= sinceMs) : allPoints;

  return NextResponse.json(filtered);
}
