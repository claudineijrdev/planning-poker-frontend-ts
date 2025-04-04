import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

const STORAGE_KEY = 'user_session';
const SESSION_ACTIVE_KEY = 'session_active';
const REDIRECT_IN_PROGRESS_KEY = 'redirect_in_progress';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).username : null;
  });
  const [userId, setUserId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).userId : null;
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).sessionId : null;
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).role : null;
  });

  // Verifica se já existe uma sessão ativa
  useEffect(() => {
    const checkActiveSession = () => {
      // Evita redirecionamentos em loop
      if (localStorage.getItem(REDIRECT_IN_PROGRESS_KEY)) {
        return;
      }

      const activeSession = localStorage.getItem(SESSION_ACTIVE_KEY);
      const storedSession = localStorage.getItem(STORAGE_KEY);
      const currentPath = window.location.pathname;
      
      // Se temos uma sessão ativa
      if (activeSession && storedSession) {
        const parsedSession = JSON.parse(storedSession);
        
        // Se estamos na página inicial (login) e existe uma sessão ativa
        if (currentPath === '/' && parsedSession.username && parsedSession.sessionId) {
          // Marca que um redirecionamento está em andamento
          localStorage.setItem(REDIRECT_IN_PROGRESS_KEY, 'true');
          // Redireciona para a página da sessão específica
          window.location.href = `/session/${parsedSession.sessionId}`;
          return;
        }
      } 
      // Se não temos uma sessão ativa
      else if (currentPath.startsWith('/session/')) {
        // Marca que um redirecionamento está em andamento
        localStorage.setItem(REDIRECT_IN_PROGRESS_KEY, 'true');
        // Redireciona para a página inicial
        window.location.href = '/';
        return;
      }
    };

    // Verifica ao montar o componente
    checkActiveSession();

    // Adiciona listener para eventos de storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_ACTIVE_KEY || e.key === STORAGE_KEY) {
        checkActiveSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [username]);

  // Atualiza o localStorage quando os dados do usuário mudam
  useEffect(() => {
    if (username) {
      const userData = {
        username,
        userId,
        sessionId,
        role,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      // Limpa a flag de redirecionamento em andamento
      localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
    }
  }, [username, userId, sessionId, role]);

  const clearSession = () => {
    setUsername(null);
    setUserId(null);
    setSessionId(null);
    setRole(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_ACTIVE_KEY);
    localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
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