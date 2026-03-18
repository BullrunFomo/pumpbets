'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft } from 'lucide-react';
import CrownLogo from './CrownLogo';
import type { LeaderboardEntry } from '@/lib/db/leaderboard';

const TRADERS = [
  { name: 'whale_dao',      initials: 'WH', color: '#3b82f6', profit: 48250, winRate: 78, trades: 142, bestWin: 12500 },
  { name: 'pred_whale',     initials: 'PR', color: '#f59e0b', profit: 31800, winRate: 71, trades: 89,  bestWin: 8400  },
  { name: 'alice.eth',      initials: 'AL', color: '#a855f7', profit: 24600, winRate: 69, trades: 201, bestWin: 6200  },
  { name: '0xb3f2',         initials: 'XB', color: '#3b82f6', profit: 19200, winRate: 65, trades: 76,  bestWin: 5800  },
  { name: 'cryptoking',     initials: 'CR', color: '#ef4444', profit: 15700, winRate: 62, trades: 115, bestWin: 4300  },
  { name: 'marco_t',        initials: 'MA', color: '#a855f7', profit: 12400, winRate: 58, trades: 93,  bestWin: 3900  },
  { name: 'moon_bet',       initials: 'MO', color: '#f59e0b', profit: 9800,  winRate: 61, trades: 67,  bestWin: 2700  },
  { name: 'degen_pro',      initials: 'DE', color: '#01e29e', profit: 7600,  winRate: 55, trades: 188, bestWin: 2100  },
  { name: 'sara.k',         initials: 'SA', color: '#3b82f6', profit: 6200,  winRate: 54, trades: 44,  bestWin: 1800  },
  { name: 'pump_lord',      initials: 'PL', color: '#ef4444', profit: 4100,  winRate: 51, trades: 31,  bestWin: 1200  },
  { name: 'sol_maxi',       initials: 'SM', color: '#06b6d4', profit: 3850,  winRate: 50, trades: 58,  bestWin: 1100  },
  { name: 'trencher99',     initials: 'TR', color: '#84cc16', profit: 3500,  winRate: 53, trades: 72,  bestWin: 980   },
  { name: 'vega_x',         initials: 'VX', color: '#ec4899', profit: 3200,  winRate: 49, trades: 104, bestWin: 870   },
  { name: 'jelly_fish',     initials: 'JF', color: '#f59e0b', profit: 2950,  winRate: 48, trades: 39,  bestWin: 820   },
  { name: '0xdeadbeef',     initials: 'OX', color: '#a855f7', profit: 2700,  winRate: 52, trades: 61,  bestWin: 760   },
  { name: 'hype_trader',    initials: 'HT', color: '#3b82f6', profit: 2450,  winRate: 47, trades: 85,  bestWin: 700   },
  { name: 'neet_lord',      initials: 'NL', color: '#ef4444', profit: 2200,  winRate: 46, trades: 47,  bestWin: 650   },
  { name: 'sol_surfer',     initials: 'SS', color: '#01e29e', profit: 2000,  winRate: 51, trades: 92,  bestWin: 600   },
  { name: 'pumpville_g',    initials: 'PV', color: '#84cc16', profit: 1850,  winRate: 45, trades: 34,  bestWin: 540   },
  { name: 'rick.sol',       initials: 'RS', color: '#06b6d4', profit: 1700,  winRate: 49, trades: 53,  bestWin: 490   },
  { name: 'ape_strong',     initials: 'AS', color: '#ec4899', profit: 1560,  winRate: 44, trades: 78,  bestWin: 450   },
  { name: 'memelord420',    initials: 'ML', color: '#f59e0b', profit: 1420,  winRate: 47, trades: 66,  bestWin: 400   },
  { name: 'wojak_chad',     initials: 'WC', color: '#a855f7', profit: 1300,  winRate: 43, trades: 29,  bestWin: 370   },
  { name: 'trenches_g',     initials: 'TG', color: '#3b82f6', profit: 1180,  winRate: 46, trades: 41,  bestWin: 340   },
  { name: 'lfg_anon',       initials: 'LA', color: '#ef4444', profit: 1060,  winRate: 42, trades: 55,  bestWin: 310   },
  { name: 'pepe_staker',    initials: 'PS', color: '#84cc16', profit: 950,   winRate: 45, trades: 37,  bestWin: 280   },
  { name: 'alpha_seeker',   initials: 'AP', color: '#06b6d4', profit: 860,   winRate: 41, trades: 63,  bestWin: 250   },
  { name: 'degen_anon7',    initials: 'DA', color: '#ec4899', profit: 770,   winRate: 40, trades: 48,  bestWin: 230   },
  { name: 'chad_wagmi',     initials: 'CW', color: '#01e29e', profit: 690,   winRate: 44, trades: 22,  bestWin: 200   },
  { name: 'based_guy',      initials: 'BG', color: '#f59e0b', profit: 620,   winRate: 39, trades: 71,  bestWin: 180   },
  { name: 'notfinancial',   initials: 'NF', color: '#a855f7', profit: 555,   winRate: 42, trades: 33,  bestWin: 165   },
  { name: 'rekt_recovery',  initials: 'RR', color: '#3b82f6', profit: 490,   winRate: 38, trades: 89,  bestWin: 145   },
  { name: 'solana_bro',     initials: 'SB', color: '#ef4444', profit: 430,   winRate: 41, trades: 27,  bestWin: 130   },
  { name: 'gm_forever',     initials: 'GM', color: '#84cc16', profit: 370,   winRate: 37, trades: 44,  bestWin: 110   },
  { name: 'hodl_hard',      initials: 'HH', color: '#06b6d4', profit: 320,   winRate: 40, trades: 19,  bestWin: 95    },
  { name: 'pumpfun_pro',    initials: 'FP', color: '#ec4899', profit: 270,   winRate: 36, trades: 52,  bestWin: 80    },
  { name: 'anon_quant',     initials: 'AQ', color: '#01e29e', profit: 225,   winRate: 39, trades: 31,  bestWin: 70    },
  { name: 'wagmi_always',   initials: 'WA', color: '#f59e0b', profit: 185,   winRate: 35, trades: 40,  bestWin: 58    },
  { name: 'sir_degen',      initials: 'SD', color: '#a855f7', profit: 150,   winRate: 38, trades: 26,  bestWin: 48    },
  { name: 'yolo_master',    initials: 'YM', color: '#3b82f6', profit: 120,   winRate: 34, trades: 60,  bestWin: 38    },
  { name: 'fren_zone',      initials: 'FZ', color: '#ef4444', profit: 95,    winRate: 37, trades: 17,  bestWin: 30    },
  { name: 'lucky_ape',      initials: 'LU', color: '#84cc16', profit: 74,    winRate: 33, trades: 35,  bestWin: 24    },
  { name: 'bruh_moment',    initials: 'BM', color: '#06b6d4', profit: 58,    winRate: 36, trades: 22,  bestWin: 18    },
  { name: 'ser_plz',        initials: 'SP', color: '#ec4899', profit: 44,    winRate: 32, trades: 14,  bestWin: 14    },
  { name: 'gm_gn_nfa',      initials: 'GG', color: '#01e29e', profit: 32,   winRate: 35, trades: 28,  bestWin: 10    },
  { name: 'ngmi_maybe',     initials: 'NG', color: '#f59e0b', profit: 22,    winRate: 31, trades: 11,  bestWin: 7     },
  { name: 'fomo_buyer',     initials: 'FB', color: '#a855f7', profit: 14,    winRate: 30, trades: 19,  bestWin: 5     },
  { name: 'cope_seethe',    initials: 'CS', color: '#3b82f6', profit: 8,     winRate: 29, trades: 8,   bestWin: 3     },
  { name: 'just_vibes',     initials: 'JV', color: '#ef4444', profit: 4,     winRate: 28, trades: 6,   bestWin: 2     },
  { name: 'anon_zero',      initials: 'AZ', color: '#84cc16', profit: 1,     winRate: 27, trades: 3,   bestWin: 1     },
];

type TimePeriod = 'All Time' | 'This Month' | 'This Week';

function Avatar({ initials, color, size = 44 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.25),
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700,
      fontSize: size * 0.33, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function PodiumCard({ trader, rank }: { trader: typeof TRADERS[0]; rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  const accentColor = rank === 1 ? '#01e29e' : rank === 2 ? '#00a86b' : '#006e46';
  const cardClass = `podium-card ${rank === 1 ? 'podium-gold' : rank === 2 ? 'podium-silver' : 'podium-bronze'}`;

  return (
    <div
      className={cardClass}
      style={{
        padding: '20px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        minWidth: 200,
        position: 'relative',
        transform: rank === 1 ? 'translateY(-24px)' : 'none',
      }}
    >
      <span style={{ position: 'absolute', top: 10, right: 14, fontSize: 11, color: accentColor, fontWeight: 600 }}>
        {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
      </span>
      <span style={{ fontSize: 22 }}>{medal}</span>
      <Avatar initials={trader.initials} color={trader.color} size={52} />
      <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5' }}>{trader.name}</span>
      <span style={{ fontSize: 20, fontWeight: 800, color: accentColor }}>${trader.profit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
      <span style={{ fontSize: 12, color: '#666' }}>{trader.winRate}% win rate · {trader.trades} trades</span>
    </div>
  );
}

export default function Leaderboard({ dbEntries }: { dbEntries?: LeaderboardEntry[] | null }) {
  const [period, setPeriod] = useState<TimePeriod>('All Time');
  const periods: TimePeriod[] = ['All Time', 'This Month', 'This Week'];

  // Use real DB data when available, else fall back to static TRADERS
  const traders = dbEntries && dbEntries.length > 0
    ? dbEntries.map((e) => ({
        name:     e.username ?? e.walletAddress.slice(0, 8) + '…',
        initials: (e.username ?? e.walletAddress).slice(0, 2).toUpperCase(),
        color:    e.avatarColor,
        profit:   e.profit,
        winRate:  e.winRate,
        trades:   e.trades,
        bestWin:  e.bestWin,
      }))
    : TRADERS;

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: '#080808', color: '#e5e5e5' }}>
      {/* Navbar */}
      <nav style={{ background: '#111111', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <CrownLogo size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}><span style={{ color: '#01e29e' }}>pump</span><span style={{ color: '#e5e5e5' }}>bets</span></span>
          </Link>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', textDecoration: 'none', padding: '6px 10px', borderRadius: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e5e5e5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            <ArrowLeft size={14} />
            Back to Markets
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={28} color="#01e29e" />
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#e5e5e5' }}>Leaderboard</h1>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#555' }}>Ranked by total profit · {period.toLowerCase()}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: period === p ? '#1a1a1a' : 'transparent',
                  color: period === p ? '#e5e5e5' : '#666',
                  outline: period === p ? '1px solid #333' : '1px solid transparent',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'flex-end', marginBottom: 52 }}>
          <PodiumCard trader={traders[1]} rank={2} />
          <PodiumCard trader={traders[0]} rank={1} />
          <PodiumCard trader={traders[2]} rank={3} />
        </div>

        {/* Table */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 110px 230px 90px 110px',
            padding: '10px 20px', borderBottom: '1px solid #1a1a1a',
          }}>
            {['#', 'TRADER', 'PROFIT', 'WIN RATE', 'TRADES', 'BEST WIN'].map((h) => (
              <span key={h} style={{ fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: '0.5px' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {traders.map((trader, i) => (
            <div
              key={trader.name}
              style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 110px 230px 90px 110px',
                padding: '12px 20px', alignItems: 'center',
                borderBottom: i < traders.length - 1 ? '1px solid #111' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#151515')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: i === 0 ? '#01e29e' : i === 1 ? '#00a86b' : i === 2 ? '#006e46' : '#444',
              }}>
                {i + 1}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={trader.initials} color={trader.color} size={30} />
                <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{trader.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#01e29e' }}>${trader.profit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#1e1e1e', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${trader.winRate}%`, background: '#01e29e', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, color: '#888', minWidth: 28 }}>{trader.winRate}%</span>
              </div>
              <span style={{ fontSize: 13, color: '#666' }}>{trader.trades}</span>
              <span style={{ fontSize: 13, color: '#e5e5e5', fontWeight: 500 }}>${trader.bestWin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
