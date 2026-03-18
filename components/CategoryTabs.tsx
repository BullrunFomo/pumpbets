'use client';

import { Category } from '@/lib/types';

const CATEGORIES: Category[] = ['All', 'Crypto', 'PumpFun', 'Memes', 'Business'];

interface CategoryTabsProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: active === cat ? '2px solid #01e29e' : '2px solid transparent',
            color: active === cat ? '#01e29e' : '#888',
            fontSize: 14,
            fontWeight: active === cat ? 600 : 400,
            padding: '12px 16px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (active !== cat) e.currentTarget.style.color = '#ccc';
          }}
          onMouseLeave={(e) => {
            if (active !== cat) e.currentTarget.style.color = '#888';
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
