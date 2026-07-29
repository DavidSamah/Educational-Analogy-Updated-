import "./FeatureCard.css";

export default function FeatureCard({ icon, title, description, onClick }) {
  return (
    <button className="feature-card" onClick={onClick}>
      <span className="feature-card__icon" aria-hidden="true">{icon}</span>
      <span className="feature-card__title">{title}</span>
      <span className="feature-card__desc">{description}</span>
    </button>
  );
}
