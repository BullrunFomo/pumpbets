'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SimpleNavbar from '@/components/SimpleNavbar';
import { useApp } from '@/context/AppContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface Position {
  id: string;
  market_id: string;
  option_label: string;
  amount_usd: number;
  shares: number;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  payout: number | null;
  created_at: string;
  markets: {
    question: string;
    type: string;
    resolved: boolean;
    winning_option: string | null;
  } | null;
}

export default function PortfolioPage() {
  const { user } = useApp();
  const { setVisible } = useWalletModal();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch('/api/user/positions')
      .then((r) => r.json())
      .then((data) => setPositions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [user]);

  const totalBet    = positions.reduce((s, p) => s + Number(p.amount_usd), 0);
  const totalPayout = positions.filter(p => p.status === 'won').reduce((s, p) => s + (p.payout ?? 0), 0);
  const pnl         = totalPayout - positions.filter(p => p.status !== 'open').reduce((s, p) => s + Number(p.amount_usd), 0);
  const wins        = positions.filter(p => p.status === 'won').length;
  const losses      = positions.filter(p => p.status === 'lost').length;

  const statusColor = (s: string) => s === 'won' ? '#01e29e' : s === 'lost' ? '#ef4444' : '#888';
  const statusLabel = (s: string) => s === 'won' ? '✓ Won' : s === 'lost' ? '✕ Lost' : '● Open';

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5' }}>
      <SimpleNavbar breadcrumb="Portfolio" />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-1px' }}>My Portfolio</h1>
        <p style={{ fontSize: 14, color: '#555', margin: '0 0 36px' }}>Your bet history across all markets.</p>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 36, margin: 0 }}>🔒</p>
            <p style={{ fontSize: 16, color: '#666', margin: '16px 0 24px' }}>Connect your wallet to view your portfolio</p>
            <button
              onClick={() => setVisible(true)}
              style={{ background: '#01e29e', border: 'none', color: '#080808', fontWeight: 700, fontSize: 14, padding: '10px 28px', borderRadius: 10, cursor: 'pointer' }}
            >
              Connect Wallet
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>Loading…</div>
        ) : positions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 36, margin: 0 }}>📭</p>
            <p style={{ fontSize: 16, color: '#666', margin: '16px 0 24px' }}>No bets yet</p>
            <Link href="/" style={{ background: '#01e29e', color: '#080808', fontWeight: 700, fontSize: 14, padding: '10px 28px', borderRadius: 10, textDecoration: 'none' }}>
              Browse Markets →
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
              {[
                { label: 'Total Bets', value: String(positions.length) },
                { label: 'Total Staked', value: `${totalBet.toFixed(2)} SOL` },
                { label: 'W / L', value: `${wins} / ${losses}` },
                { label: 'P&L', value: `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} SOL`, highlight: pnl >= 0 },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ background: '#0e0e0e', border: '1px solid #161616', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: highlight !== undefined ? (highlight ? '#01e29e' : '#ef4444') : '#e5e5e5' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Positions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {positions.map((pos) => (
                <Link
                  key={pos.id}
                  href={`/market/${pos.market_id}`}
                  style={{ display: 'block', textDecoration: 'none', background: '#0e0e0e', border: '1px solid #161616', borderRadius: 12, padding: '18px 22px', transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#222')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#161616')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pos.markets?.question ?? pos.market_id}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', color: '#01e29e', padding: '2px 8px', borderRadius: 5 }}>
                          {pos.option_label}
                        </span>
                        <span style={{ fontSize: 12, color: '#444' }}>
                          {new Date(pos.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: statusColor(pos.status), marginBottom: 4 }}>
                        {statusLabel(pos.status)}
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        {Number(pos.amount_usd).toFixed(2)} SOL staked
                      </div>
                      {pos.status === 'won' && pos.payout != null && (
                        <div style={{ fontSize: 12, color: '#01e29e' }}>
                          +{Number(pos.payout).toFixed(2)} SOL payout
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
