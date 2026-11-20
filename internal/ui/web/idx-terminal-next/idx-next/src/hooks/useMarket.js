'use client';

import { useEffect, useState } from 'react';
import { RAW, INDICES } from '@/data/stocks';
import { tick } from '@/lib/format';

// Simulated live prices. Replace the interval with a WebSocket / API subscription.
export default function useMarket() {
  const [stocks, setStocks] = useState(RAW);
  const [idx, setIdx] = useState(INDICES[0][1]);

  useEffect(() => {
    const t = setInterval(() => {
      setStocks((cur) =>
        cur.map((s) => {
          if (Math.random() > 0.35) return s;
          const k = tick(s.price);
          const price = Math.max(k, s.price + Math.round((Math.random() * 2 - 1) * k));
          return { ...s, price, high: Math.max(s.high, price), low: Math.min(s.low, price), vol: s.vol + Math.round(Math.random() * 500) };
        })
      );
      setIdx((v) => +(v + (Math.random() - 0.5) * 3).toFixed(2));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return { stocks, idx };
}
