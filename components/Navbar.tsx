'use client';

import { useState } from 'react';
import { Search, Trophy, Plus, Wallet, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import CrownLogo from './CrownLogo';

interface NavbarProps {
  onSearch: (query: string) => void;
  walletConnected: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
}

export default function Navbar({ onSearch, walletConnected, walletAddress, onConnectWallet }: NavbarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : null;

  const navLink = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 8, textDecoration: 'none', transition: 'color 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#e5e5e5')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav style={{ background: '#111111', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Logo + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <CrownLogo size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#01e29e' }}>pump</span><span style={{ color: '#e5e5e5' }}>bets</span>
            </span>
          </Link>

          <div style={{ width: 300, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearch}
              placeholder="Search markets"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, padding: '7px 12px 7px 30px', color: '#e5e5e5', fontSize: 13, outline: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = '#01e29e'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#222'; }}
            />
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {navLink('/leaderboard', <Trophy size={15} />, 'Leaderboard')}
          {walletConnected && navLink('/portfolio', <BarChart2 size={15} />, 'Portfolio')}

          {/* Create */}
          <Link
            href="/market/create"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#01e29e')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
          >
            <Plus size={14} />
            Create
          </Link>

          {/* Connect Wallet */}
          <button
            onClick={onConnectWallet}
            style={{ background: '#01e29e', border: 'none', color: '#080808', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, padding: '7px 16px', borderRadius: 8, transition: 'background 0.15s, transform 0.1s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#00c98b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#01e29e'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Wallet size={14} />
            {walletConnected && shortAddress ? shortAddress : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </nav>
  );
}
