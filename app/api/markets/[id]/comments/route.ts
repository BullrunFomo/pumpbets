import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getComments, postComment, toggleLike } from '@/lib/db/comments';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wallet = await getSession();
  const comments = await getComments(id, wallet ?? undefined);
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const wallet = await getSession();
  if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const { body } = await req.json() as { body: string };
  if (!body?.trim()) return NextResponse.json({ error: 'Empty comment' }, { status: 400 });

  const comment = await postComment(id, wallet, body.trim());
  return NextResponse.json(comment, { status: 201 });
}

// PATCH /api/markets/[id]/comments — toggle like on a comment
export async function PATCH(req: NextRequest) {
  const wallet = await getSession();
  if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { commentId } = await req.json() as { commentId: string };
  const result = await toggleLike(commentId, wallet);
  return NextResponse.json(result);
}
