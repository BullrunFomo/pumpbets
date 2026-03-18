import { createServiceClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
  walletAddress: string;
  username: string | null;
  avatarColor: string;
  profit: number;
  winRate: number;
  trades: number;
  bestWin: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const db = createServiceClient();

  // Pull all settled positions + user info in one query
  const { data: positions } = await db
    .from('positions')
    .select('user_wallet, amount_usd, payout, status, users(username, avatar_color)')
    .in('status', ['won', 'lost']);

  if (!positions || positions.length === 0) return [];

  // Aggregate per wallet
  const map = new Map<string, {
    username: string | null;
    avatarColor: string;
    totalIn: number;
    totalPayout: number;
    wins: number;
    total: number;
    bestWin: number;
  }>();

  for (const p of positions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (p as any).users as { username: string | null; avatar_color: string } | null;
    const entry = map.get(p.user_wallet) ?? {
      username:    user?.username ?? null,
      avatarColor: user?.avatar_color ?? '#01e29e',
      totalIn:     0,
      totalPayout: 0,
      wins:        0,
      total:       0,
      bestWin:     0,
    };

    const amt    = Number(p.amount_usd);
    const payout = Number(p.payout ?? 0);

    entry.totalIn    += amt;
    entry.total      += 1;
    if (p.status === 'won') {
      entry.wins      += 1;
      entry.totalPayout += payout;
      const net = payout - amt;
      if (net > entry.bestWin) entry.bestWin = net;
    }
    map.set(p.user_wallet, entry);
  }

  return Array.from(map.entries())
    .map(([wallet, e]) => ({
      walletAddress: wallet,
      username:      e.username,
      avatarColor:   e.avatarColor,
      profit:        Math.round(e.totalPayout - e.totalIn),
      winRate:       e.total > 0 ? Math.round((e.wins / e.total) * 100) : 0,
      trades:        e.total,
      bestWin:       Math.round(e.bestWin),
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);
}
