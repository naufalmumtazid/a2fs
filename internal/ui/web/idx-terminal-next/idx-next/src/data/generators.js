import { rng } from '@/lib/format';

// Dummy price history ending at `last`. Replace with real historical data.
export function series(key, last, n, step) {
  const r = rng(key + n);
  const vol = 0.016 * Math.sqrt(step);
  const c = [last];
  for (let i = 1; i < n; i++) c.unshift(Math.max(last * 0.05, c[0] / (1 + (r() - 0.49) * vol * 2)));
  return { c, v: c.map(() => Math.round(r() * 900 + 200)) };
}

export const dlab = (n, step, i) =>
  new Date(2026, 10, 20 - (n - 1 - i) * step).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Dummy 10-year financials (Rp billion). Replace with real statements.
export function fin(s) {
  const r = rng(s.code + 'fin');
  const bank = s.sector === 'Financials';
  let rev = s.mcap * 1000 * 0.3;
  const revs = [rev];
  for (let i = 1; i < 10; i++) {
    rev = rev / (1 + 0.03 + r() * 0.11);
    revs.unshift(rev);
  }
  return revs.map((R, i) => {
    const nm = s.roe > 0 ? Math.min(0.38, 0.05 + (s.roe / 100) * 0.55) * (0.8 + r() * 0.4) : -(0.02 + r() * 0.1);
    const ni = R * nm;
    const gp = R * Math.min(0.85, Math.max(0.1, nm + 0.2 + r() * 0.1));
    const op = R * nm * 1.25;
    const eq = s.roe > 0 ? ni / ((s.roe / 100) * (0.8 + r() * 0.4)) : R * 0.6;
    const ta = eq * (bank ? 7 : 2.1 + r());
    const cfo = ni * (0.9 + r() * 0.6) + R * 0.04;
    const cx = -R * (0.03 + r() * 0.05);
    const eps = (ni * s.price) / (s.mcap * 1000);
    return {
      y: 2016 + i, rev: R, gp, op, ni, eps, ta, tl: ta - eq, eq, cfo, cx, fcf: cfo + cx,
      dps: ni > 0 && s.dy > 0 ? eps * (0.3 + r() * 0.3) : 0,
      gm: (gp / R) * 100, nm: nm * 100, roe: (ni / eq) * 100, roa: (ni / ta) * 100, der: (ta - eq) / eq,
    };
  });
}

// [label, key, decimals?]
export const STMT = {
  'Income statement': [['Revenue', 'rev'], ['Gross profit', 'gp'], ['Operating profit', 'op'], ['Net income', 'ni'], ['EPS (Rp)', 'eps', 1]],
  'Balance sheet': [['Total assets', 'ta'], ['Total liabilities', 'tl'], ['Equity', 'eq']],
  'Cash flow': [['Operating cash flow', 'cfo'], ['Capex', 'cx'], ['Free cash flow', 'fcf'], ['Dividend/share (Rp)', 'dps', 1]],
  Ratios: [['Gross margin (%)', 'gm', 1], ['Net margin (%)', 'nm', 1], ['ROE (%)', 'roe', 1], ['ROA (%)', 'roa', 1], ['DER (x)', 'der', 1]],
};
