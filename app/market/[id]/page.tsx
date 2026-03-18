import MarketDetail from '@/components/MarketDetail';
import { getMarketById } from '@/lib/db/markets';
import { getPositionsByMarket } from '@/lib/db/positions';
import { getComments } from '@/lib/db/comments';
import { MARKETS } from '@/lib/markets';
import { notFound } from 'next/navigation';

const supabaseReady =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url';

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (supabaseReady) {
    const [market, positions, comments] = await Promise.all([
      getMarketById(id),
      getPositionsByMarket(id),
      getComments(id),
    ]);
    if (!market) notFound();
    return <MarketDetail market={market} positions={positions} comments={comments} />;
  }

  // Static fallback
  const market = MARKETS.find((m) => m.id === id);
  if (!market) notFound();
  return <MarketDetail market={market} positions={[]} comments={[]} />;
}
