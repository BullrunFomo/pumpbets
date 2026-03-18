'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Market, BinaryMarket, MultipleMarket } from '@/lib/types';
import { ChartPoint } from '@/lib/mocks';
import { C, OPTION_COLORS } from '@/lib/theme';

const TIME_RANGES = ['1H', '6H', '1D', '1W', '1M', 'ALL'];
const SVG_W = 580, SVG_H = 220;

type PriceRecord = {
  yes_percent:     number | null;
  no_percent:      number | null;
  option_percents: { label: string; percent: number }[] | null;
  recorded_at:     string;
};


function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textSoft }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

type Seg = { p0: ChartPoint; cp1x: number; cp1y: number; cp2x: number; cp2y: number; p1: ChartPoint };

function buildSegs(pts: ChartPoint[]): Seg[] {
  if (pts.length < 2) return [];
  const T = 0.25;
  const cy = (y: number) => Math.max(0, Math.min(SVG_H, y));
  return pts.slice(0, -1).map((_, i) => {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    return { p0: p1, cp1x: p1.x + (p2.x - p0.x) * T, cp1y: cy(p1.y + (p2.y - p0.y) * T),
              cp2x: p2.x - (p3.x - p1.x) * T, cp2y: cy(p2.y - (p3.y - p1.y) * T), p1: p2 };
  });
}

function segsToPath(pts: ChartPoint[], segs: Seg[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (const s of segs)
    d += ` C ${s.cp1x.toFixed(1)} ${s.cp1y.toFixed(1)}, ${s.cp2x.toFixed(1)} ${s.cp2y.toFixed(1)}, ${s.p1.x.toFixed(1)} ${s.p1.y.toFixed(1)}`;
  return d;
}

function bez1(a: number, b: number, c: number, d: number, t: number) {
  const u = 1 - t;
  return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
}

function bezierAt(pts: ChartPoint[], segs: Seg[], svgX: number): ChartPoint {
  if (pts.length === 0) return { x: svgX, y: SVG_H / 2, pct: 50 };
  if (svgX <= pts[0].x) return { ...pts[0], x: svgX };
  if (svgX >= pts[pts.length - 1].x) return { ...pts[pts.length - 1], x: svgX };
  // For 2-point (flat line), linear is exact
  if (segs.length === 0) {
    const t = (svgX - pts[0].x) / (pts[pts.length - 1].x - pts[0].x);
    return { x: svgX, y: pts[0].y + (pts[pts.length - 1].y - pts[0].y) * t, pct: pts[0].pct + (pts[pts.length - 1].pct - pts[0].pct) * t };
  }
  // Find which segment contains svgX
  const seg = segs.find((s) => svgX >= s.p0.x && svgX <= s.p1.x) ?? segs[segs.length - 1];
  // Bisect to find t where bezier x == svgX
  let lo = 0, hi = 1;
  for (let k = 0; k < 32; k++) {
    const mid = (lo + hi) / 2;
    if (bez1(seg.p0.x, seg.cp1x, seg.cp2x, seg.p1.x, mid) < svgX) lo = mid; else hi = mid;
  }
  const t = (lo + hi) / 2;
  const y = bez1(seg.p0.y, seg.cp1y, seg.cp2y, seg.p1.y, t);
  const pct = Math.max(0, Math.min(100, (SVG_H - y) / SVG_H * 100));
  return { x: svgX, y, pct };
}

function recordsToPoints(records: PriceRecord[], getValue: (r: PriceRecord) => number): ChartPoint[] {
  const n = records.length;
  if (n === 0) return [];
  return records.map((r, i) => {
    const pct = Math.max(0, Math.min(100, getValue(r)));
    return { x: (i / Math.max(n - 1, 1)) * SVG_W, y: SVG_H - (pct / 100) * SVG_H, pct };
  });
}

export default function ChartSection({ market, refreshKey = 0 }: { market: Market; refreshKey?: number }) {
  const [timeRange, setTimeRange] = useState('ALL');
  const [hoverX, setHoverX]       = useState<number | null>(null);
  const [records, setRecords]     = useState<PriceRecord[] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isBinary = market.type === 'binary';
  const bMarket  = isBinary ? (market as BinaryMarket) : null;
  const mMarket  = !isBinary ? (market as MultipleMarket) : null;

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`/api/markets/${market.id}/price-history?range=${timeRange}`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => { if (!cancelled) setRecords(Array.isArray(data) ? data : []); })
        .catch(() => { if (!cancelled) setRecords([]); });
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [market.id, timeRange, refreshKey]);

  // Flat line at a given % for when there's no history yet
  function flatPoints(pct: number): ChartPoint[] {
    const y = SVG_H - (pct / 100) * SVG_H;
    return [{ x: 0, y, pct }, { x: SVG_W, y, pct }];
  }

  const hasRealData = records !== null && records.length >= 2;

  const rawSeries = isBinary
    ? [
        { label: 'YES', color: C.accent,  pts: hasRealData ? recordsToPoints(records!, (r) => r.yes_percent ?? 50) : flatPoints(bMarket!.yesPercent) },
        { label: 'NO',  color: C.danger,  pts: hasRealData ? recordsToPoints(records!, (r) => r.no_percent  ?? 50) : flatPoints(bMarket!.noPercent)  },
      ]
    : mMarket!.options.map((opt, i) => ({
        label: opt.label,
        color: OPTION_COLORS[i % OPTION_COLORS.length] ?? '#888',
        pts: hasRealData
          ? recordsToPoints(records!, (r) => r.option_percents?.find((o) => o.label.toLowerCase() === opt.label.toLowerCase())?.percent ?? 0)
          : flatPoints(opt.percent > 0 ? opt.percent : 100 / mMarket!.options.length),
      }));
  const series = rawSeries.map((s) => ({ ...s, segs: buildSegs(s.pts) }));

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const svgX = (rawX / rect.width) * SVG_W;
    setHoverX(Math.max(0, Math.min(SVG_W, svgX)));
  }, []);

  const hoverData = hoverX !== null
    ? series.map((s) => ({ label: s.label, color: s.color, pt: bezierAt(s.pts, s.segs, hoverX) }))
    : null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {series.map((s) => <LegendDot key={s.label} color={s.color} label={s.label} />)}
      </div>

      {/* SVG chart */}
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="240"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="none"
          style={{ display: 'block', cursor: 'crosshair', overflow: 'hidden' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverX(null)}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const y = (SVG_H - frac * SVG_H).toFixed(1);
            return <line key={frac} x1="0" y1={y} x2={SVG_W} y2={y} stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4 4" />;
          })}
          <text x={SVG_W - 8} y={112} fontSize="9" fill={C.dimmer} textAnchor="end"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">50%</text>

          {/* Series paths */}
          {series.map((s) => (
            s.pts.length >= 2 && (
              <g key={s.label}>
                <path
                  d={segsToPath(s.pts, s.segs)}
                  stroke={s.color} strokeWidth="2" fill="none"
                />
              </g>
            )
          ))}

          {/* Hover crosshair */}
          {hoverX !== null && hoverData && (
            <line x1={hoverX} y1={0} x2={hoverX} y2={SVG_H} stroke="#ffffff" strokeWidth="1" strokeOpacity={0.15} />
          )}
        </svg>

        {/* Dots — HTML so they stay perfectly round despite SVG stretching */}
        {hoverX !== null && hoverData && hoverData.map((d) => (
          <div key={d.label} style={{
            position: 'absolute',
            left: `${(d.pt.x / SVG_W) * 100}%`,
            top: `${(d.pt.y / SVG_H) * 240}px`,
            width: 10, height: 10,
            borderRadius: '50%',
            background: d.color,
            border: '2px solid #111',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />
        ))}

        {/* HTML tooltip */}
        {hoverX !== null && hoverData && (
          <div style={{
            position: 'absolute',
            top: 8,
            left: `calc(${(hoverX / SVG_W) * 100}% + 10px)`,
            transform: hoverX > SVG_W * 0.7 ? 'translateX(-110%)' : 'none',
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            padding: '6px 10px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}>
            {hoverData.map((d) => (
              <div key={d.label} style={{ fontSize: 11, fontWeight: 600, color: d.color, lineHeight: '18px' }}>
                {d.label} {d.pt.pct.toFixed(1)}%
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time range tabs */}
      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            style={{
              padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 500,
              border: 'none', cursor: 'pointer',
              background: timeRange === r ? '#1a1a1a' : 'transparent',
              color: timeRange === r ? C.accent : C.dim,
              outline: timeRange === r ? '1px solid #2a2a2a' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
