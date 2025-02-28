import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchCards, submitVote, closeVoting, resetAllVotings, createVoting } from '../services/api';
import { Card, VotingData } from '../types';

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadCards = async (): Promise<void> => {
    try {
      const data = await fetchCards();
      setCards(data || []);
      
      if (currentCard) {
        const updatedCurrentCard = data?.find(card => card.id === currentCard.id);
        setCurrentCard(updatedCurrentCard || null);
      }
    } catch (err) {
      console.error('Erro ao carregar os cards:', err);
      toast.error('Erro ao carregar os cards');
      setCards([]);
      setCurrentCard(null);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await loadCards();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSelectCard = (card: Card): void => {
    setCurrentCard(card);
    setSelectedScore(null);
  };

  const handleSelectScore = (score: number): void => {
    setSelectedScore(score);
  };

  const handleVote = async (cardId: string): Promise<void> => {
    if (!selectedScore) return;

    try {
      await submitVote(cardId, selectedScore);
      setSelectedScore(null);
      await loadCards();
      toast.success('Voto registrado com sucesso!');
    } catch (err) {
      toast.error('Erro ao enviar o voto');
      console.error(err);
    }
  };

  const handleCloseVoting = async (cardId: string): Promise<void> => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card || !card.votes || card.votes.length === 0) {
        toast.info('Não é possível fechar a votação sem votos');
        return;
      }

      await closeVoting(cardId);
      await loadCards();
      toast.success('Votação encerrada com sucesso!');
    } catch (err) {
      toast.error('Erro ao fechar a votação');
      console.error(err);
    }
  };

  const handleResetAllVotings = async (): Promise<void> => {
    try {
      setLoading(true);
      await resetAllVotings();
      setSelectedScore(null);
      await loadCards();
      toast.success('Todas as votações foram resetadas!');
    } catch (err) {
      toast.error('Erro ao resetar as votações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoting = async (votingData: VotingData): Promise<void> => {
    try {
      setLoading(true);
      await createVoting(votingData);
      await loadCards();
      toast.success('Nova votação criada com sucesso!');
    } catch (err) {
      toast.error('Erro ao criar nova votação');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}; 