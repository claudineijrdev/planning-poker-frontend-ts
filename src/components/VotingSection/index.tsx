import React from 'react';
import './styles.css';

const SCORE_OPTIONS = [1, 2, 3, 5, 8, 13, 21] as const;

interface VotingSectionProps {
  selectedScore: number | null;
  onSelectScore: (score: number) => void;
  onVote: () => void;
  onClose: () => void;
}

const VotingSection: React.FC<VotingSectionProps> = ({ 
  selectedScore, 
  onSelectScore, 
  onVote, 
  onClose 
}) => {
  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    onVote();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="voting-section">
      <div className="vote-buttons">
        {SCORE_OPTIONS.map((score) => (
          <button
            key={score}
            type="button"
            className={`vote-button ${selectedScore === score ? 'selected' : ''}`}
            onClick={() => onSelectScore(score)}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="action-buttons">
        <button 
          type="button"
          className="vote-action-button"
          onClick={handleVote}
          disabled={!selectedScore}
        >
          Votar
        </button>
        <button 
          type="button"
          className="close-voting-button"
          onClick={handleClose}
        >
          Fechar Votação
        </button>
      </div>
    </div>
  );
};

export default VotingSection; 