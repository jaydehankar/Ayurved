import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';

const API_URL = 'http://localhost:5000/api';

function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuestions(data.questions);
        else setError('Failed to load questions');
        setLoading(false);
      })
      .catch(() => {
        setError('Cannot connect to server. Make sure the backend is running.');
        setLoading(false);
      });
  }, []);

  const handleSelect = (questionId, optionText) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
      questionId: parseInt(qId),
      selectedOption: opt,
    }));

    try {
      const res = await fetch(`${API_URL}/submit-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/result', { state: { result: data.result } });
      } else {
        setError('Failed to process answers.');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading questions…</p>
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
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>Ayurvedic Assessment</h1>
        <p>Answer each question honestly for the most accurate diagnosis</p>
      </div>

      <div className="quiz-progress-text">
        {answeredCount} of {totalQuestions} answered
      </div>
      <div className="quiz-progress">
        <div
          className="quiz-progress-bar"
          style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
        />
      </div>

      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          selectedOption={answers[q.id] || ''}
          onSelect={handleSelect}
        />
      ))}

      <div className="submit-section">
        <button
          className="submit-btn"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Analyzing…' : 'Get My Diagnosis →'}
        </button>
        {!allAnswered && answeredCount > 0 && (
          <p className="submit-warning">
            Please answer all {totalQuestions} questions before submitting
          </p>
        )}
      </div>
    </div>
  );
}

export default Questionnaire;
