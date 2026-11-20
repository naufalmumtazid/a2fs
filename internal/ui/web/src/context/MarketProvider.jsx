'use client';

import { createContext, useContext } from 'react';
import useMarket from '@/hooks/useMarket';

const MarketContext = createContext({ stocks: [], idx: 0 });

// Keeps live prices in one place so they continue across page navigation
export default function MarketProvider({ children }) {
  const market = useMarket();
  return <MarketContext.Provider value={market}>{children}</MarketContext.Provider>;
}

export const useMarketData = () => useContext(MarketContext);
