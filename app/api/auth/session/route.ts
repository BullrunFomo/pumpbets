import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUser } from '@/lib/db/users';

export async function GET() {
  const wallet = await getSession();
  if (!wallet) return NextResponse.json({ wallet: null });
  const user = await getUser(wallet);
  return NextResponse.json({ wallet, user });
}
