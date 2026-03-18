'use client';

import Link from 'next/link';
import CrownLogo from '@/components/CrownLogo';

const sections = [
  { title: 'About pumpbets.io',        body: 'pumpbets.io is a decentralized prediction market platform built on the Solana blockchain. Users connect their Solana wallet to participate in markets by staking SOL on predicted outcomes. The platform is currently in beta and operates exclusively on the Solana Devnet. No real funds are at risk during the beta phase.' },
  { title: 'Eligibility',               body: 'By using pumpbets.io you confirm that you are at least 18 years old and that participating in prediction markets is legal in your jurisdiction. It is your sole responsibility to ensure compliance with local laws and regulations before using the platform.' },
  { title: 'Wallet & Authentication',   body: 'Access to pumpbets.io is provided exclusively through a compatible Solana wallet (Phantom, Solflare, or similar). You are solely responsible for the security of your wallet and private keys. pumpbets.io never has custody of your funds and cannot recover lost wallets or private keys.' },
  { title: 'Prediction Markets',        body: 'Markets on pumpbets.io are purely speculative. Outcomes are determined by real-world events and resolved by the platform. Payouts are calculated proportionally based on the amount staked and the final odds at resolution. pumpbets.io reserves the right to void, delay, or modify a market in cases of ambiguity, manipulation, or technical failure.' },
  { title: 'Fees',                      body: 'A small protocol fee may be deducted from winning payouts to fund platform operations and development. Fee rates will be clearly displayed before placing any bet. During the beta phase on Devnet, no real fees are charged.' },
  { title: 'Risk Disclosure',           body: 'Prediction markets involve financial risk. You may lose the full amount you stake on a market. Past performance of any market or user does not guarantee future results. Never stake more than you can afford to lose.' },
  { title: 'Prohibited Conduct',        body: 'You agree not to: attempt to manipulate market outcomes; exploit bugs or vulnerabilities in the platform; use automated bots or scripts to gain an unfair advantage; engage in wash trading or collusion; or circumvent any security or access controls.' },
  { title: 'Intellectual Property',     body: 'All content, branding, and code associated with pumpbets.io are the property of the pumpbets.io team. You may not reproduce, distribute, or create derivative works without explicit written permission.' },
  { title: 'Disclaimer of Warranties', body: 'pumpbets.io is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or the accuracy of any market data. The platform is in beta — bugs and downtime may occur.' },
  { title: 'Limitation of Liability',  body: 'To the fullest extent permitted by law, pumpbets.io and its team shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform, including loss of funds.' },
  { title: 'Changes to These Terms',   body: 'We may update these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the new Terms. We will note the updated date at the top of this page.' },
  { title: 'Contact',                   body: 'For questions or concerns regarding these Terms, reach out to us on X or through the community channels listed in the Docs.' },
];

export default function TermsPage() {
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
          <div style={{ fontSize: 12, color: '#333' }}>Last updated: March 17, 2026</div>
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #111', padding: '64px 40px 48px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(1,226,158,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(1,226,158,0.2) 50%, transparent 100%)' }} />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#01e29e' }}>Legal</span>
            <span style={{ width: 32, height: 1, background: '#01e29e', opacity: 0.4, display: 'block' }} />
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-2px', lineHeight: 1, color: '#f0f0f0' }}>
            Terms of<br />
            <span style={{ color: '#01e29e' }}>Service</span>
          </h1>
          <p style={{ fontSize: 14, color: '#444', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
            By accessing pumpbets.io you agree to these terms. Read them carefully before placing your first bet.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 100px', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            Questions about these terms?
          </p>
          <Link href="/docs" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#01e29e', textDecoration: 'none', background: 'rgba(1,226,158,0.08)', border: '1px solid rgba(1,226,158,0.2)', padding: '7px 16px', borderRadius: 8 }}>
            Read the Docs →
          </Link>
        </div>
      </div>
    </div>
  );
}
