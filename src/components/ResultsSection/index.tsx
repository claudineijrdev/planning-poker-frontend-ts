import React from 'react';
import { Card } from '../../types';
import './styles.css';

interface ResultsSectionProps {
  card: Card;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ card }) => {
  return (
    <div className="results-section">
      <div className="voting-results">
        <h3>Resultado da Votação</h3>
        {card.votes.length > 0 ? (
          <>
            <div className="average-score">
              <span>Média das notas:</span>
              <strong>{card.result.average.toFixed(1)}</strong>
            </div>
            <div className="score-distribution">
              <h4>Distribuição dos votos:</h4>
              <div className="distribution-bars">
                {Object.entries(card.result.distribution)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([score, count]) => (
                    <div key={score} className="distribution-bar">
                      <div className="score-label">{score}</div>
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{ width: `${(count / card.votes.length) * 100}%` }}
                        />
                      </div>
                      <div className="percentage">
                        {((count / card.votes.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <p className="no-votes-message">Aguardando resultado da votação...</p>
        )}
      </div>
    </div>
  );
};

export default ResultsSection; 