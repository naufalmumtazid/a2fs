import Link from 'next/link';

export default function NewsItem({ n }) {
  return (
    <article className="px-3 py-3 border-b border-[var(--line)]">
      <div className="dim mb-1">
        <span className="cy">{n.cat}</span> · {n.src} · {n.time}
      </div>
      <h3 className="text-sm text-white mb-1">{n.title}</h3>
      <p className="dim max-w-[80ch] mb-2">{n.sum}</p>
      <div className="flex gap-1">
        {n.codes.map((c) => (
          <Link key={c} href={'/stock/' + c} className="chip cy">{c}</Link>
        ))}
      </div>
    </article>
  );
}
