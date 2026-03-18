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
  const wallet = await getSession();
  if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const market = await getMarketById(id);
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

  const position = await placeBet(
    { marketId: id, userWallet: wallet, optionLabel, amountUsd, txSignature },
    optionPercent
  );

  // Recompute market odds asynchronously
  await refreshOdds(id);

  return NextResponse.json(position, { status: 201 });
}
