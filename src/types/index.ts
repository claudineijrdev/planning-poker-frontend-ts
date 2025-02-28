export type SessionState = 'OPEN' | 'CLOSED';
export type UserRole = 'OWNER' | 'GUEST';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  joinedAt: string;
  sessionId: string;
}

export interface Session {
  id: string;
  code: string;
  createdAt: string;
  state: SessionState;
  ownerId: string;
  cards: Card[];
  users: User[];
}

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

export interface CreateSessionRequest {
  ownerName: string;
}

export interface CreateSessionResponse {
  session: Session;
  code: string;
}

export interface JoinSessionRequest {
  code: string;
  userName: string;
}

export interface UpdateSessionStateRequest {
  state: SessionState;
}

export interface CardProps {
  card: Card;
  onVote: (cardId: string) => void;
  onClose: (cardId: string) => void;
  selectedScore: number | null;
  onSelectScore: (score: number) => void;
  isOwner: boolean;
}

export interface SidebarProps {
  cards: Card[];
  currentCard: Card | null;
  onSelectCard: (card: Card) => void;
  onResetAllVotings: () => void;
  onNewVoting: () => void;
  isOwner: boolean;
}

export interface NewVotingCardProps {
  onSubmit: (card: { title: string; description: string }) => void;
  onCancel: () => void;
}

export interface VotingSectionProps {
  selectedScore: number | null;
  onSelectScore: (score: number) => void;
  onVote: () => void;
  onClose: () => void;
  isOwner: boolean;
}

export interface ResultsSectionProps {
  card: Card;
} 