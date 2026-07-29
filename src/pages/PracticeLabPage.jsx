import { useState } from "react";
import "./PracticeLabPage.css";

const modes = [
  { id: "create", label: "Create Your Own Analogy", icon: "✍️", description: "Write an analogy for a given concept." },
  { id: "match", label: "Match the Connection", icon: "🔗", description: "Connect parts of a concept to parts of an analogy." },
  { id: "complete", label: "Complete the Analogy", icon: "🧩", description: "Fill in missing sections of an analogy." },
  { id: "explain", label: "Explain the Relationship", icon: "💬", description: "Explain why two concepts are connected." },
  { id: "misconception", label: "Find the Misconception", icon: "🔍", description: "Identify where an analogy breaks down." },
];

const feedbackTemplate = {
  strengths: ["Your analogy correctly captures the flow of information."],
  improvements: ["It could become stronger by explaining how feedback changes the system."],
  score: 85,
};

export default function PracticeLabPage() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setAnswer("");
  };

  return (
    <div className="practice-lab">
      <div className="practice-lab__header">
        <h2 className="practice-lab__title">Practice Lab</h2>
        <p className="practice-lab__subtitle">
          Demonstrate your understanding through interactive exercises.
        </p>
      </div>

      {!selectedMode ? (
        <div className="practice-lab__modes">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className="practice-card"
              onClick={() => setSelectedMode(mode)}
            >
              <span className="practice-card__icon" aria-hidden="true">{mode.icon}</span>
              <span className="practice-card__label">{mode.label}</span>
              <span className="practice-card__desc">{mode.description}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="practice-lab__exercise">
          <div className="practice-lab__exercise-header">
            <h3 className="practice-lab__exercise-title">{selectedMode.label}</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => { setSelectedMode(null); reset(); }}>
              Back to modes
            </button>
          </div>

          <div className="practice-lab__prompt">
            <p><strong>Concept:</strong> Gravity</p>
            <p>Write an analogy that explains how gravity works using everyday experience.</p>
          </div>

          <label className="practice-lab__label" htmlFor="practice-answer">Your Analogy</label>
          <textarea
            id="practice-answer"
            className="practice-lab__textarea"
            placeholder="Describe your analogy here…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
          />

          <div className="practice-lab__actions">
            <button className="btn btn--primary" onClick={handleSubmit} disabled={!answer.trim()}>
              Submit
            </button>
            {submitted && (
              <button className="btn btn--secondary" onClick={reset}>Try Again</button>
            )}
          </div>

          {submitted && (
            <div className="practice-lab__feedback">
              <h4 className="practice-lab__feedback-title">Feedback</h4>
              <div className="practice-lab__feedback-section">
                <h5>What went well</h5>
                <ul>
                  {feedbackTemplate.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="practice-lab__feedback-section">
                <h5>Suggested improvements</h5>
                <ul>
                  {feedbackTemplate.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="practice-lab__score">
                <span>Understanding Score</span>
                <strong>{feedbackTemplate.score}%</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
