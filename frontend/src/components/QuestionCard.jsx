function QuestionCard({ question, selectedOption, onSelect }) {
  return (
    <div className="question-card">
      <div className="question-number">Question {question.id}</div>
      <span className="question-category">{question.category}</span>
      <p className="question-text">{question.question}</p>
      <div className="question-options">
        {question.options.map((option, idx) => (
          <label
            key={idx}
            className={`option-label ${selectedOption === option.text ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.text}
              checked={selectedOption === option.text}
              onChange={() => onSelect(question.id, option.text)}
            />
            <span className="option-radio"></span>
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;
