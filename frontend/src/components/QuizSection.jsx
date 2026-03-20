import { useState } from 'react';
import { Award, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import './QuizSection.css';

const QuizSection = ({ quiz }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState(new Set());

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));

    const newExplanations = new Set(showExplanations);
    newExplanations.add(questionIndex);
    setShowExplanations(newExplanations);
  };

  const isCorrect = (questionIndex) => {
    return selectedAnswers[questionIndex] === quiz[questionIndex].answer;
  };

  const hasAnswered = (questionIndex) => {
    return questionIndex in selectedAnswers;
  };

  return (
    <div>
      <div className="quiz-container">
        {quiz.map((question, index) => (
          <div key={index} className="quiz-question">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              {hasAnswered(index) && (
                <span className={`answer-badge ${isCorrect(index) ? 'correct' : 'incorrect'}`}>
                  {isCorrect(index) ? (
                    <>
                      <CheckCircle size={16} />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Incorrect
                    </>
                  )}
                </span>
              )}
            </div>

            <h3 className="question-text">{question.question}</h3>

            {question.options.length > 0 ? (
              <div className="options-grid">
                {question.options.map((option, optIndex) => {
                  const isSelected = selectedAnswers[index] === option;
                  const isCorrectOption = option === question.answer;
                  const showResult = hasAnswered(index);

                  return (
                    <button
                      key={optIndex}
                      className={`option-button ${isSelected ? 'selected' : ''} ${
                        showResult && isCorrectOption ? 'correct' : ''
                      } ${showResult && isSelected && !isCorrectOption ? 'incorrect' : ''}`}
                      onClick={() => handleAnswerSelect(index, option)}
                      disabled={hasAnswered(index)}
                    >
                      <span className="option-text">{option}</span>
                      {showResult && isCorrectOption && (
                        <CheckCircle className="option-icon" size={20} />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <XCircle className="option-icon" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-answer-section">
                <textarea
                  className="text-answer-input"
                  placeholder="Type your answer here..."
                  value={selectedAnswers[index] || ''}
                  onChange={(e) => handleAnswerSelect(index, e.target.value)}
                  rows={4}
                />
                {!hasAnswered(index) && (
                  <button
                    className="submit-button"
                    onClick={() => handleAnswerSelect(index, selectedAnswers[index] || '')}
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            )}

            {showExplanations.has(index) && (
              <div className={`explanation ${hasAnswered(index) ? 'show' : ''}`}>
                <div className="explanation-header">
                  <HelpCircle size={18} />
                  <span>Explanation</span>
                </div>
                <p className="explanation-text">{question.explanation}</p>
                {question.options.length === 0 && (
                  <div className="correct-answer-box">
                    <strong>Correct Answer:</strong> {question.answer}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSection;