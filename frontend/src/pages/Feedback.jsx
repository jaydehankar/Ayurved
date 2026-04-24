import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Auto-populate from logged-in user
  const storedUser = JSON.parse(localStorage.getItem('ayurUser') || 'null');

  const [formData, setFormData] = useState({
    userName: storedUser?.name || '',
    email: storedUser?.email || '',
    rating: 0,
    message: '',
  });

  useEffect(() => {
    fetch(`${API_URL}/feedback`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFeedbacks(data.feedbacks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const setRating = (val) => {
    setFormData({ ...formData, rating: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.userName || !formData.email || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setFeedbacks((prev) => [...prev, data.feedback]);
        setFormData({ userName: storedUser?.name || '', email: storedUser?.email || '', rating: 0, message: '' });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Cannot connect to server.');
    }

    setSubmitting(false);
  };

  const renderStars = (count, size = '1rem') => {
    return (
      <span className="star-display" style={{ fontSize: size }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= count ? 'star filled' : 'star empty'}>★</span>
        ))}
      </span>
    );
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <div className="feedback-badge">💬 Your Voice Matters</div>
        <h1>Share Your Experience</h1>
        <p>Help us improve by sharing your feedback about the Ayurvedic diagnostic experience</p>
      </div>

      <div className="feedback-layout">
        {/* Feedback Form */}
        <div className="feedback-form-card">
          <h2>Write a Review</h2>

          {submitted && (
            <div className="feedback-toast">
              ✅ Thank you! Your feedback has been submitted.
            </div>
          )}

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="fb-name">Your Name</label>
              <input
                id="fb-name"
                type="text"
                name="userName"
                placeholder="Enter your name"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fb-email">Email Address</label>
              <input
                id="fb-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div className="star-selector">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={`star-btn ${i <= (hoverRating || formData.rating) ? 'active' : ''}`}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-label">
                  {formData.rating > 0 && ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating]}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fb-message">Your Feedback</label>
              <textarea
                id="fb-message"
                name="message"
                placeholder="Tell us about your experience…"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="feedback-submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Feedback →'}
            </button>
          </form>
        </div>

        {/* Existing Feedback */}
        <div className="feedback-list-section">
          <h2>What Others Say</h2>
          {loading ? (
            <div className="spinner"></div>
          ) : feedbacks.length === 0 ? (
            <p className="no-feedback">No feedback yet. Be the first to share!</p>
          ) : (
            <div className="feedback-list">
              {[...feedbacks].reverse().map((fb) => (
                <div className="feedback-testimonial" key={fb.id}>
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      {fb.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="testimonial-name">{fb.userName}</div>
                      <div className="testimonial-date">
                        {new Date(fb.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="testimonial-rating">
                      {renderStars(fb.rating)}
                    </div>
                  </div>
                  <p className="testimonial-message">{fb.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
