import "./LoadingSkeleton.css";

const widths = [60, 80, 90, 70, 85, 75, 65, 95];

export default function LoadingSkeleton({ lines = 4 }) {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="skeleton__title" />
      <div className="skeleton__line" />
      <div className="skeleton__line" />
      <div className="skeleton__line" />
      <div className="skeleton__line" />
      {Array.from({ length: Math.max(0, lines - 4) }).map((_, i) => (
        <div key={i} className="skeleton__line" style={{ width: `${widths[i % widths.length]}%` }} />
      ))}
    </div>
  );
}
