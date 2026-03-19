import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ set' : '✗ MISSING',
    SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ set' : '✗ MISSING',
    AUTH_SECRET:                   process.env.AUTH_SECRET ? '✓ set' : '✗ MISSING',
    NEXT_PUBLIC_SUPABASE_URL_len:  process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0,
    SUPABASE_KEY_len:              process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
  });
}
