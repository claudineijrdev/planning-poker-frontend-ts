import React from 'react';
import VotingSection from '../VotingSection';
import ResultsSection from '../ResultsSection';
import { CardProps } from '../../types';
import './styles.css';

const Card: React.FC<CardProps> = ({ 
  card, 
  onVote, 
  onClose, 
  selectedScore, 
  onSelectScore,
  isOwner
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{card.title}</h2>
        <p>{card.description}</p>
      </div>
      
      <div className="card-content">
        {!card.closed ? (
          <VotingSection
            selectedScore={selectedScore}
            onSelectScore={onSelectScore}
            onVote={() => onVote(card.id)}
            onClose={() => onClose(card.id)}
            isOwner={isOwner}
          />
        ) : (
          <ResultsSection card={card} />
        )}
      </div>
    </div>
  );
};

export default Card; 