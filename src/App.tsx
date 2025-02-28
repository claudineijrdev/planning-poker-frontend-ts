import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Card from './components/Card';
import NewVotingCard from './components/NewVotingCard';
import { useCards } from './hooks/useCards';
import { VotingData } from './types';
import './styles/global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App: React.FC = () => {
  const [isNewVotingOpen, setIsNewVotingOpen] = useState<boolean>(false);
  const {
    cards,
    currentCard,
    selectedScore,
    loading,
    handleSelectCard,
    handleSelectScore,
    handleVote,
    handleCloseVoting,
    handleResetAllVotings,
    handleCreateVoting,
  } = useCards();

  const handleNewVoting = (): void => {
    setIsNewVotingOpen(true);
  };

  const handleCancelNewVoting = (): void => {
    setIsNewVotingOpen(false);
  };

  const handleSubmitNewVoting = async (votingData: VotingData): Promise<void> => {
    await handleCreateVoting(votingData);
    setIsNewVotingOpen(false);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Sidebar
        cards={cards}
        currentCard={currentCard}
        onSelectCard={handleSelectCard}
        onResetAllVotings={handleResetAllVotings}
        onNewVoting={handleNewVoting}
      />
      <div className="main-content">
        <h1>Scrum Planning Poker</h1>
        <div className="card-container">
          {isNewVotingOpen ? (
            <NewVotingCard
              onSubmit={handleSubmitNewVoting}
              onCancel={handleCancelNewVoting}
            />
          ) : currentCard ? (
            <Card
              card={currentCard}
              selectedScore={selectedScore}
              onSelectScore={handleSelectScore}
              onVote={handleVote}
              onClose={handleCloseVoting}
            />
          ) : (
            <div className="empty-state">
              <p>Nenhum card disponível para votação.</p>
              <p>Clique em "Nova Votação" para criar um novo card.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
