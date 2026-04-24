import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-badge">✦ Ancient Wisdom, Modern Insight</div>
      <h1 className="home-title">
        Discover Your <span className="highlight">Ayurvedic</span> Phenotype
      </h1>
      <p className="home-subtitle">
        Ayurveda recognizes three fundamental energies — Vata, Pitta, and Kapha —
        that govern our physical and mental well-being. Take our diagnostic quiz
        to understand your unique constitution and restore balance.
      </p>
      <button className="home-cta" onClick={() => navigate('/quiz')}>
        Begin Diagnosis →
      </button>

      <div className="home-features">
        <div className="feature-card">
          <div className="feature-icon">🌬️</div>
          <div className="feature-title">Vata</div>
          <div className="feature-desc">Air & Space — governs movement, creativity, and communication</div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔥</div>
          <div className="feature-title">Pitta</div>
          <div className="feature-desc">Fire & Water — governs digestion, metabolism, and intellect</div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌊</div>
          <div className="feature-title">Kapha</div>
          <div className="feature-desc">Earth & Water — governs structure, stability, and immunity</div>
        </div>
      </div>
    </div>
  );
}

export default Home;
