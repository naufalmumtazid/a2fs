'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMarketData } from '@/context/MarketProvider';
import Win from '@/components/Win';
import Chart from '@/components/Chart';
import Bars from '@/components/Bars';
import Ranges from '@/components/Ranges';
import NewsItem from '@/components/NewsItem';
import { RANGES } from '@/data/stocks';
import { NEWS } from '@/data/news';
import { series, fin, STMT } from '@/data/generators';
import { nf, f2, pct, sg, clsOf, tick, rng } from '@/lib/format';

export default function StockDetailView() {
  const { code } = useParams();
  const { stocks } = useMarketData();
  const s = stocks.find((x) => x.code === String(code).toUpperCase());
  if (!s) {
    return (
      <div className="flex-1 p-4">
        <Win title="Stock not found">
          <div className="p-4">
            No stock with code {String(code).toUpperCase()} in the dummy data.{' '}
            <Link href="/screener" className="cy">Back to screener</Link>
          </div>
        </Win>
      </div>
    );
  }
  return <StockDetailContent s={s} />;
}

function StockDetailContent({ s }) {
  const router = useRouter();
  const onBack = () => router.back();
  const [tab, setTab] = useState('Overview');
  const [rg, setRg] = useState('1Y');
  const [ma, setMa] = useState(true);
  const [stm, setStm] = useState('Income statement');
  const [, n, st] = RANGES.find((r) => r[0] === rg);

  const ser = useMemo(() => series(s.code, s.price, n, st), [s.code, rg, Math.round(s.price / tick(s.price))]);
  const F = useMemo(() => fin(s), [s.code]);
  const c = clsOf(s.price, s.prev);
  const ch = s.price - s.prev;
  const r = rng(s.code + 'm');

  const metrics = [
    ['Valuation', [['PER', s.per > 0 ? f2(s.per) + 'x' : 'N/A'], ['PBV', f2(s.pbv) + 'x'], ['PSR', f2(0.8 + r() * 4) + 'x'], ['EV/EBITDA', f2(3 + r() * 10) + 'x']]],
    ['Profitability', [['ROE', f2(s.roe) + '%'], ['ROA', f2(F[9].roa) + '%'], ['Net margin', f2(F[9].nm) + '%'], ['Gross margin', f2(F[9].gm) + '%']]],
    ['Dividends & risk', [['Dividend yield', f2(s.dy) + '%'], ['Payout ratio', s.dy > 0 ? f2(30 + r() * 40) + '%' : '0%'], ['DER', f2(F[9].der) + 'x'], ['Beta', f2(0.6 + r() * 0.9)]]],
    ['Market', [['Market cap', 'Rp ' + nf(s.mcap) + ' T'], ['52W High', nf(s.price * 1.18)], ['52W Low', nf(s.price * 0.74)], ['Volume', nf(s.vol / 100) + ' lot']]],
  ];
  const news = NEWS.filter((x) => x.codes.includes(s.code));

  return (
    <div className="flex-1 scroll shrink0 p-1 flex flex-col gap-1">
      <Win title={<button className="cy" onClick={onBack}>← Back</button>} right={s.sector}>
        <div className="p-3 flex flex-wrap items-end gap-x-8 gap-y-2">
          <div>
            <div className="text-sm text-white">{s.code} · {s.name}</div>
            <div className={'text-3xl font-semibold ' + c}>
              {nf(s.price)} <span className="text-sm">{sg(ch)} ({sg(pct(s.price, s.prev))}%)</span>
            </div>
          </div>
          {[['Prev', nf(s.prev)], ['Open', nf(s.open)], ['High', nf(s.high)], ['Low', nf(s.low)], ['Vol (lot)', nf(s.vol / 100)], ['Value (Rp M)', nf((s.vol * s.price) / 1e6)]].map(([k, v]) => (
            <div key={k}>
              <div className="dim">{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      </Win>

      <Win
        title="Chart"
        right={
          <div className="flex gap-2 items-center">
            <button className={'btn ' + (ma ? 'on' : '')} onClick={() => setMa(!ma)}>MA20</button>
            <Ranges value={rg} onChange={setRg} />
          </div>
        }
      >
        <div className="p-2">
          <Chart key={s.code + rg} c={ser.c} v={ser.v} step={st} h={440} ma={ma} />
        </div>
      </Win>

      <div className="flex gap-1 border-b border-[var(--line)]">
        {['Overview', 'Financials', 'News'].map((t) => (
          <button key={t} className={'tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid gap-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([t, rows]) => (
            <Win key={t} title={t}>
              <table>
                <tbody>
                  {rows.map(([k, v]) => (
                    <tr key={k} className="border-b border-[var(--line)]">
                      <td className="l dim py-1">{k}</td>
                      <td className="text-white">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Win>
          ))}
        </div>
      )}

      {tab === 'Financials' && (
        <Win title="10-year financial data" right="Rp billion, annual (dummy)">
          <div className="p-2 flex gap-1 flex-wrap">
            {Object.keys(STMT).map((k) => (
              <button key={k} className={'btn ' + (stm === k ? 'on' : '')} onClick={() => setStm(k)}>{k}</button>
            ))}
          </div>
          {/* Horizontal scroll for the number-heavy table */}
          <div className="xs">
            <table className="fin">
              <thead>
                <tr>
                  <th className="l">Item</th>
                  {F.map((d) => <th key={d.y}>{d.y}</th>)}
                </tr>
              </thead>
              <tbody>
                {STMT[stm].map(([label, key, dec]) => (
                  <tr key={key} className="border-t border-[var(--line)]">
                    <td className="l dim">{label}</td>
                    {F.map((d) => (
                      <td key={d.y} className={d[key] < 0 ? 'down' : ''}>{dec ? f2(d[key]) : nf(d[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3">
            <div className="dim mb-1">
              Revenue <span className="text-[#7a7a7a]">■</span> and net income <span className="up">■</span>, 2016–2025
            </div>
            <Bars data={F} />
          </div>
        </Win>
      )}

      {tab === 'News' && (
        <Win title={'News ' + s.code}>
          {(news.length ? news : NEWS.slice(0, 3)).map((x) => <NewsItem key={x.id} n={x} />)}
          {!news.length && <div className="p-3 dim">No news specific to {s.code} yet. Showing the latest market news.</div>}
        </Win>
      )}
    </div>
  );
}
