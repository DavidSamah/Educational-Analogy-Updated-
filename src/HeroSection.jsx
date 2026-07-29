import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
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
          <button className="btn btn--primary btn--lg" onClick={() => navigate("/generate")}>
            Generate an Analogy
          </button>
          <button className="btn btn--secondary btn--lg" onClick={() => navigate("/map")}>
            Explore Knowledge Map
          </button>
        </div>
      </div>
    </section>
  );
}

