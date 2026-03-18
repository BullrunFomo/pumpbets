import type { Market, MultipleMarket } from '@/lib/types';

const USERS = [
  'whale_dao', '0xb3f2', 'pred_whale', 'cryptoking', 'alice.eth',
  'marco_t', 'moon_bet', 'anon42', 'j_dao', 'vito99', 'sol_surfer', 'degen_pro',
];

const COMMENT_TEXTS = [
  "This looks like easy money. The momentum is undeniable right now.",
  "Already in on this one. Let's go 🚀",
  "Volume is too low for me to feel confident. Watching closely.",
  "Smart money is moving. Can't ignore the whale activity.",
  "Don't sleep on the other side — macro conditions are wild.",
  "Been tracking this for weeks. The trend is clear.",
  "Just added another $200. Feeling very bullish on this.",
  "Historical patterns say this resolves early. Love the trade.",
  "Market seems mispriced IMO. Incredible risk/reward.",
  "Anyone else seeing the same signals? Looks obvious to me.",
];

export interface ChartPoint { x: number; y: number; pct: number; }

export function genPoints(seed: number, start: number, n = 80): ChartPoint[] {
  const W = 580, H = 220;
  let val = start;
  const pts: ChartPoint[] = [];
  for (let i = 0; i < n; i++) {
    const d =
      Math.sin(seed * 0.4 + i * 0.25) * 2.5 +
      Math.sin(seed * 2.1 + i * 0.9) * 1.2;
    val = Math.max(5, Math.min(95, val + d));
    pts.push({ x: i * W / (n - 1), y: H - val / 100 * H, pct: val });
  }
  return pts;
}

export function genPath(seed: number, start: number, n = 80): string {
  return genPoints(seed, start, n)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
}

export function getActivity(market: Market) {
  const seed = parseInt(market.id);
  const outcomes = market.type === 'binary'
    ? ['YES', 'NO']
    : (market as MultipleMarket).options.map((o) => o.label);

  return Array.from({ length: 14 }, (_, i) => {
    const userIdx = (seed * 3 + i * 7) % USERS.length;
    const outIdx  = (seed * 5 + i * 11) % outcomes.length;
    const dollars = (seed * 17 + i * 131) % 900 + 50;
    const cents   = (seed * 7 + i * 43) % 100;
    const hour    = (12 - Math.floor(i / 2) + 24) % 24;
    const min     = (i * 13) % 60;
    return {
      user:    USERS[userIdx],
      action:  i % 5 === 0 ? 'sold' : 'bought',
      outcome: outcomes[outIdx],
      isYes:   outIdx % 2 === 0,
      amount:  `$${dollars}.${String(cents).padStart(2, '0')}`,
      date:    `Mar ${i < 7 ? 16 : 15} · ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
    };
  });
}

export function getHolders(market: Market) {
  const seed = parseInt(market.id);
  const outcomes = market.type === 'binary'
    ? ['YES', 'NO']
    : (market as MultipleMarket).options.map((o) => o.label);

  return Array.from({ length: 10 }, (_, i) => {
    const userIdx = (seed * 5 + i * 9) % USERS.length;
    const outIdx  = (seed * 3 + i * 7) % outcomes.length;
    const shares  = (seed * 23 + i * 157) % 800 + 20;
    const value   = (seed * 41 + i * 89) % 2000 + 100;
    return {
      user:    USERS[userIdx],
      outcome: outcomes[outIdx],
      shares,
      value:   `$${value}`,
    };
  });
}

export function getComments(market: Market) {
  const seed = parseInt(market.id);
  return Array.from({ length: 8 }, (_, i) => {
    const userIdx = (seed * 7 + i * 11) % USERS.length;
    const textIdx = (seed * 3 + i * 13) % COMMENT_TEXTS.length;
    const likes   = (seed * 11 + i * 37) % 80;
    const min     = String((seed * 3 + i * 17) % 60).padStart(2, '0');
    const hour    = String(((seed + i * 3) % 12) + 1).padStart(2, '0');
    return {
      user:  USERS[userIdx],
      text:  COMMENT_TEXTS[textIdx],
      likes,
      date:  `Mar ${i < 4 ? 16 : 15} · ${hour}:${min}`,
    };
  });
}
