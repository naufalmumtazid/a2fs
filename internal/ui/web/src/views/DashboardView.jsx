'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarketData } from '@/context/MarketProvider';
import Win from '@/components/Win';
import Chart from '@/components/Chart';
import Ranges from '@/components/Ranges';
import { INDICES, RANGES, SECTORS } from '@/data/stocks';
import { NEWS } from '@/data/news';
import { series } from '@/data/generators';
import { nf, f2, pct, sg, clsOf } from '@/lib/format';

function MoversTable({ title, list, onOpen }) {
  return (
    <Win title={title}>
      <table>
        <tbody>
          {list.map((s) => (
            <tr key={s.code} className="cursor-pointer" onClick={() => onOpen(s.code)}>
              <td className="l cy">{s.code}</td>
              <td>{nf(s.price)}</td>
              <td className={clsOf(s.chg, 0)}>{sg(s.chg)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Win>
  );
}

export default function DashboardView() {
  const { stocks, idx } = useMarketData();
  const router = useRouter();
  const onOpen = (code) => router.push('/stock/' + code);
  const [mi, setMi] = useState(0);
  const [rg, setRg] = useState('6M');
  const [, n, st] = RANGES.find((r) => r[0] === rg);
  const ix = INDICES.map((x, i) => (i === 0 ? [x[0], idx, x[2]] : x));
  const cur = ix[mi];
  const ser = useMemo(() => series(cur[0], cur[1], n, st), [mi, rg, Math.round(cur[1])]);

  const rows = useMemo(() => stocks.map((s) => ({ ...s, chg: pct(s.price, s.prev) })), [stocks]);
  const gain = [...rows].sort((a, b) => b.chg - a.chg).slice(0, 5);
  const lose = [...rows].sort((a, b) => a.chg - b.chg).slice(0, 5);
  const active = [...rows].sort((a, b) => b.vol * b.price - a.vol * a.price).slice(0, 5);
  const secs = SECTORS.slice(1).map((k) => {
    const g = rows.filter((s) => s.sector === k);
    return [k, g.reduce((a, s) => a + s.chg, 0) / g.length];
  });
  const mxs = Math.max(...secs.map((s) => Math.abs(s[1])), 0.1);

  return (
    <div className="flex-1 scroll p-1 grid gap-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] content-start">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="grid gap-1 grid-cols-2 md:grid-cols-5">
          {ix.map((x, i) => {
            const ch = x[1] - x[2];
            const c = clsOf(ch, 0);
            return (
              <button key={x[0]} onClick={() => setMi(i)} className={'win p-2 text-left ' + (mi === i ? '!border-[#9a9a9a]' : '')}>
                <div className="dim">{x[0]}</div>
                <div className={'text-base font-semibold ' + c}>{f2(x[1])}</div>
                <div className={c}>{sg(ch)} ({sg(pct(x[1], x[2]))}%)</div>
              </button>
            );
          })}
        </div>

        <Win title={cur[0] + ' - ' + f2(cur[1])} right={<Ranges value={rg} onChange={setRg} />}>
          <div className="p-2">
            <Chart key={cur[0] + rg} c={ser.c} v={ser.v} step={st} h={300} vol={false} />
          </div>
        </Win>

        <div className="grid gap-1 grid-cols-1 md:grid-cols-3">
          <MoversTable title="Top gainers" list={gain} onOpen={onOpen} />
          <MoversTable title="Top losers" list={lose} onOpen={onOpen} />
          <MoversTable title="Most active" list={active} onOpen={onOpen} />
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <Win title="Sector performance" right="% today">
          <div className="p-3 flex flex-col gap-2">
            {secs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[120px_1fr_52px] items-center gap-2">
                <span>{k}</span>
                <div className="relative bar">
                  <div
                    style={{
                      position: 'absolute', height: '100%',
                      width: (Math.abs(v) / mxs) * 50 + '%',
                      left: v >= 0 ? '50%' : 50 - (Math.abs(v) / mxs) * 50 + '%',
                      background: v >= 0 ? '#38d060' : '#e5484d',
                    }}
                  />
                </div>
                <span className={'text-right ' + clsOf(v, 0)}>{sg(v)}</span>
              </div>
            ))}
          </div>
        </Win>

        <Win title="Latest news" right={<Link href="/news" className="cy">View all</Link>}>
          <ul>
            {NEWS.slice(0, 6).map((n) => (
              <li key={n.id} className="px-3 py-2 border-b border-[var(--line)]">
                <div className="text-white">{n.title}</div>
                <div className="dim">{n.src} · {n.time}</div>
              </li>
            ))}
          </ul>
        </Win>
      </div>
    </div>
  );
}
