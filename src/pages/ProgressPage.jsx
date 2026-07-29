import "./ProgressPage.css";

const stats = [
  { label: "Concepts Explored", value: 12, icon: "💡" },
  { label: "Analogies Created", value: 8, icon: "🔗" },
  { label: "Connections Discovered", value: 34, icon: "🕸️" },
  { label: "Practices Completed", value: 5, icon: "🧪" },
];

const milestones = [
  { title: "First Analogy", date: "2 days ago", earned: true },
  { title: "Knowledge Explorer", date: "5 days ago", earned: true },
  { title: "Connection Builder", date: "1 week ago", earned: true },
  { title: "Deep Thinker", date: "Locked", earned: false },
];

export default function ProgressPage() {
  return (
    <div className="progress-page">
      <div className="progress-page__header">
        <h2 className="progress-page__title">My Progress</h2>
        <p className="progress-page__subtitle">
          Reflect on your growth and celebrate your learning journey.
        </p>
      </div>

      <div className="progress-page__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span className="stat-card__icon" aria-hidden="true">{stat.icon}</span>
            <span className="stat-card__value">{stat.value}</span>
            <span className="stat-card__label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="progress-page__section">
        <h3 className="progress-page__section-title">Milestones</h3>
        <div className="progress-page__milestones">
          {milestones.map((m) => (
            <div key={m.title} className={`milestone ${m.earned ? "milestone--earned" : "milestone--locked"}`}>
              <div className="milestone__icon" aria-hidden="true">
                {m.earned ? "🏆" : "🔒"}
              </div>
              <div className="milestone__content">
                <span className="milestone__title">{m.title}</span>
                <span className="milestone__date">{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="progress-page__insight">
        <p>“You learn deeply when you can transfer an idea into a new context.”</p>
      </div>
    </div>
  );
}
