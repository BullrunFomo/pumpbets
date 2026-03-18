import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllMarketsForAdmin } from '@/lib/db/admin';

const ADMIN_WALLET = '2PKC2rQCoFaYbFGgyJrRmCJJrwAi2QfaRdzXvNAXTRi7';

export async function GET() {
  const wallet = await getSession();
  if (wallet !== ADMIN_WALLET) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const markets = await getAllMarketsForAdmin();
  return NextResponse.json(markets);
}
