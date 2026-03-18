'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Market, BinaryMarket, MultipleMarket } from '@/lib/types';
import type { Position } from '@/lib/db/positions';
import type { Comment as DbComment } from '@/lib/db/comments';
import SimpleNavbar from './SimpleNavbar';
import ChartSection from './ChartSection';
import ActivityTabs from './ActivityTabs';
import TradingPanel from './TradingPanel';
import { C } from '@/lib/theme';

function positionsToActivity(positions: Position[]) {
  return positions.slice(0, 14).map((p) => ({
    user:    p.userWallet.slice(0, 8) + '…',
    action:  'bought',
    outcome: p.optionLabel,
    isYes:   p.optionLabel === 'YES',
    amount:  `$${p.amountUsd.toFixed(2)}`,
    date:    new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
             ' · ' + new Date(p.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }));
}

function positionsToHolders(positions: Position[]) {
  return Object.values(
    positions.reduce<Record<string, { user: string; outcome: string; shares: number; value: number }>>(
      (acc, p) => {
        const key = p.userWallet + '|' + p.optionLabel;
        if (!acc[key]) acc[key] = { user: p.userWallet.slice(0, 8) + '…', outcome: p.optionLabel, shares: 0, value: 0 };
        acc[key].shares += p.shares;
        acc[key].value  += p.amountUsd;
        return acc;
      }, {}
    )
  ).sort((a, b) => b.value - a.value).slice(0, 10).map((h) => ({ ...h, value: `$${h.value.toFixed(0)}` }));
}

export default function MarketDetail({
  market,
  positions: initialPositions = [],
  comments: dbComments = [],
}: {
  market: Market;
  positions?: Position[];
  comments?: DbComment[];
}) {
  const [chartKey, setChartKey] = useState(0);
  const [positions, setPositions] = useState<Position[]>(initialPositions);

  const isBinary = market.type === 'binary';
  const bMarket  = isBinary ? (market as BinaryMarket) : null;
  const mMarket  = !isBinary ? (market as MultipleMarket) : null;

  const fetchPositions = useCallback(() => {
    fetch(`/api/markets/${market.id}/positions`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (Array.isArray(data)) setPositions(data); })
      .catch(() => {});
  }, [market.id]);

  // Poll for live activity/holders updates every 30s
  useEffect(() => {
    const interval = setInterval(fetchPositions, 30_000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  const activity = positionsToActivity(positions);
  const holders  = positionsToHolders(positions);

  const comments = dbComments.length > 0
    ? dbComments.map((c) => ({
        user:  c.username ?? c.userWallet.slice(0, 8) + '…',
        text:  c.body,
        likes: c.likes,
        date:  new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
               ' · ' + new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }))
    : [];

  const onBetConfirm = () => {
    setChartKey((k) => k + 1);
    fetchPositions();
  };

  const backLink = (
    <Link
      href="/"
      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, textDecoration: 'none', padding: '6px 10px', borderRadius: 8 }}
      onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
    >
      <ArrowLeft size={14} /> Back to Markets
    </Link>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'inherit' }}>
      <SimpleNavbar right={backLink} />

      <div style={{ display: 'flex', gap: 28, padding: '24px 40px', alignItems: 'flex-start' }}>
        {/* Left column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Market header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                {market.image
                  ? <img src={market.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (market.icon || market.iconText || '📈')}
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
                {market.question}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: C.muted }}><span style={{ color: C.text, fontWeight: 600 }}>{market.totalBet}</span> Vol.</span>
              <span style={{ color: '#333', fontSize: 12 }}>·</span>
              <span style={{ fontSize: 13, color: C.muted }}>Closes <span style={{ color: C.text }}>{new Date(market.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></span>
              <span style={{ color: '#333', fontSize: 12 }}>·</span>
              <span style={{ fontSize: 13, color: C.muted }}><span style={{ color: C.text }}>{market.comments}</span> comments</span>
              <span style={{ background: '#1a1a1a', border: '1px solid #222', color: C.muted, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.3px' }}>
                {market.category}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.accent, lineHeight: 1 }}>
                {isBinary
                  ? `YES ${bMarket!.yesPercent}%`
                  : <>{mMarket!.options[0].label} <span style={{ fontSize: 32 }}>{mMarket!.options[0].percent}%</span></>}
              </div>
              <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>
                {isBinary ? 'chance' : 'leading option'}
              </div>
            </div>
          </div>

          <ChartSection market={market} refreshKey={chartKey} />
          <ActivityTabs activity={activity} holders={holders} comments={comments} />
        </div>

        {/* Right column */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 60, alignSelf: 'flex-start' }}>
          <TradingPanel market={market} onConfirm={onBetConfirm} />
        </div>
      </div>

    </div>
  );
}
