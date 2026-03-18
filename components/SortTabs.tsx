'use client';

import { SortOption } from '@/lib/types';
import { TrendingUp, Sparkles, BarChart2, Clock } from 'lucide-react';

const SORTS: { label: SortOption; icon: React.ReactNode }[] = [
  { label: 'Trending', icon: <TrendingUp size={13} /> },
  { label: 'New', icon: <Sparkles size={13} /> },
  { label: 'Volume', icon: <BarChart2 size={13} /> },
  { label: 'Expiring', icon: <Clock size={13} /> },
];

interface SortTabsProps {
  active: SortOption;
  onChange: (sort: SortOption) => void;
}

export default function SortTabs({ active, onChange }: SortTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {SORTS.map(({ label, icon }) => (
        <button
          key={label}
          onClick={() => onChange(label)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 14px',
            borderRadius: 8,
            background: active === label ? '#1a1a1a' : 'transparent',
            border: `1px solid ${active === label ? '#2a2a2a' : 'transparent'}`,
            color: active === label ? '#e5e5e5' : '#888',
            fontSize: 13,
            fontWeight: active === label ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (active !== label) e.currentTarget.style.color = '#ccc';
          }}
          onMouseLeave={(e) => {
            if (active !== label) e.currentTarget.style.color = '#888';
          }}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
