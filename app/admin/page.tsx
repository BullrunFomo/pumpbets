'use client';

import { useEffect, useState } from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import { useApp } from '@/context/AppContext';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { buildInitializeMarket, buildResolveMarket } from '@/lib/solana/client';

const ADMIN_WALLET = '2PKC2rQCoFaYbFGgyJrRmCJJrwAi2QfaRdzXvNAXTRi7';

interface AdminMarket {
  id: string;
  question: string;
  type: string;
  category: string;
  resolved: boolean;
  winning_option: string | null;
  expires_at: string;
  total_volume: number;
  options: string[];
}

function toChainId(marketId: string): bigint {
  const n = parseInt(marketId, 10);
  if (!isNaN(n)) return BigInt(n);
  const match = marketId.match(/\d+/);
  return match ? BigInt(match[0]) : BigInt(0);
}

export default function AdminPage() {
  const { user } = useApp();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const [markets, setMarkets]           = useState<AdminMarket[]>([]);
  const [loading, setLoading]           = useState(true);
  const [resolving, setResolving]       = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ market: AdminMarket; option: string } | null>(null);
  const [busy, setBusy]                 = useState(false);
  const [initializing, setInitializing] = useState<string | null>(null);
  const [toast, setToast]               = useState('');

  const isAdmin = connected && publicKey?.toBase58() === ADMIN_WALLET;

  useEffect(() => {
    fetch('/api/admin/markets')
      .then((r) => r.json())
      .then((data) => setMarkets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleInitialize = async (market: AdminMarket) => {
    if (!publicKey) return;
    setInitializing(market.id);
    try {
      const chainId    = toChainId(market.id);
      const numOptions = market.type === 'binary' ? 2 : market.options.length;
      const expiry     = Math.floor(new Date(market.expires_at).getTime() / 1000);
      const tx  = await buildInitializeMarket(connection, publicKey, chainId, numOptions, expiry);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');
      showToast(`✓ Market #${market.id} initialized on-chain`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to initialize');
    } finally {
      setInitializing(null);
    }
  };

  const handleResolve = async () => {
    if (!confirmModal || !publicKey) return;
    setBusy(true);
    try {
      // 1. On-chain resolution
      const chainId      = toChainId(confirmModal.market.id);
      const winningIndex = confirmModal.market.type === 'binary'
        ? confirmModal.option.toUpperCase() === 'YES' ? 0 : 1
        : confirmModal.market.options.indexOf(confirmModal.option);
      const tx  = await buildResolveMarket(connection, publicKey, chainId, winningIndex);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      // 2. Update Supabase
      const res = await fetch(`/api/admin/markets/${confirmModal.market.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningOption: confirmModal.option }),
      });
      if (!res.ok) throw new Error('DB update failed');

      setMarkets((prev) => prev.map((m) =>
        m.id === confirmModal.market.id ? { ...m, resolved: true, winning_option: confirmModal.option } : m
      ));
      showToast(`✓ Market resolved — ${confirmModal.option} wins`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to resolve market');
    } finally {
      setBusy(false);
      setConfirmModal(null);
      setResolving(null);
    }
  };

  // ── Access control ──────────────────────────────────────────────────────────

  if (!connected) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5' }}>
        <SimpleNavbar breadcrumb="Admin" />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>Connect your wallet to access admin</p>
          <button onClick={() => setVisible(true)} style={{ background: '#01e29e', border: 'none', color: '#080808', fontWeight: 700, fontSize: 14, padding: '10px 28px', borderRadius: 10, cursor: 'pointer' }}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5' }}>
        <SimpleNavbar breadcrumb="Admin" />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p style={{ fontSize: 36, margin: '0 0 16px' }}>🚫</p>
          <p style={{ fontSize: 16, color: '#666' }}>This wallet does not have admin access.</p>
        </div>
      </div>
    );
  }

  // ── Admin UI ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5' }}>
      <SimpleNavbar breadcrumb="Admin" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-1px' }}>Market Admin</h1>
        <p style={{ fontSize: 14, color: '#555', margin: '0 0 36px' }}>Initialize markets on-chain, resolve outcomes, distribute payouts.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {markets.map((market) => (
              <div key={market.id} style={{ background: '#0e0e0e', border: `1px solid ${resolving === market.id ? '#01e29e30' : '#161616'}`, borderRadius: 12, padding: '20px 24px', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#555', background: '#1a1a1a', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                        {market.category}
                      </span>
                      <span style={{ fontSize: 10, color: '#444' }}>#{market.id}</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#e5e5e5', lineHeight: 1.4 }}>{market.question}</p>
                    <div style={{ fontSize: 12, color: '#444' }}>
                      Expires {new Date(market.expires_at).toLocaleDateString()} · {market.total_volume.toFixed(0)} SOL volume
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    {/* Initialize on-chain */}
                    {!market.resolved && (
                      <button
                        onClick={() => handleInitialize(market)}
                        disabled={initializing === market.id}
                        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', fontWeight: 600, fontSize: 12, padding: '5px 12px', borderRadius: 7, cursor: initializing === market.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#01e29e50'; e.currentTarget.style.color = '#01e29e'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888'; }}
                      >
                        {initializing === market.id ? 'Initializing…' : '⬡ Init on-chain'}
                      </button>
                    )}

                    {/* Resolve */}
                    {market.resolved ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#01e29e', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', padding: '4px 12px', borderRadius: 6 }}>
                        ✓ {market.winning_option}
                      </span>
                    ) : (
                      <button
                        onClick={() => setResolving(resolving === market.id ? null : market.id)}
                        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5', fontWeight: 600, fontSize: 13, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                {/* Option picker */}
                {resolving === market.id && !market.resolved && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1a1a' }}>
                    <p style={{ margin: '0 0 10px', fontSize: 12, color: '#666' }}>Pick the winning outcome:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {market.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setConfirmModal({ market, option: opt })}
                          style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#141414', color: '#e5e5e5', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#01e29e'; e.currentTarget.style.color = '#01e29e'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5'; }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm resolve modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={() => setConfirmModal(null)}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: 400, maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700 }}>Confirm Resolution</h2>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>{confirmModal.market.question}</p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#aaa' }}>
              Winning outcome: <strong style={{ color: '#01e29e' }}>{confirmModal.option}</strong>
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 12, color: '#555' }}>This sends an on-chain transaction and updates the DB. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '11px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#888', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleResolve} disabled={busy} style={{ flex: 1, padding: '11px', background: busy ? '#00a876' : '#01e29e', border: 'none', borderRadius: 10, color: '#080808', fontWeight: 700, fontSize: 13, cursor: busy ? 'not-allowed' : 'pointer' }}>
                {busy ? 'Resolving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#01e29e', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
