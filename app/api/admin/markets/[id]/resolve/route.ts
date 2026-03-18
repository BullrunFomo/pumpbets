import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { resolveMarket } from '@/lib/db/admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ADMIN_WALLET = '2PKC2rQCoFaYbFGgyJrRmCJJrwAi2QfaRdzXvNAXTRi7';
  const wallet = await getSession();
  if (wallet !== ADMIN_WALLET) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { winningOption } = await req.json() as { winningOption: string };
  if (!winningOption) return NextResponse.json({ error: 'winningOption is required' }, { status: 400 });

  await resolveMarket(id, winningOption);
  return NextResponse.json({ ok: true });
}
