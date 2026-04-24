import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const doshaParam = searchParams.get('dosha');
    if (doshaParam) {
      setActiveFilter(doshaParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const url = activeFilter === 'All'
      ? `${API_URL}/doctors`
      : `${API_URL}/doctors?dosha=${activeFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoctors(data.doctors);
        else setError('Failed to load doctors');
        setLoading(false);
      })
      .catch(() => {
        setError('Cannot connect to server.');
        setLoading(false);
      });
  }, [activeFilter]);

  const filters = ['All', 'Vata', 'Pitta', 'Kapha'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading doctors…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <p style={{ color: 'var(--color-pitta)' }}>⚠ {error}</p>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <div className="doctors-header">
        <div className="doctors-badge">🏥 Verified Practitioners</div>
        <h1>Ayurvedic Doctors</h1>
        <p>Find authorized Ayurvedic practitioners specializing in your dosha type</p>
      </div>

      <div className="doctors-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-pill ${activeFilter === filter ? 'active' : ''} ${filter.toLowerCase()}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'Vata' && '🌬️ '}
            {filter === 'Pitta' && '🔥 '}
            {filter === 'Kapha' && '🌊 '}
            {filter === 'All' && '✦ '}
            {filter}
          </button>
        ))}
      </div>

      {doctors.length === 0 ? (
        <div className="no-doctors">
          <p>No doctors found for this specialization.</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc) => (
            <div className="doctor-card" key={doc.id}>
              <div className="doctor-card-top">
                <div className="doctor-avatar">{doc.image}</div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{doc.name}</h3>
                  <p className="doctor-qualification">{doc.qualification}</p>
                </div>
                <div className={`doctor-availability ${doc.available ? 'available' : 'unavailable'}`}>
                  {doc.available ? '● Available' : '● Unavailable'}
                </div>
              </div>

              <div className="doctor-specializations">
                {doc.specialization.map((spec) => (
                  <span key={spec} className={`spec-tag ${spec.toLowerCase()}`}>
                    {spec}
                  </span>
                ))}
              </div>

              <p className="doctor-about">{doc.about}</p>

              <div className="doctor-meta">
                <span>📍 {doc.hospital}</span>
                <span>⏳ {doc.experience}</span>
                <span>⭐ {doc.rating}</span>
              </div>

              <div className="doctor-actions">
                <a href={`tel:${doc.phone}`} className="doctor-btn call">
                  📞 Call
                </a>
                <a href={`mailto:${doc.email}`} className="doctor-btn email">
                  ✉️ Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Doctors;
