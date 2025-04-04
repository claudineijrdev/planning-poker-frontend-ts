import React from 'react';
import { SidebarProps } from '../../types';
import './styles.css';

const Sidebar: React.FC<SidebarProps> = ({ 
  cards, 
  currentCard, 
  onSelectCard, 
  onResetAllVotings, 
  onNewVoting,
  isOwner
}) => {
  const hasClosedCards = cards.some(card => card.closed);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Cards Disponíveis</h2>
      </div>
      <div className="cards-list">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card-item ${currentCard?.id === card.id ? 'selected' : ''}`}
            onClick={() => onSelectCard(card)}
          >
            <h3>{card.title}</h3>
            {card.closed && <span className="status-closed">Fechado</span>}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        {isOwner && (
          <>
            <button className="new-voting-button" onClick={onNewVoting}>
              Criar novo Card
            </button>
            <button
              className="reset-all-button"
              onClick={onResetAllVotings}
              disabled={!hasClosedCards}
            >
              Resetar Votações
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 