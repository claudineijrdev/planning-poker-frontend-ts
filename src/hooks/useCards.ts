import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Card, Session } from '../types';

interface UseCardsProps {
  sessionId: string | null; // Este é o code da sessão
  userId: string | null;
}

export const useCards = ({ sessionId, userId }: UseCardsProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const loadCards = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Erro ao carregar cards');
      
      const data: Session = await response.json();
      setSession(data);
      setCards(data.cards || []);
      
      // Atualiza o card atual se ele existir nos novos cards
      if (currentCard) {
        const updatedCurrentCard = data.cards?.find(c => c.id === currentCard.id);
        setCurrentCard(updatedCurrentCard || null);
      }
    } catch (err) {
      toast.error('Erro ao carregar os cards');
      setError('Erro ao carregar os cards');
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentCard]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const selectCard = (card: Card) => {
    setCurrentCard(card);
    setSelectedScore(null);
  };

  const selectScore = (score: number) => {
    setSelectedScore(score);
  };

  const vote = async (cardId: string) => {
    if (!selectedScore || !userId || !sessionId) return;

    try {
      const response = await fetch(`http://localhost:3001/sessions/${sessionId}/cards/${cardId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId
        },
        body: JSON.stringify({ score: selectedScore }),
      });

      if (!response.ok) throw new Error('Erro ao votar');
      
      loadCards();
      setSelectedScore(null);
      toast.success('Voto registrado com sucesso!');
    } catch (err) {
      toast.error('Erro ao registrar voto');
    }
  };

  const closeVoting = async (cardId: string) => {
    if (!userId || !sessionId) return;

    try {
      const response = await fetch(`http://localhost:3001/sessions/${sessionId}/cards/${cardId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId
        },
      });

      if (!response.ok) throw new Error('Erro ao fechar votação');
      
      loadCards();
      toast.success('Votação encerrada com sucesso!');
    } catch (err) {
      toast.error('Erro ao encerrar votação');
    }
  };

  const createCard = async (title: string, description: string) => {
    if (!userId || !sessionId) {
      console.log('Debug - Valores:', { userId, sessionId });
      let errorMsg = 'Erro ao criar card: ';
      if (!userId) errorMsg += 'Usuário não identificado. ';
      if (!sessionId) errorMsg += 'Código da sessão não encontrado. ';
      toast.error(errorMsg);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/sessions/${sessionId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar card');
      }
      
      const newCard = await response.json();
      loadCards();
      setCurrentCard(newCard);
      toast.success('Card criado com sucesso!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao criar card');
      }
    }
  };

  const resetAllVotings = async () => {
    if (!userId || !sessionId) return;

    try {
      const response = await fetch(`http://localhost:3001/sessions/${sessionId}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId
        },
      });

      if (!response.ok) throw new Error('Erro ao resetar votações');
      
      loadCards();
      setCurrentCard(null);
      setSelectedScore(null);
      toast.success('Todas as votações foram resetadas!');
    } catch (err) {
      toast.error('Erro ao resetar votações');
    }
  };

  return {
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
  };
}; 