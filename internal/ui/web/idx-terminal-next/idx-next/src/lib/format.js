export const nf = (n) => Math.round(n).toLocaleString('en-US');
export const f2 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (a, b) => ((a - b) / b) * 100;
export const sg = (n) => (n > 0 ? '+' : '') + f2(n);
export const clsOf = (a, b) => (a > b ? 'up' : a < b ? 'down' : 'flat');
export const tick = (p) => (p < 200 ? 1 : p < 500 ? 2 : p < 2000 ? 5 : p < 5000 ? 10 : 25);
export const clock = () => new Date().toLocaleTimeString('en-GB');

// Small seeded random generator so dummy data stays consistent per stock
export const rng = (s) => {
  let x = [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  return () => {
    x = (x * 48271) % 2147483647;
    return x / 2147483647;
  };
};
