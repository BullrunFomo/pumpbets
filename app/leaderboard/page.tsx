import Leaderboard from '@/components/Leaderboard';
import { getLeaderboard } from '@/lib/db/leaderboard';

const supabaseReady =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url';

export default async function LeaderboardPage() {
  let dbEntries = null;
  if (supabaseReady) {
    try { dbEntries = await getLeaderboard(50); } catch { /* fall through */ }
  }
  return <Leaderboard dbEntries={dbEntries} />;
}
