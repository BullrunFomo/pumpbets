'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Navbar from '@/components/Navbar';
import MarketCard from '@/components/MarketCard';
import CategoryTabs from '@/components/CategoryTabs';
import SortTabs from '@/components/SortTabs';
import BetModal from '@/components/BetModal';
import { Category, SortOption, Market } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export default function HomeClient({ markets }: { markets: Market[] }) {
  const { user } = useApp();
  const { setVisible } = useWalletModal();

  const [category, setCategory] = useState<Category>('All');
  const [sort, setSort]         = useState<SortOption>('Trending');
  const [search, setSearch]     = useState('');
  const [betModal, setBetModal] = useState<{ market: Market; option: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const walletConnected = !!user;
  const walletAddress   = user?.walletAddress ?? null;

  const filteredMarkets = useMemo(() => {
    let result = [...markets];
    if (category !== 'All') result = result.filter((m) => m.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.question.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'Trending': result.sort((a, b) => b.comments - a.comments); break;
      case 'New':      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'Volume':   result.sort((a, b) => b.volume - a.volume); break;
      case 'Expiring': result.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()); break;
    }
    return result.slice(0, 6);
  }, [markets, category, sort, search]);

  const handleBet = (marketId: string, option: string) => {
    const market = markets.find((m) => m.id === marketId);
    if (market) setBetModal({ market, option });
  };

  const totalVolume = markets.reduce((s, m) => s + m.volume, 0);

  return (
    <div style={{
      height: '100vh',
      overflow: isMobile ? 'auto' : 'hidden',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar
        onSearch={setSearch}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnectWallet={() => setVisible(true)}
        isMobile={isMobile}
      />

      {/* Stats bar */}
      <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: isMobile ? '6px 14px' : '6px 20px', flexShrink: 0, display: 'flex', gap: isMobile ? 10 : 24, alignItems: 'center' }}>
        <Stat label="Markets" value={String(markets.length)} />
        <Divider />
        <Stat label="Volume" value={`${(totalVolume / 1_000_000).toFixed(2)}M SOL`} />
        <Divider />
        <Stat label="Network" value="Solana Devnet" highlight />
        <Divider />
        <Stat label="Wallet" value={walletConnected ? '● Connected' : '○ Disconnected'} highlight={walletConnected} />
      </div>

      {/* Category & Sort bar */}
      <div style={{ background: '#080808', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 10px' : '0 20px', flexShrink: 0 }}>
        <CategoryTabs active={category} onChange={setCategory} />
        <SortTabs active={sort} onChange={setSort} />
      </div>

      {/* Market grid */}
      <div style={{ flex: isMobile ? 'none' : 1, padding: isMobile ? '12px' : '14px 120px', overflow: isMobile ? 'visible' : 'hidden', minHeight: 0 }}>
        {filteredMarkets.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            <p style={{ fontSize: 36, margin: 0 }}>🔍</p>
            <p style={{ fontSize: 16, marginTop: 12, color: '#666' }}>No markets found</p>
            <p style={{ fontSize: 13, color: '#444' }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gridTemplateRows: isMobile ? 'auto' : 'repeat(2, 1fr)',
            gap: isMobile ? 12 : 14,
            height: isMobile ? 'auto' : 'calc(100% - 14px)',
          }}>
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} onBet={handleBet} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #1a1a1a', padding: isMobile ? '16px 20px' : '10px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 6 : 10 }}>
        {([
          { label: 'Terms of service', href: '/terms',                    external: false },
          { label: 'Tokenomics',       href: '/tokenomics',               external: false },
          { label: 'X',                href: 'https://x.com/pumpbetsio',  external: true  },
          { label: 'Docs',             href: '/docs',                     external: false },
        ] as const).map(({ label, href, external }, i, arr) => (
          <React.Fragment key={label}>
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#444', textDecoration: 'none', padding: isMobile ? '10px 8px' : '4px 2px' }}
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                style={{ fontSize: 12, color: '#444', textDecoration: 'none', padding: isMobile ? '10px 8px' : '4px 2px' }}
              >
                {label}
              </Link>
            )}
            {i < arr.length - 1 && <span style={{ color: '#2a2a2a', fontSize: 12 }}>|</span>}
          </React.Fragment>
        ))}
      </div>

      {betModal && (
        <BetModal
          market={betModal.market}
          option={betModal.option}
          onClose={() => setBetModal(null)}
          onConfirm={() => setBetModal(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span style={{ fontSize: 10, color: '#444', display: 'block', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: highlight ? '#01e29e' : '#777' }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: '#1e1e1e' }} />;
}
