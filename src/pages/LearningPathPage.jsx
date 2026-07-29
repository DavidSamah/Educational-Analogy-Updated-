import knowledgeGraph from "../knowledge/graph";
import "./LearningPathPage.css";

const stages = [
  { key: "foundation", label: "Foundation", description: "Build the basics with core principles.", icon: "🧱" },
  { key: "core", label: "Core Concept", description: "Understand the central idea.", icon: "⭐" },
  { key: "connected", label: "Connected Concepts", description: "See how ideas relate.", icon: "🔗" },
  { key: "application", label: "Application", description: "Apply knowledge to real situations.", icon: "🛠️" },
  { key: "advanced", label: "Advanced Understanding", description: "Explore deeper implications.", icon: "🚀" },
];

export default function LearningPathPage({ onNavigate }) {
  const concept = "Gravity";
  const data = knowledgeGraph[concept];

  return (
    <div className="learning-path">
      <div className="learning-path__header">
        <h2 className="learning-path__title">Learning Path</h2>
        <p className="learning-path__subtitle">
          Turn complex subjects into progressive branches.
        </p>
      </div>

      <div className="learning-path__topic">
        <span className="learning-path__topic-label">Current Topic</span>
        <span className="learning-path__topic-name">{concept}</span>
        <span className="learning-path__topic-badge">{data?.category || "General"}</span>
      </div>

      <div className="learning-path__stages">
        {stages.map((stage, index) => {
          const isCompleted = index < 2;
          const isCurrent = index === 2;
          return (
            <div
              key={stage.key}
              className={`learning-path__stage ${isCompleted ? "learning-path__stage--done" : ""} ${isCurrent ? "learning-path__stage--active" : ""}`}
            >
              <div className="learning-path__stage-marker">
                <span className="learning-path__stage-icon" aria-hidden="true">{stage.icon}</span>
                {isCompleted && <span className="learning-path__check" aria-hidden="true">✓</span>}
              </div>
              <div className="learning-path__stage-content">
                <h4 className="learning-path__stage-label">{stage.label}</h4>
                <p className="learning-path__stage-desc">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="learning-path__actions">
        <button className="btn btn--primary" onClick={() => onNavigate("generate")}>Continue Learning</button>
        <button className="btn btn--secondary" onClick={() => onNavigate("progress")}>Review Previous Concept</button>
      </div>
    </div>
  );
}
