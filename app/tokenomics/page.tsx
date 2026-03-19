'use client';

import React from 'react';
import Link from 'next/link';
import CrownLogo from '@/components/CrownLogo';

const sections = [
  {
    tag: 'Token',
    title: '$PUMPBETS',
    body: '$PUMPBETS is the native token of the pumpbets.io ecosystem. It powers governance, rewards, and platform incentives across the Solana-based prediction market.',
    highlight: null,
    sub: 'Contract Address: 9qMriTViLmiKE9rbSrvkS3UGvdei3dNPhNZzV7Wrpump',
  },
  {
    tag: 'Revenue',
    title: 'Buybacks — 40%',
    body: '40% of all platform revenue is allocated to $PUMPBETS buybacks. Tokens purchased through buybacks are permanently removed from circulation, creating sustained deflationary pressure and aligning platform growth with token value.',
    highlight: null,
    sub: null,
  },
  {
    tag: 'Revenue',
    title: 'Platform Growth — 60%',
    body: '60% of all platform revenue is reinvested into the platform. This funds ongoing development, new market creation, infrastructure scaling, security audits, and ecosystem partnerships to ensure long-term sustainability.',
    highlight: null,
    sub: null,
  },
];

export default function TokenomicsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5', fontFamily: 'inherit' }}>
      {/* Navbar */}
      <nav style={{ background: 'rgba(8,8,8,0.9)', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)' }}>
        <div style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <CrownLogo size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#01e29e' }}>pump</span><span style={{ color: '#e5e5e5' }}>bets</span>
            </span>
          </Link>
          <div style={{ fontSize: 12, color: '#333' }}>Mainnet launch coming soon</div>
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #111', padding: '64px 40px 48px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(1,226,158,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(1,226,158,0.2) 50%, transparent 100%)' }} />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#01e29e' }}>Token</span>
            <span style={{ width: 32, height: 1, background: '#01e29e', opacity: 0.4, display: 'block' }} />
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-2px', lineHeight: 1, color: '#f0f0f0' }}>
            Token<span style={{ color: '#01e29e' }}>omics</span>
          </h1>
          <p style={{ fontSize: 14, color: '#444', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
            $PUMPBETS aligns platform revenue with token holders through buybacks and sustainable reinvestment.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 24px 100px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {sections.map((s, i) => (
          <React.Fragment key={i}>
          <div
            style={{ borderRadius: 14, padding: '28px 32px', background: '#0c0c0c', border: '1px solid #141414' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#01e29e', letterSpacing: '1px', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.15)', borderRadius: 6, padding: '3px 8px' }}>
                {s.tag}
              </span>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e0e0e0', letterSpacing: '-0.2px' }}>{s.title}</h2>
              {s.highlight && (
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#01e29e', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', borderRadius: 8, padding: '4px 12px' }}>
                  {s.highlight}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#5a5a5a', lineHeight: 1.85 }}>{s.body}</p>
            {s.sub && (
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#01e29e', fontWeight: 600 }}>{s.sub}</p>
            )}
          </div>
          {i === 0 && (
            <div style={{ borderRadius: 14, padding: '28px 32px', background: '#0c0c0c', border: '1px solid #141414', marginTop: 3 }}>
              <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555' }}>Revenue Split</p>
              <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', height: 10 }}>
                <div style={{ width: '40%', background: '#01e29e' }} />
                <div style={{ width: '60%', background: '#1a4a36' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#01e29e', fontWeight: 600 }}>40% Buybacks</span>
                <span style={{ fontSize: 12, color: '#2a8a60', fontWeight: 600 }}>60% Platform Growth</span>
              </div>
            </div>
          )}
          </React.Fragment>
        ))}

        {/* Footer note */}
        <div style={{ marginTop: 16, padding: '22px 28px', borderRadius: 14, background: 'rgba(1,226,158,0.03)', border: '1px solid rgba(1,226,158,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.6 }}>
            Follow us for contract address and launch updates.
          </p>
          <a href="https://x.com/pumpbetsio" target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#01e29e', textDecoration: 'none', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', padding: '7px 16px', borderRadius: 8 }}>
            Follow on X →
          </a>
        </div>
      </div>
    </div>
  );
}
