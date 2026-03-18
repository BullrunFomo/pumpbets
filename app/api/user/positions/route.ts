import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const wallet = await getSession();
  if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const db = createServiceClient();
  const { data } = await db
    .from('positions')
    .select('*, markets(question, type, resolved, winning_option)')
    .eq('user_wallet', wallet)
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}
