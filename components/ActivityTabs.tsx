'use client';

import { useState } from 'react';
import { C, OPTION_COLORS } from '@/lib/theme';

type Tab = 'Recent Activity' | 'Holders' | 'Comments';

export interface ActivityRow {
  user: string; action: string; outcome: string; isYes: boolean; amount: string; date: string;
}
export interface HolderRow {
  user: string; outcome: string; shares: number; value: string;
}
export interface CommentRow {
  user: string; text: string; likes: number; date: string;
}

const TABS: Tab[] = ['Recent Activity', 'Holders', 'Comments'];

function outcomeColor(outcome: string) {
  return outcome === 'YES' ? C.accent : outcome === 'NO' ? C.danger : C.text;
}


export default function ActivityTabs({
  activity,
  holders,
  comments,
}: {
  activity: ActivityRow[];
  holders: HolderRow[];
  comments: CommentRow[];
}) {
  const [tab, setTab] = useState<Tab>('Recent Activity');

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Tab row */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none',
              color: tab === t ? C.text : C.dim,
              borderBottom: tab === t ? `2px solid ${C.accent}` : '2px solid transparent',
              marginBottom: '-1px', transition: 'color 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Recent Activity' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 160px 140px 150px', padding: '10px 20px', borderBottom: `1px solid ${C.border}` }}>
            {['USER', 'ACTION', 'OUTCOME', 'AMOUNT', 'DATE'].map((h) => (
              <span key={h} style={{ fontSize: 11, color: C.dimmer, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: h === 'DATE' ? 'right' : 'left' }}>
                {h}
              </span>
            ))}
          </div>
          {activity.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.dimmer, fontSize: 13 }}>No trades yet</div>
          )}
          {activity.map((row, i) => (
            <div
              key={i}
              style={{ display: 'grid', gridTemplateColumns: '1fr 130px 160px 140px 150px', padding: '11px 20px', alignItems: 'center', borderBottom: i < activity.length - 1 ? '1px solid #111' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#111')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>{row.user}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{row.action}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: outcomeColor(row.outcome) }}>{row.outcome}</span>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{row.amount}</span>
              <span style={{ fontSize: 12, color: C.dim, textAlign: 'right' }}>{row.date}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Holders' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 90px', padding: '10px 20px', borderBottom: `1px solid ${C.border}` }}>
            {['USER', 'POSITION', 'SHARES', 'VALUE'].map((h) => (
              <span key={h} style={{ fontSize: 11, color: C.dimmer, fontWeight: 600, letterSpacing: '0.5px' }}>{h}</span>
            ))}
          </div>
          {holders.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.dimmer, fontSize: 13 }}>No holders yet</div>
          )}
          {holders.map((row, i) => (
            <div
              key={i}
              style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 90px', padding: '11px 20px', alignItems: 'center', borderBottom: i < holders.length - 1 ? '1px solid #111' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#111')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>{row.user}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: outcomeColor(row.outcome) }}>{row.outcome}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{row.shares}</span>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Comments' && (
        <div style={{ padding: '8px 0' }}>
          {comments.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.dimmer, fontSize: 13 }}>No comments yet</div>
          )}
          {comments.map((c, i) => (
            <div
              key={i}
              style={{ padding: '14px 20px', borderBottom: i < comments.length - 1 ? '1px solid #111' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#111')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: OPTION_COLORS[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {c.user.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>{c.user}</span>
                  <span style={{ fontSize: 11, color: C.dimmer }}>{c.date}</span>
                </div>
                <span style={{ fontSize: 12, color: C.dim }}>♥ {c.likes}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.textSoft, lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
