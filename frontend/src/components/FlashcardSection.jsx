import { useState } from 'react';
import { Brain, RotateCw } from 'lucide-react';
import './FlashcardSection.css';

const FlashcardSection = ({ flashcards }) => {
  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleCard = (index) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  return (
    <div>
      
      
      <div className="flashcards-grid">
        {flashcards.map((card, index) => (
          <div
            key={index}
            className={`flashcard ${flippedCards.has(index) ? 'flipped' : ''}`}
            onClick={() => toggleCard(index)}
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">
                <div className="card-icon">
                  <Brain size={24} />
                </div>
                <p className="card-text">{card.question}</p>
                <div className="card-hint">
                  <RotateCw size={16} />
                  <span>Click to reveal answer</span>
                </div>
              </div>
              <div className="flashcard-back">
                <div className="card-icon">
                  <Brain size={24} />
                </div>
                <p className="card-text">{card.answer}</p>
                <div className="card-hint">
                  <RotateCw size={16} />
                  <span>Click to see question</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardSection;