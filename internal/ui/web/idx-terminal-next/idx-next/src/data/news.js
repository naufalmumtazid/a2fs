// [category, title, source, time, related tickers, summary]
const ROWS = [
  ['Market', 'JCI closes slightly higher, led by financial stocks', 'Daily Market', '15 min ago', ['BBCA', 'BBRI', 'BMRI'], 'The index moved in a narrow range through the session on above-average turnover. Large bank stocks were the main support while technology names were under pressure.'],
  ['Corporate', 'Major banks report double-digit loan growth in the latest quarter', 'Corporate Now', '1 hr ago', ['BBRI', 'BMRI', 'BBNI'], 'Growth was driven by consumer and SME segments. Management kept credit costs under control and aims to hold net interest margin steady.'],
  ['Economy', 'Central bank holds benchmark rate, rupiah relatively stable', 'Economy Now', '2 hr ago', [], 'The decision matched analyst expectations. The central bank said it will keep monitoring core inflation and foreign capital flows.'],
  ['Global', "Wall Street mixed as investors await next week's inflation data", 'Global Wire', '3 hr ago', [], 'Major US indices closed mixed. Tech shares weakened while energy and financials gained.'],
  ['Corporate', 'Coal producers declare interim dividends, cum-date next week', 'Corporate Now', '4 hr ago', ['ADRO', 'PTBA'], 'Payout ratios remain high even as coal prices move sideways.'],
  ['Market', 'Foreign investors post net sell in regular market, rotate into defensives', 'Daily Market', '5 hr ago', ['UNVR', 'ICBP', 'AMRT'], 'Outflows were concentrated in large caps, while defensive consumer stocks held up relatively well.'],
  ['Corporate', 'Mobile operators expand 5G networks, capex rises', 'Corporate Now', '6 hr ago', ['TLKM', 'EXCL'], 'Expansion focuses on major cities, targeting higher data revenue next year.'],
  ['Economy', 'Trade surplus recorded, commodity exports remain a key support', 'Economy Now', 'Yesterday', ['ADRO', 'ANTM'], 'The surplus widened from the previous month on coal, nickel, and palm oil exports.'],
  ['Global', 'Gold and oil move in opposite directions after new economic data', 'Global Wire', 'Yesterday', ['ANTM', 'MDKA'], 'Gold edged higher as a hedge, while oil was weighed down by demand forecasts.'],
  ['Corporate', 'Tech company narrows losses, shifts focus to profitability', 'Corporate Now', 'Yesterday', ['GOTO'], 'Operating costs fell and net revenue grew. Management targets positive cash flow within a few quarters.'],
  ['Market', 'Property stocks rally after down-payment rules are relaxed', 'Daily Market', '2 days ago', ['BSDE'], 'Market participants expect the policy to lift pre-sales and marketing sales.'],
  ['Economy', 'Monthly inflation contained, middle-class purchasing power in focus', 'Economy Now', '2 days ago', ['MAPI', 'ACES'], 'Household consumption is still growing moderately, but sales of durable goods at retailers are slowing.'],
];

export const NEWS = ROWS.map((n, i) => ({ id: i, cat: n[0], title: n[1], src: n[2], time: n[3], codes: n[4], sum: n[5] }));
export const NEWS_CATEGORIES = ['All', 'Market', 'Corporate', 'Economy', 'Global'];
