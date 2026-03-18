import { createServiceClient } from '@/lib/supabase/server';

export interface User {
  walletAddress: string;
  username: string | null;
  avatarColor: string;
  createdAt: string;
}

export async function upsertUser(walletAddress: string): Promise<User> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('users')
    .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address', ignoreDuplicates: true })
    .select()
    .single();

  if (error) {
    // Row already exists — fetch it
    const { data: existing } = await db
      .from('users')
      .select()
      .eq('wallet_address', walletAddress)
      .single();
    if (!existing) throw new Error(error.message);
    return { walletAddress: existing.wallet_address, username: existing.username, avatarColor: existing.avatar_color, createdAt: existing.created_at };
  }

  return { walletAddress: data.wallet_address, username: data.username, avatarColor: data.avatar_color, createdAt: data.created_at };
}

export async function getUser(walletAddress: string): Promise<User | null> {
  const db = createServiceClient();
  const { data } = await db.from('users').select().eq('wallet_address', walletAddress).maybeSingle();
  if (!data) return null;
  return { walletAddress: data.wallet_address, username: data.username, avatarColor: data.avatar_color, createdAt: data.created_at };
}
