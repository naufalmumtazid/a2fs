'use client';

import { useState } from 'react';
import { f2, nf } from '@/lib/format';
import { dlab } from '@/data/generators';

// Line chart with optional volume bars, MA20 and a hover crosshair
export default function Chart({ c, v, step = 1, h = 360, ma = false, vol = true }) {
  const [hv, setHv] = useState(null);
  const w = 900;
  const ph = vol ? h * 0.8 : h;
  const pad = 12;
  const mn = Math.min(...c);
  const mx = Math.max(...c);
  const X = (i) => (i / (c.length - 1)) * w;
  const Y = (x) => pad + (1 - (x - mn) / (mx - mn || 1)) * (ph - pad * 2);
  const line = c.map((x, i) => X(i) + ',' + Y(x)).join(' ');
  const mline = ma
    ? c
        .map((_, i) => {
          if (i < 19) return null;
          let s = 0;
          for (let k = i - 19; k <= i; k++) s += c[k];
          return X(i) + ',' + Y(s / 20);
        })
        .filter(Boolean)
        .join(' ')
    : '';
  const vm = Math.max(...(v || [1]));
  const up = c[c.length - 1] >= c[0];
  const col = up ? '#38d060' : '#e5484d';
  const bw = Math.max(1, (w / c.length) * 0.7);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHv(Math.max(0, Math.min(c.length - 1, Math.round(((e.clientX - r.left) / r.width) * (c.length - 1)))));
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height: h }}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHv(null)}
        role="img"
        aria-label="Price chart"
      >
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" x2={w} y1={pad + (i * (ph - pad * 2)) / 3} y2={pad + (i * (ph - pad * 2)) / 3} stroke="#2a2a2a" />
        ))}
        <polygon points={`0,${ph} ${line} ${w},${ph}`} fill={col} opacity=".1" />
        {vol &&
          v.map((x, i) => (
            <rect key={i} x={X(i) - bw / 2} width={bw} y={h - (x / vm) * (h - ph - 8)} height={(x / vm) * (h - ph - 8)} fill="#5e5e5e" opacity=".7" />
          ))}
        <polyline points={line} fill="none" stroke={col} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {ma && <polyline points={mline} fill="none" stroke="#f2d94e" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}
        {hv != null && <line x1={X(hv)} x2={X(hv)} y1="0" y2={h} stroke="#9a9a9a" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="absolute right-1 top-0 dim">{f2(mx)}</div>
      <div className="absolute right-1 dim" style={{ top: ph - 16 }}>{f2(mn)}</div>
      <div className="absolute left-2 top-1 text-[11px]">
        {hv != null && (
          <>
            <span className="text-white">{dlab(c.length, step, hv)}</span>{' '}
            <span className={up ? 'up' : 'down'}>{f2(c[hv])}</span>{' '}
            {v && vol && <span className="dim">Vol {nf(v[hv])}K</span>}
          </>
        )}
        {ma && <span className="flat"> MA20</span>}
      </div>
    </div>
  );
}
