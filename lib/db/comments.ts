import { createServiceClient } from '@/lib/supabase/server';

export interface Comment {
  id: string;
  marketId: string;
  userWallet: string;
  username: string | null;
  avatarColor: string;
  body: string;
  likes: number;
  likedByMe: boolean;
  createdAt: string;
}

export async function getComments(marketId: string, viewerWallet?: string): Promise<Comment[]> {
  const db = createServiceClient();

  const { data: rows } = await db
    .from('comments')
    .select(`
      id, market_id, user_wallet, body, created_at,
      users (username, avatar_color),
      comment_likes (user_wallet)
    `)
    .eq('market_id', marketId)
    .order('created_at', { ascending: false });

  return (rows ?? []).map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (r as any).users as { username: string | null; avatar_color: string } | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const likesArr = (r as any).comment_likes as { user_wallet: string }[] ?? [];
    return {
      id:          r.id,
      marketId:    r.market_id,
      userWallet:  r.user_wallet,
      username:    user?.username ?? null,
      avatarColor: user?.avatar_color ?? '#01e29e',
      body:        r.body,
      likes:       likesArr.length,
      likedByMe:   viewerWallet ? likesArr.some((l) => l.user_wallet === viewerWallet) : false,
      createdAt:   r.created_at,
    };
  });
}

export async function postComment(marketId: string, userWallet: string, body: string): Promise<Comment> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('comments')
    .insert({ market_id: marketId, user_wallet: userWallet, body })
    .select(`id, market_id, user_wallet, body, created_at, users (username, avatar_color)`)
    .single();

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (data as any).users as { username: string | null; avatar_color: string } | null;
  return {
    id:          data.id,
    marketId:    data.market_id,
    userWallet:  data.user_wallet,
    username:    user?.username ?? null,
    avatarColor: user?.avatar_color ?? '#01e29e',
    body:        data.body,
    likes:       0,
    likedByMe:   false,
    createdAt:   data.created_at,
  };
}

export async function toggleLike(commentId: string, userWallet: string): Promise<{ likes: number; liked: boolean }> {
  const db = createServiceClient();
  const { data: existing } = await db
    .from('comment_likes')
    .select('comment_id')
    .eq('comment_id', commentId)
    .eq('user_wallet', userWallet)
    .maybeSingle();

  if (existing) {
    await db.from('comment_likes').delete().eq('comment_id', commentId).eq('user_wallet', userWallet);
  } else {
    await db.from('comment_likes').insert({ comment_id: commentId, user_wallet: userWallet });
  }

  const { count } = await db
    .from('comment_likes')
    .select('*', { count: 'exact', head: true })
    .eq('comment_id', commentId);

  return { likes: count ?? 0, liked: !existing };
}
