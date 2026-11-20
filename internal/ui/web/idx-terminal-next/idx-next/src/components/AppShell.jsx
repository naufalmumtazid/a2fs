'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMarketData } from '@/context/MarketProvider';
import { INDICES } from '@/data/stocks';
import { f2, pct, sg, clsOf, clock } from '@/lib/format';

const TABS = [['/', 'Dashboard'], ['/screener', 'Screener'], ['/news', 'News']];

export default function AppShell({ children }) {
  const { stocks, idx } = useMarketData();
  const pathname = usePathname();
  const router = useRouter();
  const [now, setNow] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    setNow(clock());
    const t = setInterval(() => setNow(clock()), 1000);
    return () => clearInterval(t);
  }, []);

  const search = (e) => {
    if (e.key !== 'Enter') return;
    const s = stocks.find((x) => x.code === q.trim().toUpperCase());
    if (s) {
      router.push('/stock/' + s.code);
      setQ('');
    }
  };

  const ch = idx - INDICES[0][2];
  const ic = clsOf(ch, 0);

  return (
    <div className="h-full flex flex-col">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-1 px-3 py-2 border-b border-[var(--line)] bg-[#2a2a2a]">
        <div className="text-white font-semibold">IDX Terminal</div>
        <div className="flex items-baseline gap-3">
          <span className="dim">JCI</span>
          <span className={'text-lg font-semibold ' + ic}>{f2(idx)}</span>
          <span className={ic}>{sg(ch)} ({sg(pct(idx, INDICES[0][2]))}%)</span>
        </div>
        <div className="w-36">
          <input placeholder="Stock code ↵" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={search} aria-label="Open stock detail" />
        </div>
        <div className="ml-auto dim">{now} WIB</div>
      </header>

      <nav className="flex gap-1 px-2 pt-1 border-b border-[var(--line)]">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} className={'tab ' + (pathname === href ? 'on' : '')} aria-current={pathname === href ? 'page' : undefined}>
            {label}
          </Link>
        ))}
      </nav>

      {children}

      <footer className="border-t border-[var(--line)] px-3 py-1 dim">
        All data, news, and financial figures are dummy data for display purposes.
      </footer>
    </div>
  );
}
