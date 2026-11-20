import { Suspense } from 'react';
import StockDetailView from '@/views/StockDetailView';

export const metadata = { title: 'Stock detail | IDX Terminal' };

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 p-4 dim">Loading stock detail…</div>}>
      <StockDetailView />
    </Suspense>
  );
}
