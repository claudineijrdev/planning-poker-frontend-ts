import { Card, VotingData } from '../types';

const API_URL = 'http://localhost:3001';

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