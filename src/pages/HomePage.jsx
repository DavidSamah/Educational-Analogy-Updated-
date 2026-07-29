import FeatureCard from "../components/FeatureCard";
import "./HomePage.css";

export default function HomePage({ onNavigate }) {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__hero-bg" aria-hidden="true">
          <div className="home__network">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="home__node" style={{ "--delay": `${i * 0.3}s` }} />
            ))}
            <svg className="home__lines" viewBox="0 0 400 400" aria-hidden="true">
              {[...Array(8)].map((_, i) => (
                <line key={i} x1="50" y1="50" x2="350" y2="350" stroke="currentColor" strokeWidth="1" opacity="0.15" />
              ))}
            </svg>
          </div>
        </div>
        <div className="home__hero-content">
          <h2 className="home__hero-title">Understand ideas by connecting them.</h2>
          <p className="home__hero-subtitle">
            Explore difficult concepts through meaningful analogies, visual relationships, and active learning.
          </p>
          <div className="home__hero-actions">
            <button className="btn btn--primary btn--lg" onClick={() => onNavigate("generate")}>
              Generate an Analogy
            </button>
            <button className="btn btn--secondary btn--lg" onClick={() => onNavigate("map")}>
              Explore Knowledge Map
            </button>
          </div>
        </div>
      </section>

      <section className="home__section">
        <h3 className="home__section-title">Continue Learning</h3>
        <div className="home__continue">
          <div className="home__continue-card">
            <div className="home__continue-header">
              <span className="home__continue-topic">Gravity</span>
              <span className="home__continue-badge">Physics</span>
            </div>
            <p className="home__continue-meta">Last activity: 2 hours ago</p>
            <div className="home__progress">
              <div className="home__progress-bar">
                <div className="home__progress-fill" style={{ width: "65%" }} />
              </div>
              <span className="home__progress-text">65%</span>
            </div>
            <button className="btn btn--primary" onClick={() => onNavigate("generate")}>Continue</button>
          </div>
        </div>
      </section>

      <section className="home__section">
        <h3 className="home__section-title">Start Exploring</h3>
        <div className="home__features">
          <FeatureCard
            icon="🔗"
            title="Explain Through Analogy"
            description="Connect a difficult idea to something familiar."
            onClick={() => onNavigate("generate")}
          />
          <FeatureCard
            icon="🕸️"
            title="Build a Knowledge Map"
            description="Visualise how concepts influence and depend on one another."
            onClick={() => onNavigate("map")}
          />
          <FeatureCard
            icon="🧪"
            title="Test Your Understanding"
            description="Create your own analogy and receive feedback."
            onClick={() => onNavigate("practice")}
          />
          <FeatureCard
            icon="🧭"
            title="Discover Related Ideas"
            description="Explore concepts that connect to what you are learning."
            onClick={() => onNavigate("explore")}
          />
        </div>
      </section>

      <section className="home__section">
        <div className="home__insight">
          <div className="home__insight-icon" aria-hidden="true">💡</div>
          <div>
            <h4 className="home__insight-title">Learning Insight</h4>
            <p className="home__insight-text">
              Strong understanding happens when you can explain an idea using a new situation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
