'use client';

import Link from 'next/link';
import CrownLogo from '@/components/CrownLogo';

const sections = [
  {
    tag: 'Intro',
    title: 'What is pumpbets.io?',
    body: 'pumpbets.io is a decentralized prediction market platform on the Solana blockchain focused on the crypto and meme ecosystem — PumpFun launches, token milestones, market events, and more. Connect your wallet, pick a side, and earn if you\'re right.',
  },
  {
    tag: 'Beta',
    title: 'Beta & Devnet',
    body: 'The platform is currently in its beta phase and runs on Solana Devnet. No real money is involved yet. Get free Devnet SOL from faucet.solana.com to test the platform with zero risk.',
  },
  {
    tag: 'Wallet',
    title: 'Connecting your wallet',
    body: 'pumpbets.io supports Phantom and Solflare wallets. Click "Connect Wallet" in the top right, approve the connection in your extension, and you\'re in. No email, no password — your wallet is your account.',
  },
  {
    tag: 'Betting',
    title: 'Placing a bet',
    body: 'Browse markets on the home page. Binary markets let you bet YES or NO on a single outcome. Multiple-choice markets let you pick one option from a list. Click a card to open the detail view, choose your position, set your stake, and confirm in your wallet.',
  },
  {
    tag: 'Odds',
    title: 'How odds work',
    body: 'Odds are calculated from the total amount staked on each side. If 70% of the pool is on YES, YES pays out less per share than NO. Odds update in real time as new bets arrive. A full on-chain AMM will replace this model once smart contracts are deployed.',
  },
  {
    tag: 'Resolution',
    title: 'Market resolution',
    body: 'Markets resolve when the deadline is reached and the real-world outcome is confirmed. Winning positions receive a proportional payout from the total pool, minus the protocol fee. Results are posted in each market\'s activity feed.',
  },
  {
    tag: 'Ranks',
    title: 'Leaderboard',
    body: 'The leaderboard ranks all traders by total profit from resolved markets. Stats include total profit, win rate, and best single win. It updates automatically as markets settle.',
  },
  {
    tag: 'Fees',
    title: 'Fees',
    body: 'A small protocol fee is taken from winning payouts to fund ongoing development. The exact fee is shown before you confirm a bet. During the beta on Devnet, no real fees are charged.',
  },
  {
    tag: 'Chain',
    title: 'Smart contracts (coming soon)',
    body: 'On-chain escrow and an AMM are under active development using the Anchor framework on Solana. Once deployed, all funds and bet logic will be fully trustless and verifiable on-chain. The current beta uses a server-side database to simulate this flow.',
  },
  {
    tag: 'Updates',
    title: 'Stay updated',
    body: 'Follow us on X for announcements, new market launches, and the mainnet release date.',
  },
];

export default function DocsPage() {
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
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#01e29e' }}>Docs</span>
            <span style={{ width: 32, height: 1, background: '#01e29e', opacity: 0.4, display: 'block' }} />
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-2px', lineHeight: 1, color: '#f0f0f0' }}>
            How pumpbets <span style={{ color: '#01e29e' }}>works</span>
          </h1>
          <p style={{ fontSize: 14, color: '#444', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
            Everything you need to know to start trading on the platform.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 24px 100px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {sections.map((s, i) => (
          <div
            key={i}
            style={{ borderRadius: 14, padding: '28px 32px', background: '#0c0c0c', border: '1px solid #141414' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#01e29e', letterSpacing: '1px', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.15)', borderRadius: 6, padding: '3px 8px', fontVariantNumeric: 'tabular-nums' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e0e0e0', letterSpacing: '-0.2px' }}>{s.title}</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#5a5a5a', lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}

        {/* Footer note */}
        <div style={{ marginTop: 16, padding: '22px 28px', borderRadius: 14, background: 'rgba(1,226,158,0.03)', border: '1px solid rgba(1,226,158,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.6 }}>
            Ready to start trading on devnet?
          </p>
          <Link href="/" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#01e29e', textDecoration: 'none', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', padding: '7px 16px', borderRadius: 8 }}>
            Open app →
          </Link>
        </div>
      </div>
    </div>
  );
}
