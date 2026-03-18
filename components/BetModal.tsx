'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Market, BinaryMarket, MultipleMarket } from '@/lib/types';
import { buildPlaceBet, fetchMarket } from '@/lib/solana/client';

interface BetModalProps {
  market: Market;
  option: string;
  onClose: () => void;
  onConfirm: () => void;
}

/** Extract a stable u64 from the Supabase market ID string. */
function toChainId(marketId: string): bigint {
  const n = parseInt(marketId, 10);
  if (!isNaN(n)) return BigInt(n);
  const match = marketId.match(/\d+/);
  return match ? BigInt(match[0]) : BigInt(0);
}

/** Map an option label to its 0-based index in the on-chain bets array. */
function optionIndex(market: Market, option: string): number {
  if (market.type === 'binary') return option.toUpperCase() === 'YES' ? 0 : 1;
  const idx = (market as MultipleMarket).options.findIndex(
    (o) => o.label.toLowerCase() === option.toLowerCase()
  );
  return Math.max(0, idx);
}

export default function BetModal({ market, option, onClose, onConfirm }: BetModalProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [amount, setAmount]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const isYes       = option.toLowerCase() === 'yes';
  const isNo        = option.toLowerCase() === 'no';
  const optionColor = isYes ? '#01e29e' : isNo ? '#ef4444' : '#01e29e';

  let optionPercent = 50;
  if (market.type === 'binary') {
    optionPercent = isYes ? (market as BinaryMarket).yesPercent : (market as BinaryMarket).noPercent;
  } else {
    const opt = (market as MultipleMarket).options.find(
      (o) => o.label.toLowerCase() === option.toLowerCase()
    );
    optionPercent = opt?.percent ?? 50;
  }
  const multiplier = optionPercent > 0 ? 100 / optionPercent : 2;

  const handleConfirm = async () => {
    if (!connected || !publicKey) { setVisible(true); return; }

    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Enter a valid amount'); return; }

    setLoading(true);
    setError('');
    try {
      // 0. Pre-flight: verify market is initialized on-chain
      const chainMarketId = toChainId(market.id);
      const onChain = await fetchMarket(connection, chainMarketId);
      if (!onChain) throw new Error('Market not yet initialized on-chain. Ask the admin to initialize it first.');
      if (onChain.resolved) throw new Error('This market has already been resolved.');
      if (Date.now() / 1000 > onChain.expiry) throw new Error('This market has expired.');

      // 1. On-chain transaction
      const optIdx = optionIndex(market, option);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = await buildPlaceBet(connection, publicKey, chainMarketId, optIdx, num);
      tx.recentBlockhash = blockhash;

      // Simulate first to surface a readable Anchor error
      const sim = await connection.simulateTransaction(tx);
      if (sim.value.err) {
        const anchor = sim.value.logs?.find((l) => l.includes('Error Message:'));
        const msg = anchor ? anchor.replace(/.*Error Message:\s*/, '') : (sim.value.logs?.find((l) => l.startsWith('Program log:'))?.replace('Program log: ', '') ?? 'Transaction would fail on-chain');
        throw new Error(msg);
      }

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');

      // 2. Record in Supabase
      const res = await fetch(`/api/markets/${market.id}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionLabel: option.toUpperCase(), amountUsd: num, txSignature: sig }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Bet recorded on-chain but failed to save to DB');
      }

      setSubmitted(true);
      setTimeout(() => { onConfirm(); onClose(); }, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const presets = [1, 5, 10, 50];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e5e5e5' }}>Place Bet</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Market */}
        <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{market.question}</p>
        </div>

        {/* Option */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Betting on</span>
          <span style={{ display: 'inline-block', background: optionColor + '20', border: `1px solid ${optionColor}50`, color: optionColor, fontWeight: 700, fontSize: 14, padding: '5px 14px', borderRadius: 8 }}>
            {option.toUpperCase()}
          </span>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Amount (SOL)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            placeholder="0.00"
            min="0"
            step="0.1"
            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#e5e5e5', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => (e.target.style.borderColor = '#01e29e')}
            onBlur={(e)  => (e.target.style.borderColor = '#2a2a2a')}
          />
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(String(p))}
              style={{ flex: 1, padding: '7px 0', background: amount === String(p) ? '#01e29e20' : '#1a1a1a', border: `1px solid ${amount === String(p) ? '#01e29e' : '#2a2a2a'}`, borderRadius: 6, color: amount === String(p) ? '#01e29e' : '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {p} SOL
            </button>
          ))}
        </div>

        {/* Payout estimate */}
        {amount && parseFloat(amount) > 0 && (
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#888' }}>Potential payout</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#01e29e' }}>
              ~{(parseFloat(amount) * multiplier).toFixed(2)} SOL
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#ef444420', border: '1px solid #ef444450', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '14px', background: '#01e29e20', border: '1px solid #01e29e50', borderRadius: 10, color: '#01e29e', fontWeight: 700 }}>
            ✓ Bet placed!
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#00a876' : '#01e29e', border: 'none', borderRadius: 10, color: '#080808', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#00c98b'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#01e29e'; }}
          >
            {loading ? 'Confirming…' : connected ? 'Confirm Bet' : 'Connect Wallet to Bet'}
          </button>
        )}
      </div>
    </div>
  );
}
