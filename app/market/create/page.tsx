'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import CrownLogo from '@/components/CrownLogo';

const CATEGORIES = ['Crypto', 'PumpFun', 'Memes', 'Business'];

export default function CreateMarketPage() {
  const [question, setQuestion]   = useState('');
  const [type, setType]           = useState<'binary' | 'multiple'>('binary');
  const [category, setCategory]   = useState('Crypto');
  const [image, setImage]         = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [options, setOptions]     = useState(['', '']);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const addOption    = () => setOptions([...options, '']);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const setOption    = (i: number, val: string) => setOptions(options.map((o, idx) => idx === i ? val : o));

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#141414', border: '1px solid #222', borderRadius: 8,
    padding: '10px 14px', color: '#e5e5e5', fontSize: 14, outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: '#666', display: 'block', marginBottom: 6,
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#e5e5e5' }}>
      {/* Navbar */}
      <nav style={{ background: '#111', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <CrownLogo size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#01e29e' }}>pump</span><span style={{ color: '#e5e5e5' }}>bets</span>
            </span>
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span style={{ fontSize: 14, color: '#666' }}>Create Market</span>
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px 100px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-1px' }}>Create a Market</h1>
        <p style={{ fontSize: 14, color: '#555', margin: '0 0 40px' }}>Ask a question the market will resolve.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Question */}
          <div>
            <label style={labelStyle}>Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will BTC reach $200k by end of 2026?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={(e) => (e.target.style.borderColor = '#01e29e')}
              onBlur={(e)  => (e.target.style.borderColor = '#222')}
            />
          </div>

          {/* Type */}
          <div>
            <label style={labelStyle}>Market Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['binary', 'multiple'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${type === t ? '#01e29e' : '#222'}`, background: type === t ? 'rgba(1,226,158,0.08)' : '#141414', color: type === t ? '#01e29e' : '#888', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  {t === 'binary' ? 'YES / NO' : 'Multiple Choice'}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${category === c ? '#01e29e' : '#222'}`, background: category === c ? 'rgba(1,226,158,0.08)' : '#141414', color: category === c ? '#01e29e' : '#888', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Options (multiple only) */}
          {type === 'multiple' && (
            <div>
              <label style={labelStyle}>Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={(e) => (e.target.style.borderColor = '#01e29e')}
                      onBlur={(e)  => (e.target.style.borderColor = '#222')}
                    />
                    {options.length > 2 && (
                      <button onClick={() => removeOption(i)} style={{ background: 'none', border: '1px solid #222', borderRadius: 8, color: '#666', cursor: 'pointer', padding: '0 12px' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 8 && (
                  <button
                    onClick={addOption}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed #2a2a2a', borderRadius: 8, color: '#555', cursor: 'pointer', padding: '9px 14px', fontSize: 13 }}
                  >
                    <Plus size={13} /> Add option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Expiry */}
          <div>
            <label style={labelStyle}>Expiry Date</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={(e) => (e.target.style.borderColor = '#01e29e')}
              onBlur={(e)  => (e.target.style.borderColor = '#222')}
            />
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>Image URL <span style={{ color: '#444', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/myimage.png or https://..."
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#01e29e')}
              onBlur={(e)  => (e.target.style.borderColor = '#222')}
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowComingSoon(true)}
            style={{ padding: '14px', background: '#01e29e', border: 'none', borderRadius: 10, color: '#080808', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00c98b')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#01e29e')}
          >
            Coming Soon!
          </button>
        </div>
      </div>

      {/* Coming Soon modal */}
      {showComingSoon && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
          onClick={() => setShowComingSoon(false)}
        >
          <div
            style={{ background: '#111111', border: '1px solid #222', borderRadius: 16, padding: '40px 52px', textAlign: 'center', boxShadow: '0 0 40px rgba(1,226,158,0.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: 32, margin: 0 }}>🚧</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#e5e5e5', margin: '12px 0 6px' }}>Coming Soon!</p>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Market creation is under development</p>
            <button
              onClick={() => setShowComingSoon(false)}
              style={{ marginTop: 24, padding: '8px 28px', borderRadius: 8, background: '#01e29e', color: '#080808', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
