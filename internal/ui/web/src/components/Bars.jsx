// Grouped bars: revenue (gray) and net income (green / red) per year
export default function Bars({ data }) {
  const w = 900;
  const h = 200;
  const mx = Math.max(...data.map((d) => Math.max(Math.abs(d.rev), Math.abs(d.ni))));
  const bw = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h + 18}`} className="w-full" preserveAspectRatio="none" style={{ height: h + 18 }} role="img" aria-label="Revenue and net income over 10 years">
      <line x1="0" x2={w} y1={h * 0.8} y2={h * 0.8} stroke="#4a4a4a" />
      {data.map((d, i) => (
        <g key={d.y}>
          <rect x={i * bw + bw * 0.12} width={bw * 0.36} y={h * 0.8 - (d.rev / mx) * h * 0.78} height={Math.max(1, (d.rev / mx) * h * 0.78)} fill="#7a7a7a" />
          <rect x={i * bw + bw * 0.5} width={bw * 0.36} y={d.ni >= 0 ? h * 0.8 - (d.ni / mx) * h * 0.78 : h * 0.8} height={Math.max(1, (Math.abs(d.ni) / mx) * h * 0.78)} fill={d.ni >= 0 ? '#38d060' : '#e5484d'} />
          <text x={i * bw + bw / 2} y={h + 14} textAnchor="middle" fill="#727272" fontSize="12">{d.y}</text>
        </g>
      ))}
    </svg>
  );
}
