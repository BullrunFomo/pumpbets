import { getAllMarkets } from '@/lib/db/markets';
import { MARKETS as STATIC_MARKETS } from '@/lib/markets';
import HomeClient from './HomeClient';

export default async function Home() {
  // Fetch from DB; fall back to static data if Supabase isn't configured yet
  let markets = STATIC_MARKETS;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      const dbMarkets = await getAllMarkets();
      if (dbMarkets.length > 0) markets = dbMarkets;
    }
  } catch { /* fall through to static */ }

  return <HomeClient markets={markets} />;
}
