import axios from 'axios';
import { Card, VotingData, User } from '../types';

const API_URL = 'http://localhost:3001';

export interface UserData {
  username: string;
  userId?: string;
  sessionId?: string;
  role?: string;
}

export interface SessionData {
  id: string;
  code: string;
  createdAt: string;
  state: 'OPEN' | 'CLOSED';
  ownerId: string;
  cards: Card[];
  users: User[];
}

export const api = {
  // Sessões
  createSession: async (name: string, ownerId: string): Promise<SessionData> => {
    const response = await axios.post(`${API_URL}/sessions`, { name, ownerId });
    return response.data;
  },
  
  getSession: async (sessionId: string): Promise<SessionData> => {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
    return response.data;
  },
  
  joinSession: async (sessionId: string, userData: UserData): Promise<UserData> => {
    const response = await axios.post(`${API_URL}/sessions/${sessionId}/join`, userData);
    return response.data;
  },
  
  leaveSession: async (sessionId: string, userId: string): Promise<void> => {
    await axios.post(`${API_URL}/sessions/${sessionId}/leave`, { userId });
  },
  
  // Usuários
  createUser: async (username: string): Promise<UserData> => {
    const response = await axios.post(`${API_URL}/users`, { username });
    return response.data;
  },
  
  updateUserRole: async (userId: string, role: string): Promise<UserData> => {
    const response = await axios.put(`${API_URL}/users/${userId}/role`, { role });
    return response.data;
  }
};

export const fetchCards = async (): Promise<Card[]> => {
  const response = await fetch(`${API_URL}/cards`);
  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }
  return response.json();
};

export const submitVote = async (cardId: string, score: number): Promise<void> => {
  const response = await fetch(`${API_URL}/cards/${cardId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit vote');
  }
};

export const closeVoting = async (cardId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/cards/${cardId}/close`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to close voting');
  }
};

export const resetAllVotings = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/cards/reset-all`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reset votings');
  }
};

export const createVoting = async (votingData: VotingData): Promise<void> => {
  const response = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(votingData),
  });
  if (!response.ok) {
    throw new Error('Failed to create voting');
  }
};

// Funções para enviar cards para o backend via API
export const createCard = async (sessionId: string, title: string, description: string, userId: string): Promise<Card> => {
  const response = await axios.post(`${API_URL}/sessions/${sessionId}/cards`, {
    title,
    description
  }, {
    headers: {
      'User-ID': userId
    }
  });
  return response.data;
};

export const voteCard = async (cardId: string, userId: string, score: number): Promise<void> => {
  await axios.post(`${API_URL}/cards/${cardId}/vote`, {
    score
  }, {
    headers: {
      'User-ID': userId
    }
  });
};

export const closeCardVoting = async (cardId: string, userId: string): Promise<void> => {
  await axios.post(`${API_URL}/cards/${cardId}/close`, {}, {
    headers: {
      'User-ID': userId
    }
  });
};

export const resetAllCards = async (sessionId: string, userId: string): Promise<void> => {
  await axios.post(`${API_URL}/sessions/${sessionId}/reset-votes`, {}, {
    headers: {
      'User-ID': userId
    }
  });
}; 