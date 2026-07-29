import knowledgeGraph from "../knowledge/graph";
import "./NodeDetailsPanel.css";

export default function NodeDetailsPanel({ node, onClose }) {
  const concept = node.data.label;
  const data = knowledgeGraph[concept];

  return (
    <div className="node-panel" role="dialog" aria-label={`Details for ${concept}`}>
      <div className="node-panel__header">
        <h3 className="node-panel__title">{concept}</h3>
        <button className="node-panel__close" onClick={onClose} aria-label="Close panel">×</button>
      </div>

      {data && (
        <div className="node-panel__body">
          <div className="node-panel__section">
            <span className="node-panel__badge">{data.category}</span>
            <p className="node-panel__definition">{data.definition}</p>
          </div>

          {data.related && data.related.length > 0 && (
            <div className="node-panel__section">
              <h4 className="node-panel__section-title">Related Concepts</h4>
              <ul className="node-panel__list">
                {data.related.map((rel, i) => (
                  <li key={i} className="node-panel__list-item">
                    <span className="node-panel__concept">{rel.concept}</span>
                    <span className="node-panel__rel">{rel.relationship}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.misconceptions && data.misconceptions.length > 0 && (
            <div className="node-panel__section">
              <h4 className="node-panel__section-title">Common Misconceptions</h4>
              <ul className="node-panel__list">
                {data.misconceptions.map((m, i) => (
                  <li key={i} className="node-panel__list-item">{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
