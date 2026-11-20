'use client';

import { useState } from 'react';
import Win from '@/components/Win';
import NewsItem from '@/components/NewsItem';
import { NEWS, NEWS_CATEGORIES } from '@/data/news';

export default function NewsView() {
  const [cat, setCat] = useState('All');
  return (
    <div className="flex-1 min-h-0 p-1 flex flex-col">
      <Win title="News" right={NEWS.length + ' articles'} className="flex-1">
        <div className="p-2 flex gap-1 flex-wrap border-b border-[var(--line)]">
          {NEWS_CATEGORIES.map((c) => (
            <button key={c} className={'btn ' + (cat === c ? 'on' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="scroll flex-1">
          {NEWS.filter((n) => cat === 'All' || n.cat === cat).map((n) => (
            <NewsItem key={n.id} n={n} />
          ))}
        </div>
      </Win>
    </div>
  );
}
