import { useState } from "react";
import useAnalogyGeneration from "../hooks/useAnalogyGeneration";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import AnalogyResult from "../components/AnalogyResult";
import ToastNotification from "../components/ToastNotification";
import "./AnalogyGeneratorPage.css";

const perspectives = ["Cooking", "Football", "Nature", "Business", "Programming", "Music", "Architecture"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const styles = ["Everyday life", "Nature", "Technology", "Story", "Science", "Custom"];

export default function AnalogyGeneratorPage({ onNavigate }) {
  const [concept, setConcept] = useState("");
  const [perspective, setPerspective] = useState("Programming");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [style, setStyle] = useState("Technology");
  const { loading, error, result, generate, reset } = useAnalogyGeneration();
  const [toast, setToast] = useState(null);

  const handleGenerate = async () => {
    if (!concept.trim()) {
      setToast({ type: "error", message: "Please enter a concept." });
      return;
    }
    await generate({ concept, perspective, style, difficulty });
  };

  const handleSave = () => {
    setToast({ type: "success", message: "Analogy saved to your collection." });
  };

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setToast({ type: "success", message: "Copied to clipboard." });
    }
  };

  return (
    <div className="analogy-gen">
      <div className="analogy-gen__header">
        <h2 className="analogy-gen__title">Turn complexity into connection.</h2>
        <p className="analogy-gen__subtitle">
          Enter a concept and explore it through an analogy that makes its structure easier to understand.
        </p>
      </div>

      <div className="analogy-gen__form">
        <label className="analogy-gen__label" htmlFor="concept-input">Concept</label>
        <input
          id="concept-input"
          type="text"
          className="analogy-gen__input"
          placeholder="What would you like to understand?"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />

        <div className="analogy-gen__row">
          <div className="analogy-gen__field">
            <label className="analogy-gen__label" htmlFor="perspective-select">Subject</label>
            <select
              id="perspective-select"
              className="analogy-gen__select"
              value={perspective}
              onChange={(e) => setPerspective(e.target.value)}
            >
              {perspectives.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="analogy-gen__field">
            <label className="analogy-gen__label" htmlFor="difficulty-select">Difficulty</label>
            <select
              id="difficulty-select"
              className="analogy-gen__select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="analogy-gen__field">
            <label className="analogy-gen__label" htmlFor="style-select">Analogy Style</label>
            <select
              id="style-select"
              className="analogy-gen__select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="analogy-gen__actions">
          <button className="btn btn--primary" onClick={handleGenerate} disabled={loading}>
            {loading ? "Creating…" : "Create Analogy"}
          </button>
          {result && (
            <button className="btn btn--secondary" onClick={reset}>
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="analogy-gen__error" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="analogy-gen__result">
          <LoadingSkeleton lines={6} />
        </div>
      )}

      {result && !loading && (
        <AnalogyResult result={result} onSave={handleSave} onCopy={handleCopy} onNavigate={onNavigate} />
      )}

      {!result && !loading && !error && (
        <div className="analogy-gen__placeholder">
          <EmptyState
            icon="💡"
            title="Ready to explore?"
            description="Enter a concept above and select your preferences to generate a meaningful analogy."
          />
        </div>
      )}

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
