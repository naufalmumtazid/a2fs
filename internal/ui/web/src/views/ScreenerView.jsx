'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketData } from '@/context/MarketProvider';
import Win from '@/components/Win';
import { SECTORS } from '@/data/stocks';
import { nf, f2, pct, sg, clsOf } from '@/lib/format';

const FIELDS = [
  ['price', 'Price (Rp)'], ['mcap', 'Market cap (T)'], ['per', 'PER (x)'], ['pbv', 'PBV (x)'],
  ['roe', 'ROE (%)'], ['dy', 'Div yield (%)'], ['chg', 'Daily change (%)'],
];
const PRESETS = [
  ['Value', { per: { max: '12' }, pbv: { max: '1.5' }, roe: { min: '10' } }],
  ['High dividend', { dy: { min: '6' } }],
  ['Quality', { roe: { min: '18' } }],
  ['Cheap & small', { price: { max: '1000' } }],
];
const COLS = [
  ['code', 'Code', 'l'], ['name', 'Name', 'l'], ['sector', 'Sector', 'l'], ['price', 'Price'], ['chg', '% Day'],
  ['per', 'PER'], ['pbv', 'PBV'], ['roe', 'ROE %'], ['dy', 'Div %'], ['mcap', 'Mcap (T)'],
];
const has = (v) => v !== undefined && v !== '';
const EMPTY = { sector: 'All', r: {} };

export default function ScreenerView() {
  const { stocks } = useMarketData();
  const router = useRouter();
  const onOpen = (code) => router.push('/stock/' + code);
  const [applied, setApplied] = useState(EMPTY);
  const [draft, setDraft] = useState(EMPTY);
  const [show, setShow] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ k: 'mcap', d: -1 });

  const rows = useMemo(
    () =>
      stocks
        .map((s) => ({ ...s, chg: pct(s.price, s.prev) }))
        .filter((s) => {
          if (applied.sector !== 'All' && s.sector !== applied.sector) return false;
          if (q && !(s.code + s.name).toLowerCase().includes(q.toLowerCase())) return false;
          return Object.entries(applied.r).every(([k, b]) => {
            if (has(b.min) && s[k] < +b.min) return false;
            if (has(b.max) && s[k] > +b.max) return false;
            if (k === 'per' && (has(b.min) || has(b.max)) && s.per <= 0) return false;
            return true;
          });
        })
        .sort((a, b) => {
          const x = a[sort.k];
          const y = b[sort.k];
          return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sort.d;
        }),
    [stocks, applied, sort, q]
  );

  const chips = [
    ...(applied.sector !== 'All' ? [['sector', 'Sector: ' + applied.sector]] : []),
    ...Object.entries(applied.r)
      .filter(([, b]) => has(b.min) || has(b.max))
      .map(([k, b]) => [
        k,
        FIELDS.find((f) => f[0] === k)[1] + ' ' + (has(b.min) ? '≥ ' + b.min : '') + (has(b.min) && has(b.max) ? ' & ' : '') + (has(b.max) ? '≤ ' + b.max : ''),
      ]),
  ];

  const removeChip = (k) => {
    const next = k === 'sector' ? { ...applied, sector: 'All' } : { ...applied, r: { ...applied.r, [k]: {} } };
    setApplied(next);
    setDraft(next);
  };
  const setBound = (k, m) => (e) => setDraft({ ...draft, r: { ...draft.r, [k]: { ...draft.r[k], [m]: e.target.value } } });

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-1 p-1">
      <div className="flex flex-wrap items-center gap-2 p-2 win !flex-row">
        <button className="btn on" onClick={() => { setDraft(applied); setShow(true); }}>
          Filter{chips.length ? ' (' + chips.length + ')' : ''}
        </button>
        <div className="w-48">
          <input placeholder="Search code / name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search stocks" />
        </div>
        {chips.map(([k, l]) => (
          <span key={k} className="chip">
            {l}
            <button aria-label="Remove filter" onClick={() => removeChip(k)}>×</button>
          </span>
        ))}
        <span className="ml-auto dim">{rows.length} of {stocks.length} stocks</span>
      </div>

      <Win title="Stock list" right="Click a row for details" className="flex-1">
        <div className="scroll flex-1">
          <table>
            <thead>
              <tr>
                {COLS.map(([k, l, a]) => (
                  <th key={k} className={a || ''} style={{ cursor: 'pointer' }} onClick={() => setSort({ k, d: sort.k === k ? -sort.d : -1 })}>
                    {l}{sort.k === k ? (sort.d < 0 ? ' ▼' : ' ▲') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const c = clsOf(s.price, s.prev);
                return (
                  <tr key={s.code} className="cursor-pointer" onClick={() => onOpen(s.code)}>
                    <td className={'l ' + c}>{s.code}</td>
                    <td className="l">{s.name}</td>
                    <td className="l dim">{s.sector}</td>
                    <td className={c}>{nf(s.price)}</td>
                    <td className={c}>{sg(s.chg)}</td>
                    <td>{s.per > 0 ? f2(s.per) : '-'}</td>
                    <td>{f2(s.pbv)}</td>
                    <td className={s.roe < 0 ? 'down' : ''}>{f2(s.roe)}</td>
                    <td>{f2(s.dy)}</td>
                    <td>{nf(s.mcap)}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="10" className="l dim p-4">No stocks match. Loosen the filters or remove a chip above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Win>

      {show && (
        <div className="fixed inset-0 z-20 flex justify-end bg-black/60" onClick={() => setShow(false)}>
          <div className="win w-[380px] max-w-full h-full" onClick={(e) => e.stopPropagation()}>
            <div className="wt">
              <span>Screener filters</span>
              <button onClick={() => setShow(false)} aria-label="Close">×</button>
            </div>
            <div className="scroll flex-1 p-3 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                {PRESETS.map(([l, p]) => (
                  <button key={l} className="btn" onClick={() => setDraft({ ...draft, r: p })}>{l}</button>
                ))}
              </div>
              <label>
                <div className="dim mb-1">Sector</div>
                <select value={draft.sector} onChange={(e) => setDraft({ ...draft, sector: e.target.value })}>
                  {SECTORS.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              {FIELDS.map(([k, l]) => (
                <div key={k}>
                  <div className="dim mb-1">{l}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" inputMode="decimal" placeholder="Min" value={(draft.r[k] || {}).min || ''} onChange={setBound(k, 'min')} />
                    <input type="number" inputMode="decimal" placeholder="Max" value={(draft.r[k] || {}).max || ''} onChange={setBound(k, 'max')} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 flex gap-2 border-t border-[var(--line)]">
              <button className="btn flex-1" onClick={() => setDraft(EMPTY)}>Reset</button>
              <button className="btn on flex-1" onClick={() => { setApplied(draft); setShow(false); }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
