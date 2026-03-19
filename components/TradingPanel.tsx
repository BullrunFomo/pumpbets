'use client';

import { useState } from 'react';
import bs58 from 'bs58';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Market, BinaryMarket, MultipleMarket } from '@/lib/types';
import { C, OPTION_COLORS } from '@/lib/theme';
import { useApp } from '@/context/AppContext';


export default function TradingPanel({
  market,
  onConfirm,
}: {
  market: Market;
  onConfirm: () => void;
}) {
  const { publicKey, connected, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { user, signIn } = useApp();

  const isBinary = market.type === 'binary';
  const bMarket  = isBinary ? (market as BinaryMarket) : null;
  const mMarket  = !isBinary ? (market as MultipleMarket) : null;

  const [tradeTab, setTradeTab] = useState<'Buy' | 'Sell'>('Buy');
  const [selected, setSelected] = useState<string>(isBinary ? 'YES' : mMarket!.options[0].label);
  const [amount, setAmount]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');

  const selectedPercent = isBinary
    ? selected === 'YES' ? bMarket!.yesPercent : bMarket!.noPercent
    : mMarket!.options.find((o) => o.label === selected)?.percent ?? 50;
  const multiplier = selectedPercent > 0 ? 100 / selectedPercent : 2;

  const handleConfirm = async () => {
    if (!connected || !publicKey) { setVisible(true); return; }
    if (!user) {
      try { await signIn(); } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed'); }
      return;
    }
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Enter a valid amount'); return; }

    setLoading(true);
    setError('');
    try {
      // Require Phantom signature to confirm the bet
      if (!signMessage) throw new Error('Wallet does not support message signing');
      const msgBytes = new TextEncoder().encode(
        `Confirm bet: ${num} SOL on ${selected} — market ${market.id} — ${Date.now()}`
      );
      const sigBytes = await signMessage(msgBytes);
      const txSignature = bs58.encode(sigBytes);

      const res = await fetch(`/api/markets/${market.id}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionLabel: market.type === 'binary' ? selected.toUpperCase() : selected,
          amountUsd: num,
          txSignature,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to place bet');
      }

      setSubmitted(true);
      setAmount('');
      setTimeout(() => { setSubmitted(false); onConfirm(); }, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.surface, border: '1px solid #1e1e1e', borderRadius: 12, padding: 20 }}>
      {/* Buy / Sell tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex' }}>
          {(['Buy', 'Sell'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTradeTab(t)}
              style={{
                padding: '7px 18px', paddingBottom: 9, fontSize: 14, fontWeight: 700,
                background: 'none', border: 'none', cursor: 'pointer',
                color: tradeTab === t ? (t === 'Buy' ? C.accent : C.danger) : C.dimmer,
                borderBottom: tradeTab === t ? `2px solid ${t === 'Buy' ? C.accent : C.danger}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.dim }}>
          Market <span style={{ fontSize: 10, color: C.dimmer }}>▼</span>
        </div>
      </div>

      {/* Sell — coming soon */}
      {tradeTab === 'Sell' && (
        <div style={{ padding: '10px 0 6px' }}>
          <div style={{
            borderRadius: 12,
            border: '1px solid #1e1e1e',
            background: 'linear-gradient(135deg, #0d0d0d 0%, #111 50%, #0a1a14 100%)',
            padding: '36px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glow blob */}
            <div style={{
              position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
              width: 180, height: 180,
              background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: C.accent + '12', border: `1px solid ${C.accent}30`,
              borderRadius: 20, padding: '4px 12px', marginBottom: 18,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block', boxShadow: `0 0 6px ${C.accent}` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: '1px', textTransform: 'uppercase' }}>In Development</span>
            </div>

            <div style={{
              fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 10,
              background: `linear-gradient(90deg, #fff 0%, ${C.accent} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Coming Soon
            </div>

            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>
              Sell positions via an on-chain AMM.<br />
              <span style={{ color: C.accent + 'aa' }}>Currently building.</span>
            </div>
          </div>
        </div>
      )}

      {tradeTab === 'Buy' && (
        <>
          {/* Option selector */}
          {isBinary ? (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {(['YES', 'NO'] as const).map((opt) => {
                const isSelected = selected === opt;
                const color = opt === 'YES' ? C.accent : C.danger;
                const pct   = opt === 'YES' ? bMarket!.yesPercent : bMarket!.noPercent;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      background: isSelected ? color : '#1a1a1a',
                      color: isSelected ? (opt === 'YES' ? C.bg : '#fff') : C.muted,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt === 'YES' ? 'Yes' : 'No'} {pct}¢
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {mMarket!.options.map((opt, i) => {
                const color      = OPTION_COLORS[i % 4];
                const isSelected = selected === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setSelected(opt.label)}
                    style={{
                      padding: '15px 18px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                      border: `1px solid ${isSelected ? color : '#222'}`,
                      cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? color + '20' : '#1a1a1a',
                      color: isSelected ? color : C.muted,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{opt.percent}%</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Amount input */}
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Amount (SOL)</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              placeholder="0.00"
              min="0"
              step="0.1"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#e5e5e5', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e)  => (e.target.style.borderColor = '#2a2a2a')}
            />
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[1, 5, 10, 50].map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                style={{ flex: 1, padding: '7px 0', background: amount === String(p) ? C.accent + '20' : '#1a1a1a', border: `1px solid ${amount === String(p) ? C.accent : '#2a2a2a'}`, borderRadius: 6, color: amount === String(p) ? C.accent : '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {p} SOL
              </button>
            ))}
          </div>

          {/* Payout estimate */}
          {amount && parseFloat(amount) > 0 && (
            <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#888' }}>Potential payout</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
                ~{(parseFloat(amount) * multiplier).toFixed(2)} SOL
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#ef444420', border: '1px solid #ef444450', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '14px', background: C.accent + '20', border: `1px solid ${C.accent}50`, borderRadius: 10, color: C.accent, fontWeight: 700 }}>
              ✓ Bet placed!
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#00a876' : C.accent, border: 'none', borderRadius: 10, color: C.bg, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = C.accentHover; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = C.accent; }}
            >
              {loading ? 'Confirming…' : connected ? `Buy ${selected}` : 'Connect Wallet to Bet'}
            </button>
          )}

          <p style={{ margin: '10px 0 0', fontSize: 11, color: C.dimmer, textAlign: 'center' }}>
            By trading, you agree to the Terms of Use.
          </p>
        </>
      )}
    </div>
  );
}
