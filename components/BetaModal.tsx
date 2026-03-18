'use client';

import { useEffect, useState } from 'react';

export default function BetaModal() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('beta_dismissed')) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem('beta_dismissed', '1');
      setVisible(false);
      setClosing(false);
    }, 300);
  }

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(16px) scale(0.97); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(1,226,158,0.15); }
          50%       { box-shadow: 0 0 0 8px rgba(1,226,158,0); }
        }
        .beta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(1,226,158,0.1);
          border: 1px solid rgba(1,226,158,0.3);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #01e29e;
          text-transform: uppercase;
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        .beta-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #01e29e;
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        .beta-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .beta-btn:active { transform: translateY(0); }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          animation: `${closing ? 'fadeOut' : 'fadeIn'} 0.3s ease forwards`,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 100%)',
            border: '1px solid #242424',
            borderRadius: 20,
            padding: '40px 36px 32px',
            maxWidth: 400,
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 0 0 1px rgba(1,226,158,0.06), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(1,226,158,0.05)',
            pointerEvents: 'auto',
            animation: `${closing ? 'slideDown' : 'slideUp'} 0.3s cubic-bezier(0.22,1,0.36,1) forwards`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* subtle top glow strip */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(1,226,158,0.5), transparent)',
          }} />

          <div className="beta-badge">
            <span className="beta-badge-dot" />
            Beta
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Welcome to<br />
              <span style={{ color: '#01e29e' }}>pump</span>bets
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>
              This platform is in early beta and is currently live on the{' '}
              <span style={{
                color: '#01e29e', fontWeight: 600,
                background: 'rgba(1,226,158,0.08)',
                padding: '1px 6px', borderRadius: 4,
              }}>
                Solana Devnet
              </span>
              . No real funds are at risk — use devnet SOL to explore the markets.
            </p>
          </div>

          <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, #222, transparent)' }} />

          <button
            className="beta-btn"
            onClick={dismiss}
            style={{
              background: '#01e29e',
              border: 'none',
              borderRadius: 12,
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 700,
              color: '#080808',
              cursor: 'pointer',
              width: '100%',
              transition: 'opacity 0.15s, transform 0.15s',
              letterSpacing: '0.2px',
            }}
          >
            Let's go →
          </button>
        </div>
      </div>
    </>
  );
}
