export interface Card {
  id: string;
  title: string;
  description: string;
  closed: boolean;
  votes: number[];
  result: Result;
}

export interface Result {
  average: number;
  distribution: Record<number, number>;
}

export interface Vote {
  score: number;
}

export interface VotingData {
  title: string;
  description: string;
}

export interface CardProps {
  card: Card;
  selectedScore: number | null;
  onSelectScore: (score: number) => void;
  onVote: (cardId: string) => Promise<void>;
  onClose: (cardId: string) => Promise<void>;
}

export interface SidebarProps {
  cards: Card[];
  currentCard: Card | null;
  onSelectCard: (card: Card) => void;
  onResetAllVotings: () => Promise<void>;
  onNewVoting: () => void;
}

export interface NewVotingCardProps {
  onSubmit: (data: VotingData) => Promise<void>;
  onCancel: () => void;
} 