import { getAllMarkets, getTotalVolume } from '@/lib/db/markets';
import { MARKETS as STATIC_MARKETS } from '@/lib/markets';
import HomeClient from './HomeClient';

export default async function Home() {
  let markets = STATIC_MARKETS;
  let totalVolume: number | null = null;
  try {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
      const [dbMarkets, vol] = await Promise.all([getAllMarkets(), getTotalVolume()]);
      if (dbMarkets.length > 0) markets = dbMarkets;
      totalVolume = vol;
    }
  } catch { /* fall through to static */ }

  return <HomeClient markets={markets} totalVolume={totalVolume} />;
}
