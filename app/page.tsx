import { getAllMarkets, getTotalVolume } from '@/lib/db/markets';
import { MARKETS as STATIC_MARKETS } from '@/lib/markets';
import HomeClient from './HomeClient';

// Force server-side rendering on every request so live DB data is always used
export const dynamic = 'force-dynamic';

export default async function Home() {
  let markets = STATIC_MARKETS;
  let totalVolume: number | null = null;
  try {
    const [dbMarkets, vol] = await Promise.all([getAllMarkets(), getTotalVolume()]);
    if (dbMarkets.length > 0) markets = dbMarkets;
    totalVolume = vol;
  } catch (e) {
    console.error('[Home] Failed to load markets from DB:', e);
  }

  return <HomeClient markets={markets} totalVolume={totalVolume} />;
}
