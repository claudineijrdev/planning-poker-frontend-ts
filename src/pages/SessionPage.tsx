import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCards } from '../hooks/useCards';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import NewVotingCard from '../components/NewVotingCard';
import './SessionPage.css';

const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { username, userId, sessionId, isOwner, clearSession } = useUser();
  const [showNewVoting, setShowNewVoting] = useState(false);

  const {
    cards,
    currentCard,
    selectedScore,
    loading,
    error,
    selectCard,
    selectScore,
    vote,
    closeVoting,
    createCard,
    resetAllVotings,
  } = useCards({ sessionId, userId });

  // Redireciona para home se não tiver username ou sessionId
  React.useEffect(() => {
    if (!username || !sessionId) {
      navigate('/');
    }
  }, [username, sessionId, navigate]);

  const handleCreateCard = async (data: { title: string; description: string }) => {
    await createCard(data.title, data.description);
    setShowNewVoting(false);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="session-page">
      <Header />
      <div className="session-content">
        <Sidebar
          cards={cards}
          currentCard={currentCard}
          onSelectCard={selectCard}
          onResetAllVotings={resetAllVotings}
          onNewVoting={() => setShowNewVoting(true)}
          isOwner={isOwner}
        />
        <main className="main-content">
          {showNewVoting ? (
            <NewVotingCard
              onSubmit={handleCreateCard}
              onCancel={() => setShowNewVoting(false)}
            />
          ) : currentCard ? (
            <Card
              card={currentCard}
              selectedScore={selectedScore}
              onSelectScore={selectScore}
              onVote={vote}
              onClose={closeVoting}
              isOwner={isOwner}
            />
          ) : (
            <div className="no-card-selected">
              <h2>Selecione um card para começar</h2>
              {isOwner && (
                <button
                  className="create-card-button"
                  onClick={() => setShowNewVoting(true)}
                >
                  Criar Novo Card
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SessionPage; 