import { createServiceClient } from '@/lib/supabase/server';

export interface Position {
  id: string;
  marketId: string;
  userWallet: string;
  optionLabel: string;
  amountUsd: number;
  shares: number;
  txSignature: string | null;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  payout: number | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPosition(r: any): Position {
  return {
    id:           r.id,
    marketId:     r.market_id,
    userWallet:   r.user_wallet,
    optionLabel:  r.option_label,
    amountUsd:    Number(r.amount_usd),
    shares:       Number(r.shares),
    txSignature:  r.tx_signature,
    status:       r.status,
    payout:       r.payout != null ? Number(r.payout) : null,
    createdAt:    r.created_at,
  };
}

export async function getPositionsByMarket(marketId: string): Promise<Position[]> {
  const db = createServiceClient();
  const { data } = await db
    .from('positions')
    .select('*')
    .eq('market_id', marketId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(rowToPosition);
}

export async function getPositionsByUser(wallet: string): Promise<Position[]> {
  const db = createServiceClient();
  const { data } = await db
    .from('positions')
    .select('*')
    .eq('user_wallet', wallet)
    .order('created_at', { ascending: false });
  return (data ?? []).map(rowToPosition);
}

export interface PlaceBetInput {
  marketId: string;
  userWallet: string;
  optionLabel: string;
  amountUsd: number;
  txSignature?: string; // optional until smart contracts are live
}

/** Compute shares using simple proportion model.
 *  Will be replaced by on-chain AMM once contracts ship. */
function computeShares(amountUsd: number, optionPercent: number): number {
  const price = optionPercent / 100; // price per share (0–1)
  return price > 0 ? amountUsd / price : amountUsd;
}

export async function placeBet(input: PlaceBetInput, optionPercent: number): Promise<Position> {
  const db = createServiceClient();
  const shares = computeShares(input.amountUsd, optionPercent);

  const { data, error } = await db
    .from('positions')
    .insert({
      market_id:    input.marketId,
      user_wallet:  input.userWallet,
      option_label: input.optionLabel,
      amount_usd:   input.amountUsd,
      shares,
      tx_signature: input.txSignature ?? null,
      status:       'open',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToPosition(data);
}
