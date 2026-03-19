import { NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { upsertUser } from '@/lib/db/users';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { wallet, signature, message } = await req.json() as {
      wallet: string;
      signature: string;   // base58-encoded Ed25519 signature
      message: string;     // the exact message that was signed
    };

    if (!wallet || !signature || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify the Ed25519 signature
    const msgBytes  = new TextEncoder().encode(message);
    const sigBytes  = bs58.decode(signature);
    const keyBytes  = bs58.decode(wallet);

    const valid = nacl.sign.detached.verify(msgBytes, sigBytes, keyBytes);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Upsert user record (non-fatal — session still works if this fails)
    try { await upsertUser(wallet); } catch (e) { console.warn('[auth/wallet] upsertUser failed:', e); }

    // Issue session cookie
    const token = await createSession(wallet);
    const opts   = sessionCookieOptions(token);

    const res = NextResponse.json({ ok: true, wallet });
    res.cookies.set(opts);
    return res;
  } catch (err) {
    console.error('[auth/wallet]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: 'quant_session', value: '', maxAge: 0, path: '/' });
  return res;
}
