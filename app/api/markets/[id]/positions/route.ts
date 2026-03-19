import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPositionsByMarket, placeBet } from '@/lib/db/positions';
import { getMarketById, refreshOdds } from '@/lib/db/markets';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const positions = await getPositionsByMarket(id);
  return NextResponse.json(positions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const wallet = await getSession();
    if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;

    let market;
    try {
      market = await getMarketById(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load market';
      console.error('[positions/POST] getMarketById failed:', msg);
      return NextResponse.json({ error: `Market lookup failed: ${msg}` }, { status: 500 });
    }

    if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    if (market.resolved) return NextResponse.json({ error: 'Market is resolved' }, { status: 400 });

    const { optionLabel, amountUsd, txSignature } = await req.json() as {
      optionLabel: string;
      amountUsd: number;
      txSignature?: string;
    };

    if (!optionLabel || !amountUsd || amountUsd <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Find current option percent for share computation
    let optionPercent = 50;
    if (market.type === 'binary') {
      optionPercent = optionLabel === 'YES' ? market.yesPercent : market.noPercent;
    } else {
      const opt = market.options.find((o) => o.label === optionLabel);
      optionPercent = opt?.percent ?? 50;
    }

    let position;
    try {
      position = await placeBet(
        { marketId: id, userWallet: wallet, optionLabel, amountUsd, txSignature },
        optionPercent
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'DB error';
      console.error('[positions/POST] placeBet failed:', msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Recompute market odds — non-fatal
    try { await refreshOdds(id); } catch (e) { console.warn('[positions/POST] refreshOdds failed:', e); }

    return NextResponse.json(position, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[positions/POST] unhandled:', msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
