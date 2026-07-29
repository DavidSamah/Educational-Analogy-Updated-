import "./EmptyState.css";

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn--primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
