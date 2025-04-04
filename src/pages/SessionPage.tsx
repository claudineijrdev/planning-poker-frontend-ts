import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useCards } from '../hooks/useCards';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import NewVotingCard from '../components/NewVotingCard';
import { SessionStatus } from '../components/SessionStatus';
import './SessionPage.css';

export const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const { 
    username, 
    userId,
    sessionId, 
    setSessionId, 
    isConnected, 
    sendMessage,
    role,
  } = useUser();
  const isOwner = role === 'OWNER';
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

  // Atualiza o sessionId se vier da URL
  useEffect(() => {
    if (urlSessionId && (!sessionId || sessionId !== urlSessionId)) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, sessionId, setSessionId]);

  // Redireciona para home se não tiver username ou sessionId
  useEffect(() => {
    if (!username || !sessionId) {
      navigate('/');
    }
  }, [username, sessionId, navigate]);

  const handleCreateCard = async (data: { title: string; description: string }) => {
    await createCard(data.title, data.description);
    setShowNewVoting(false);
  };

  // Exemplo de envio de mensagem para o servidor
  const handleSendMessage = () => {
    if (isConnected) {
      sendMessage({
        type: 'user_action',
        action: 'vote',
        value: '5',
        userId: username
      });
    }
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
      <SessionStatus />
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