import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../types';

interface UserContextType {
  username: string | null;
  userId: string | null;
  sessionId: string | null;
  role: UserRole | null;
  isOwner: boolean;
  setUsername: (username: string) => void;
  setUserId: (userId: string) => void;
  setSessionId: (sessionId: string) => void;
  setRole: (role: UserRole) => void;
  clearSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const clearSession = () => {
    setSessionId(null);
    setRole(null);
  };

  const isOwner = role === 'OWNER';

  return (
    <UserContext.Provider
      value={{
        username,
        userId,
        sessionId,
        role,
        isOwner,
        setUsername,
        setUserId,
        setSessionId,
        setRole,
        clearSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 