'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

interface AppUser {
  walletAddress: string;
  username: string | null;
  avatarColor: string;
}

interface AppContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then(({ wallet, user: u }) => {
        if (wallet) {
          setUser({
            walletAddress: wallet,
            username:      u?.username ?? null,
            avatarColor:   u?.avatarColor ?? '#01e29e',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    const wallet  = publicKey.toBase58();
    const message = `Sign in to Quant: ${Date.now()}`;
    const msgBytes = new TextEncoder().encode(message);
    const sigBytes = await signMessage(msgBytes);
    const signature = bs58.encode(sigBytes);

    const res = await fetch('/api/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, signature, message }),
    });
    const data = await res.json();
    if (data.ok) {
      setUser({ walletAddress: wallet, username: null, avatarColor: '#01e29e' });
    }
  }, [publicKey, signMessage]);

  // Auto sign-in when wallet connects or switches to a different wallet
  useEffect(() => {
    if (connected && publicKey && !loading) {
      const mismatch = !user || user.walletAddress !== publicKey.toBase58();
      if (mismatch) signIn();
    }
  }, [connected, publicKey, user, loading, signIn]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/wallet', { method: 'DELETE' });
    await disconnect();
    setUser(null);
  }, [disconnect]);

  return (
    <AppContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
