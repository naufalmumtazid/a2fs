# IDX Terminal (Next.js)

Stock market terminal UI built with Next.js (App Router), React and Tailwind CSS v3. All data is dummy data.

## Requirements

- Node.js 18.18 or newer (Node 20 LTS recommended)
- npm (or pnpm / yarn)

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## Routes

| URL             | File                            | Description                                        |
| --------------- | ------------------------------- | -------------------------------------------------- |
| `/`             | `src/app/page.jsx`              | Dashboard                                          |
| `/screener`     | `src/app/screener/page.jsx`     | Stock list + filters                               |
| `/news`         | `src/app/news/page.jsx`         | News                                               |
| `/stock/[code]` | `src/app/stock/[code]/page.jsx` | Stock detail (not in the menu), e.g. `/stock/BBCA` |

## Structure

```
src/
  app/            Routes, root layout, global CSS
  views/          Page UIs (client components)
  components/     Win, Chart, Bars, Ranges, NewsItem, AppShell
  context/        MarketProvider (shared live prices across pages)
  hooks/          useMarket (simulated prices - replace with WebSocket/API)
  data/           Dummy stocks, news, chart and financial generators
  lib/            Formatting helpers
```
