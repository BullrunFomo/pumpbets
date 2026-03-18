import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createMarket } from '@/lib/db/markets';

export async function POST(req: NextRequest) {
  const wallet = await getSession();
  if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { question, type, category, image, expiresAt, options } = await req.json() as {
    question: string;
    type: 'binary' | 'multiple';
    category: string;
    image?: string;
    expiresAt: string;
    options?: string[];
  };

  if (!question?.trim()) return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  if (!['binary', 'multiple'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  if (!expiresAt) return NextResponse.json({ error: 'Expiry date is required' }, { status: 400 });
  if (type === 'multiple' && (!options || options.length < 2)) {
    return NextResponse.json({ error: 'Multiple choice markets need at least 2 options' }, { status: 400 });
  }

  const id = await createMarket({ question: question.trim(), type, category, image, expiresAt, options, createdBy: wallet });
  return NextResponse.json({ id }, { status: 201 });
}
