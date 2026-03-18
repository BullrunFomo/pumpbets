'use client';

import Link from 'next/link';
import CrownLogo from './CrownLogo';
import { C } from '@/lib/theme';

export default function SimpleNavbar({
  breadcrumb,
  right,
}: {
  breadcrumb?: string;
  right?: React.ReactNode;
}) {
  return (
    <nav style={{ background: C.card, borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <CrownLogo size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
              <span style={{ color: C.accent }}>pump</span><span style={{ color: C.text }}>bets</span>
            </span>
          </Link>
          {breadcrumb && (
            <>
              <span style={{ color: '#333' }}>/</span>
              <span style={{ fontSize: 14, color: '#666' }}>{breadcrumb}</span>
            </>
          )}
        </div>
        {right}
      </div>
    </nav>
  );
}
