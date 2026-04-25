import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const doshaInfo = {
  Vata: {
    icon: '🌬️',
    tagline: 'The Energy of Movement',
    color: 'vata',
    description:
      'You have a dominant Vata constitution — governed by Air and Space elements. Vata types are creative, quick-thinking, and energetic. When balanced, you are lively and enthusiastic. When imbalanced, you may experience anxiety, dry skin, insomnia, and irregular digestion. To restore balance, favour warm, cooked foods, maintain a regular routine, stay hydrated, and practice calming activities like yoga and meditation.',
  },
  Pitta: {
    icon: '🔥',
    tagline: 'The Energy of Transformation',
    color: 'pitta',
    description:
      'You have a dominant Pitta constitution — governed by Fire and Water elements. Pitta types are sharp, focused, and ambitious. When balanced, you are confident and a natural leader. When imbalanced, you may experience irritability, inflammation, heartburn, and skin rashes. To restore balance, favour cooling foods, avoid excessive heat, practice moderation, and engage in calming, non-competitive activities.',
  },
  Kapha: {
    icon: '🌊',
    tagline: 'The Energy of Structure',
    color: 'kapha',
    description:
      'You have a dominant Kapha constitution — governed by Earth and Water elements. Kapha types are calm, nurturing, and strong. When balanced, you are loving and steady. When imbalanced, you may experience weight gain, lethargy, congestion, and excessive sleep. To restore balance, favour light and spicy foods, stay physically active, seek stimulation and variety, and avoid oversleeping.',
  },
};

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  const [remedies, setRemedies] = useState(null);
  const [remediesLoading, setRemediesLoading] = useState(false);
  const [expandedRemedy, setExpandedRemedy] = useState(null);

  const primaryDosha = result ? result.dominantDosha.split('-')[0] : null;
  const info = primaryDosha ? (doshaInfo[primaryDosha] || doshaInfo.Vata) : null;

  useEffect(() => {
    if (primaryDosha) {
      setRemediesLoading(true);
      fetch(`${API_URL}/remedies/${primaryDosha}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRemedies(data.data);
          }
          setRemediesLoading(false);
        })
        .catch(() => {
          setRemediesLoading(false);
        });
    }
  }, [primaryDosha]);

  if (!result) {
    return (
      <div className="loading-container">
        <p>No results found.</p>
        <button className="result-btn primary" onClick={() => navigate('/quiz')}>
          Take the Quiz
        </button>
      </div>
    );
  }

  const { dominantDosha, scores, totalQuestions } = result;

  return (
    <div className="result-page">
      <h1>Your Diagnosis</h1>
      <p className="result-subtitle">Based on your {totalQuestions} responses</p>

      <div className={`result-dosha-card ${info.color}`}>
        <div className="dosha-icon">{info.icon}</div>
        <div className={`dosha-name ${info.color}`}>{dominantDosha}</div>
        <div className="dosha-tagline">{info.tagline}</div>
        <p className="dosha-description">{info.description}</p>
      </div>

      <div className="score-section">
        <h3>Score Breakdown</h3>
        {Object.entries(scores).map(([dosha, score]) => (
          <div className="score-bar-container" key={dosha}>
            <div className="score-bar-header">
              <span>{dosha}</span>
              <span>{score} / {totalQuestions}</span>
            </div>
            <div className="score-bar">
              <div
                className={`score-bar-fill ${dosha.toLowerCase()}`}
                style={{ width: `${totalQuestions ? (score / totalQuestions) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Personalized Remedies Section ── */}
      <div className="remedies-section">
        <div className="remedies-header">
          <span className="remedies-badge">🌿 Personalized for {primaryDosha}</span>
          <h2>Home Remedies & Recommendations</h2>
          {remedies && <p className="remedies-summary">{remedies.summary}</p>}
        </div>

        {remediesLoading && (
          <div className="remedies-loading">
            <div className="spinner"></div>
            <p>Loading your personalized remedies…</p>
          </div>
        )}

        {!remediesLoading && remedies && (
          <div className="remedies-grid">
            {remedies.remedies.map((remedy) => (
              <div
                className={`remedy-card ${expandedRemedy === remedy.id ? 'expanded' : ''}`}
                key={remedy.id}
                onClick={() => setExpandedRemedy(expandedRemedy === remedy.id ? null : remedy.id)}
              >
                <div className="remedy-card-top">
                  <span className="remedy-icon">{remedy.icon}</span>
                  <span className={`remedy-category ${info.color}`}>{remedy.category}</span>
                </div>
                <h4 className="remedy-title">{remedy.title}</h4>
                <p className="remedy-description">{remedy.description}</p>

                {expandedRemedy === remedy.id && (
                  <div className="remedy-howto">
                    <div className="howto-label">
                      <span>📋</span> How to prepare
                    </div>
                    <p>{remedy.howTo}</p>
                  </div>
                )}

                <div className="remedy-expand-hint">
                  {expandedRemedy === remedy.id ? 'Click to collapse ▲' : 'Click for instructions ▼'}
                </div>
              </div>
            ))}
          </div>
        )}

        {!remediesLoading && !remedies && (
          <p className="no-remedies">Could not load remedies. Please make sure the backend server is running.</p>
        )}
      </div>

      <div className="result-actions">
        <button className="result-btn primary" onClick={() => navigate(`/doctors?dosha=${primaryDosha}`)}>
          🩺 Find Doctors for {primaryDosha}
        </button>
        <button className="result-btn secondary" onClick={() => navigate('/feedback')}>
          💬 Give Feedback
        </button>
        <button className="result-btn secondary" onClick={() => navigate('/quiz')}>
          Retake Quiz
        </button>
        <button className="result-btn secondary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Result;
