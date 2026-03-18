'use client';

import Link from 'next/link';
import CrownLogo from '@/components/CrownLogo';

const sections = [
  {
    icon: '🎯',
    title: 'What is pumpbets.io?',
    body: 'pumpbets.io is a decentralized prediction market platform on the Solana blockchain focused on the crypto and meme ecosystem — PumpFun launches, token milestones, market events, and more. Connect your wallet, pick a side, and earn if you\'re right.',
  },
  {
    icon: '🧪',
    title: 'Beta & Devnet',
    body: 'The platform is currently in its beta phase and runs on Solana Devnet. No real money is involved yet. Get free Devnet SOL from faucet.solana.com to test the platform with zero risk.',
  },
  {
    icon: '👻',
    title: 'Connecting your wallet',
    body: 'pumpbets.io supports Phantom and Solflare wallets. Click "Connect Wallet" in the top right, approve the connection in your extension, and you\'re in. No email, no password — your wallet is your account.',
  },
  {
    icon: '💸',
    title: 'Placing a bet',
    body: 'Browse markets on the home page. Binary markets let you bet YES or NO on a single outcome. Multiple-choice markets let you pick one option from a list. Click a card to open the detail view, choose your position, set your stake, and confirm in your wallet.',
  },
  {
    icon: '📊',
    title: 'How odds work',
    body: 'Odds are calculated from the total amount staked on each side. If 70% of the pool is on YES, YES pays out less per share than NO. Odds update in real time as new bets arrive. A full on-chain AMM will replace this model once smart contracts are deployed.',
  },
  {
    icon: '🏁',
    title: 'Market resolution',
    body: 'Markets resolve when the deadline is reached and the real-world outcome is confirmed. Winning positions receive a proportional payout from the total pool, minus the protocol fee. Results are posted in each market\'s activity feed.',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    body: 'The leaderboard ranks all traders by total profit from resolved markets. Stats include total profit, win rate, and best single win. It updates automatically as markets settle.',
  },
  {
    icon: '💰',
    title: 'Fees',
    body: 'A small protocol fee is taken from winning payouts to fund ongoing development. The exact fee is shown before you confirm a bet. During the beta on Devnet, no real fees are charged.',
  },
  {
    icon: '⛓️',
    title: 'Smart contracts (coming soon)',
    body: 'On-chain escrow and an AMM are under active development using the Anchor framework on Solana. Once deployed, all funds and bet logic will be fully trustless and verifiable on-chain. The current beta uses a server-side database to simulate this flow.',
  },
  {
    icon: '📣',
    title: 'Stay updated',
    body: 'Follow us on X for announcements, new market launches, and the mainnet release date.',
  },
];

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5', fontFamily: 'inherit' }}>
      {/* Navbar */}
      <nav style={{ background: 'rgba(10,10,10,0.85)', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <CrownLogo size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#01e29e' }}>pump</span><span style={{ color: '#e5e5e5' }}>bets</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '72px 40px 56px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse at top, rgba(1,226,158,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', borderRadius: 999, padding: '4px 14px', fontSize: 11, color: '#01e29e', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>
          Documentation
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 14px', letterSpacing: '-1px', lineHeight: 1.1 }}>
          How pumpbets works
        </h1>
        <p style={{ fontSize: 14, color: '#555', margin: 0 }}>Everything you need to start trading on the platform.</p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {sections.map((s, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                padding: '26px 28px',
                background: '#0e0e0e',
                border: '1px solid #161616',
                transition: 'border-color 0.2s, background 0.2s',
                gridColumn: i === sections.length - 1 && sections.length % 2 !== 0 ? 'span 2' : undefined,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = '#111'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#161616'; e.currentTarget.style.background = '#0e0e0e'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.2px' }}>{s.title}</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48, borderRadius: 16, padding: '32px 36px', background: 'linear-gradient(135deg, #0e1a14 0%, #090f0b 100%)', border: '1px solid rgba(1,226,158,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#e5e5e5' }}>Ready to start?</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>Connect your wallet and place your first bet on devnet.</p>
          </div>
          <Link
            href="/"
            style={{ flexShrink: 0, background: '#01e29e', color: '#080808', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Open app →
          </Link>
        </div>
      </div>
    </div>
  );
}
