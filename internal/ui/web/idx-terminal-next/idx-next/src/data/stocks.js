import { rng, tick } from '@/lib/format';

// [code, name, sector, price, PER, PBV, ROE, dividend yield, market cap (Rp T)]
const ROWS = [
  ['BBCA', 'Bank Central Asia Tbk.', 'Financials', 9000, 24.1, 4.6, 19.5, 3.1, 1100],
  ['BBRI', 'Bank Rakyat Indonesia Tbk.', 'Financials', 4150, 10.2, 2.0, 19.8, 7.9, 630],
  ['BMRI', 'Bank Mandiri Tbk.', 'Financials', 4800, 8.7, 1.5, 18.2, 7.0, 448],
  ['BBNI', 'Bank Negara Indonesia Tbk.', 'Financials', 4300, 7.9, 1.0, 13.1, 6.2, 160],
  ['BRIS', 'Bank Syariah Indonesia Tbk.', 'Financials', 2900, 14.0, 2.2, 16.1, 1.4, 134],
  ['TLKM', 'Telkom Indonesia Tbk.', 'Infrastructure', 2750, 11.3, 1.9, 17.0, 6.4, 272],
  ['EXCL', 'XL Axiata Tbk.', 'Infrastructure', 2350, 18.0, 1.4, 8.0, 1.9, 31],
  ['ASII', 'Astra International Tbk.', 'Industrials', 4720, 6.8, 1.0, 15.4, 9.8, 191],
  ['SMGR', 'Semen Indonesia Tbk.', 'Industrials', 3300, 15.1, 0.6, 4.2, 3.5, 22],
  ['GOTO', 'GoTo Gojek Tokopedia Tbk.', 'Technology', 69, -4.2, 0.9, -20.5, 0, 82],
  ['UNVR', 'Unilever Indonesia Tbk.', 'Consumer', 1850, 17.6, 22.0, 95.0, 8.9, 70],
  ['ICBP', 'Indofood CBP Sukses Makmur', 'Consumer', 11200, 12.4, 2.3, 19.0, 3.2, 131],
  ['INDF', 'Indofood Sukses Makmur Tbk.', 'Consumer', 7400, 6.1, 0.9, 15.5, 4.4, 65],
  ['AMRT', 'Sumber Alfaria Trijaya Tbk.', 'Consumer', 2300, 28.5, 7.6, 28.0, 0.9, 95],
  ['CPIN', 'Charoen Pokphand Indonesia', 'Consumer', 4900, 24.3, 2.6, 11.2, 1.8, 80],
  ['MAPI', 'Mitra Adiperkasa Tbk.', 'Consumer', 1520, 12.8, 2.6, 21.5, 1.1, 25],
  ['ACES', 'Aspirasi Hidup Indonesia', 'Consumer', 510, 10.5, 1.4, 13.8, 5.0, 9],
  ['ADRO', 'Adaro Andalan Indonesia Tbk.', 'Energy', 2200, 5.3, 1.2, 23.0, 12.5, 70],
  ['PTBA', 'Bukit Asam Tbk.', 'Energy', 2650, 7.0, 1.5, 21.4, 13.1, 30],
  ['ANTM', 'Aneka Tambang Tbk.', 'Mining', 3100, 14.8, 2.0, 13.9, 2.8, 74],
  ['MDKA', 'Merdeka Copper Gold Tbk.', 'Mining', 2050, -25, 2.7, -3.0, 0, 50],
  ['BSDE', 'Bumi Serpong Damai Tbk.', 'Property', 980, 5.4, 0.5, 9.6, 0, 21],
];

export const RAW = ROWS.map((r) => {
  const q = rng(r[0]);
  const price = Math.max(tick(r[3]), r[3] + Math.round((q() - 0.5) * 10) * tick(r[3]));
  return {
    code: r[0], name: r[1], sector: r[2], price, prev: r[3], open: r[3],
    high: Math.max(price, r[3]), low: Math.min(price, r[3]),
    per: r[4], pbv: r[5], roe: r[6], dy: r[7], mcap: r[8],
    vol: Math.round(q() * 9e5 + 5e4),
  };
});

export const SECTORS = ['All', ...new Set(RAW.map((s) => s.sector))];

// [name, last, previous close]
export const INDICES = [
  ['JCI', 6889.33, 6891.1], ['LQ45', 912.4, 910.2], ['Dow Jones', 44120.5, 43980.1],
  ['S&P 500', 6012.3, 6001.9], ['Nasdaq', 19540.2, 19610.7], ['Nikkei 225', 38650.4, 38410.8],
  ['Hang Seng', 20210.6, 20350.2], ['USD/IDR', 15920, 15955], ['Gold (USD)', 2650.4, 2641.2], ['Brent (USD)', 74.3, 75.1],
];

// [label, number of points, step in days]
export const RANGES = [['1M', 22, 1], ['3M', 65, 1], ['6M', 130, 1], ['1Y', 250, 1], ['5Y', 260, 7], ['10Y', 520, 7]];
