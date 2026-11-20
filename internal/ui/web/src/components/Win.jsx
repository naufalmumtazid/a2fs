// Terminal-style panel with a title bar
export default function Win({ title, right, children, className = '' }) {
  return (
    <section className={'win ' + className}>
      <div className="wt">
        <span>{title}</span>
        <span className="dim">{right}</span>
      </div>
      {children}
    </section>
  );
}
