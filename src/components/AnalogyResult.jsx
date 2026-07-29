import "./AnalogyResult.css";

export default function AnalogyResult({ result, onSave, onCopy, onNavigate }) {
  if (!result) return null;

  return (
    <div className="analogy-result">
      <div className="analogy-result__header">
        <div>
          <span className="analogy-result__badge">{result.perspective}</span>
          <h3 className="analogy-result__concept">{result.concept}</h3>
        </div>
        <div className="analogy-result__meta">
          <span className="analogy-result__chip">{result.difficulty}</span>
          <span className="analogy-result__chip">{result.style}</span>
        </div>
      </div>

      <div className="analogy-result__body">
        <div className="analogy-result__section">
          <h4 className="analogy-result__section-title">Generated Analogy</h4>
          <div className="analogy-result__content">
            {result.content.split("\n").map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="analogy-result__actions">
        <button className="btn btn--primary btn--sm" onClick={onSave}>Save</button>
        <button className="btn btn--secondary btn--sm" onClick={onCopy}>Copy</button>
        <button className="btn btn--secondary btn--sm" onClick={() => onNavigate("map")}>Add to Knowledge Map</button>
      </div>
    </div>
  );
}
