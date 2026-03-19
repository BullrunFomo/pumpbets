'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Market, BinaryMarket, MultipleMarket } from '@/lib/types';
import { C } from '@/lib/theme';

export default function MarketCard({
  market,
  onBet,
}: {
  market: Market;
  onBet: (marketId: string, option: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const isBinary = market.type === 'binary';
  const bMarket  = isBinary ? (market as BinaryMarket) : null;
  const mMarket  = !isBinary ? (market as MultipleMarket) : null;

  return (
    <div
      style={{
        background: hovered ? C.cardHover : C.card,
        boxShadow: hovered ? '0 0 20px rgba(1,226,158,0.2), 0 0 50px rgba(1,226,158,0.08)' : 'none',
        borderRadius: 12, padding: 12, cursor: 'pointer',
        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'box-shadow 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push('/market/' + market.id)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, overflow: 'hidden' }}>
          {market.image
            ? <img src={market.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (market.icon || market.iconText || (isBinary ? '📈' : '🗳️'))}
        </div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
          {market.question}
        </p>
      </div>

      {/* Middle */}
      {isBinary ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>YES {bMarket!.yesPercent}%</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>NO {bMarket!.noPercent}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: '#222', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${bMarket!.yesPercent}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.accentHover})`, borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-yes" style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); onBet(market.id, 'yes'); }}>
              Bet Yes ↑
            </button>
            <button className="btn-no" style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); onBet(market.id, 'no'); }}>
              Bet No ↓
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {mMarket!.options.map((opt) => (
            <div key={opt.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
              <span style={{ fontSize: 14, color: '#ccc', flex: 1 }}>{opt.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text, minWidth: 32, textAlign: 'right' }}>{opt.percent}%</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onBet(market.id, opt.label); }}
                  style={{ background: C.accent, color: C.bg, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.accentHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = C.accent)}
                >
                  Bet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Volume: {market.totalBet}</span>
          <img src="/sol.svg" alt="SOL" style={{ width: 11, height: 11 }} />
        </span>
      </div>
    </div>
  );
}
