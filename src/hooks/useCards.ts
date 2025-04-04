import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Card, Session } from '../types';
import { useUser } from '../contexts/UserContext';
import { api, createCard, voteCard, closeCardVoting, resetAllCards } from '../services/api';
import { createCard as apiCreateCard } from '../services/api';

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
  const { sendMessage, registerWebSocketHandler } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  
  // Referência para controlar se já registramos o handler
  const handlerRegisteredRef = useRef<boolean>(false);
  // Referência para armazenar a função de desregistro do handler
  const unregisterHandlerRef = useRef<(() => void) | null>(null);

  const loadCards = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await api.getSession(sessionId);
      const session: Session = response;
      setSession(session);
      setCards(session.cards || []);
      
      // Atualiza o role do usuário com base no ownerId da sessão
      const currentUser = session.users.find(user => user.id === userId);
      if (currentUser) {
        const isOwner = currentUser.id === session.ownerId;
        setRole(isOwner ? 'OWNER' : 'GUEST');
        setIsOwner(isOwner);
      }
      
      // Atualiza o card atual se ele existir nos novos cards
      if (currentCard) {
        const updatedCurrentCard = session.cards?.find(c => c.id === currentCard.id);
        if (!updatedCurrentCard) {
          setCurrentCard(null);
        } else if (JSON.stringify(updatedCurrentCard) !== JSON.stringify(currentCard)) {
          setCurrentCard(updatedCurrentCard);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
      setError('Erro ao carregar cards');
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentCard, userId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Função para lidar com atualizações via websocket
  const handleWebSocketUpdate = useCallback((data: any) => {
    console.log('Recebendo atualização via websocket:', data);
    
    if (data.type === 'session_update' && data.session) {
      const updatedSession: Session = data.session;
      setSession(updatedSession);
      setCards(updatedSession.cards || []);
      
      // Atualiza o card atual se ele existir nos novos cards
      if (currentCard) {
        const updatedCurrentCard = updatedSession.cards?.find(c => c.id === currentCard.id);
        if (!updatedCurrentCard) {
          setCurrentCard(null);
        } else if (JSON.stringify(updatedCurrentCard) !== JSON.stringify(currentCard)) {
          setCurrentCard(updatedCurrentCard);
        }
      }
    } else if (data.type === 'card_update' && data.card) {
      const updatedCard: Card = data.card;
      
      // Atualiza o card na lista
      setCards(prevCards => 
        prevCards.map(card => card.id === updatedCard.id ? updatedCard : card)
      );
      
      // Atualiza o card atual se for o mesmo
      if (currentCard && currentCard.id === updatedCard.id) {
        setCurrentCard(updatedCard);
      }
    } else if (data.id && data.title && data.description) {
      // Caso a mensagem seja um card diretamente (sem o tipo)
      const updatedCard: Card = data as Card;
      console.log('Atualizando card diretamente:', updatedCard);
      
      // Atualiza o card na lista
      setCards(prevCards => {
        const cardExists = prevCards.some(card => card.id === updatedCard.id);
        if (!cardExists) {
          // Se o card não existir, adiciona à lista
          return [...prevCards, updatedCard];
        } else {
          // Se o card existir, atualiza
          return prevCards.map(card => card.id === updatedCard.id ? updatedCard : card);
        }
      });
      
      // Atualiza o card atual se for o mesmo
      if (currentCard && currentCard.id === updatedCard.id) {
        setCurrentCard(updatedCard);
      }
    }
  }, [currentCard]); // Adicionada a dependência de currentCard

  // Registra o handler para mensagens do websocket apenas uma vez
  useEffect(() => {
    if (sessionId && userId && !handlerRegisteredRef.current) {
      console.log('Registrando handler para websocket com sessionId:', sessionId, 'e userId:', userId);
      
      // Envia uma mensagem para o servidor informando que estamos interessados em atualizações
      sendMessage({
        type: 'subscribe',
        sessionId,
        userId
      });
      
      // Registra o handler para mensagens do websocket
      unregisterHandlerRef.current = registerWebSocketHandler(handleWebSocketUpdate);
      handlerRegisteredRef.current = true;
      
      // Limpa o handler quando o componente for desmontado
      return () => {
        if (unregisterHandlerRef.current) {
          console.log('Removendo handler para websocket');
          unregisterHandlerRef.current();
          handlerRegisteredRef.current = false;
        }
      };
    }
  }, [sessionId, userId, sendMessage, registerWebSocketHandler, handleWebSocketUpdate]);

  const selectCard = useCallback((card: Card) => {
    setCurrentCard(card);
    setSelectedScore(null);
  }, []);

  const selectScore = useCallback((score: number) => {
    setSelectedScore(score);
  }, []);

  const vote = async (cardId: string) => {
    if (!sessionId || !userId || selectedScore === null) return;

    try {
      console.log('Enviando voto via API:', { cardId, score: selectedScore });
      
      // Envia o voto via API
      await voteCard(cardId, userId, selectedScore);
      
      // Atualiza o estado local
      setCards(prevCards => 
        prevCards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              votes: [...card.votes, selectedScore]
            };
          }
          return card;
        })
      );
      
      // Atualiza o card atual
      if (currentCard && currentCard.id === cardId) {
        setCurrentCard({
          ...currentCard,
          votes: [...currentCard.votes, selectedScore]
        });
      }
      
      setSelectedScore(null);
      toast.success('Voto registrado com sucesso!');
    } catch (err) {
      console.error('Erro ao registrar voto:', err);
      toast.error('Erro ao registrar voto');
    }
  };

  const closeVoting = async (cardId: string) => {
    if (!sessionId || !userId) return;

    try {
      console.log('Enviando solicitação de fechamento via API:', { cardId });
      
      // Envia a solicitação de fechamento via API
      await closeCardVoting(cardId, userId);
      
      // Atualiza o estado local
      setCards(prevCards => 
        prevCards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              closed: true
            };
          }
          return card;
        })
      );
      
      // Atualiza o card atual
      if (currentCard && currentCard.id === cardId) {
        setCurrentCard({
          ...currentCard,
          closed: true
        });
      }
      
      toast.success('Votação fechada com sucesso!');
    } catch (err) {
      console.error('Erro ao fechar votação:', err);
      toast.error('Erro ao fechar votação');
    }
  };

  const createCard = async (title: string, description: string) => {
    if (!sessionId || !userId) return;

    try {
      console.log('Enviando solicitação de criação de card via API:', { title, description });
      
      // Envia a solicitação de criação via API
      const newCard = await apiCreateCard(sessionId, title, description, userId);
      
      // Atualiza o estado local
      setCards(prevCards => [...prevCards, newCard]);
      
      toast.success('Card criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar card:', err);
      toast.error('Erro ao criar card');
    }
  };

  const resetAllVotings = async () => {
    if (!sessionId || !userId) return;

    try {
      console.log('Enviando solicitação de reset via API');
      
      // Envia a solicitação de reset via API
      await resetAllCards(sessionId, userId);
      
      // Atualiza o estado local
      setCards(prevCards => 
        prevCards.map(card => ({
          ...card,
          votes: [],
          closed: false
        }))
      );
      
      // Atualiza o card atual
      if (currentCard) {
        setCurrentCard({
          ...currentCard,
          votes: [],
          closed: false
        });
      }
      
      toast.success('Votações resetadas com sucesso!');
    } catch (err) {
      console.error('Erro ao resetar votações:', err);
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
    role,
    isOwner,
  };
}; 