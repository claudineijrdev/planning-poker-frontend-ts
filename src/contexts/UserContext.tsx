import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { UserRole } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import { api, UserData } from '../services/api';

interface UserContextType {
  username: string | null;
  userId: string | null;
  sessionId: string | null;
  role: UserRole | null;
  isConnected: boolean;
  setUsername: (username: string) => void;
  setUserId: (userId: string) => void;
  setSessionId: (sessionId: string) => void;
  setRole: (role: UserRole) => void;
  clearSession: () => void;
  sendMessage: (message: any) => boolean;
  registerWebSocketHandler: (handler: (data: any) => void) => () => void;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  createSession: (name: string) => Promise<string>;
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
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const webSocketHandlers = useRef<((data: any) => void)[]>([]);
  const subscribedRef = useRef<boolean>(false);
  
  // Determinar se devemos conectar ao websocket
  const shouldConnect = Boolean(sessionId && window.location.pathname.includes('/session/'));
  
  // Função para registrar handlers de websocket
  const registerWebSocketHandler = useCallback((handler: (data: any) => void) => {
    webSocketHandlers.current.push(handler);
    return () => {
      webSocketHandlers.current = webSocketHandlers.current.filter(h => h !== handler);
    };
  }, []);
  
  // Função para processar mensagens do websocket
  const processWebSocketMessage = useCallback((data: any) => {
    console.log('Processando mensagem do websocket:', data);
    
    // Verifica se a mensagem é um objeto
    if (typeof data === 'object' && data !== null) {
      webSocketHandlers.current.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Erro ao processar mensagem do websocket em um handler:', error);
        }
      });
    } else {
      console.error('Mensagem do websocket não é um objeto:', data);
    }
  }, [webSocketHandlers]);
  
  // Criar uma instância do websocket
  const { sendMessage: wsSendMessage, lastMessage } = useWebSocket({
    sessionId: shouldConnect ? sessionId : null,
    username: shouldConnect ? username : null
  });
  
  // Atualizar o estado de conexão
  useEffect(() => {
    if (lastMessage) {
      processWebSocketMessage(lastMessage);
    }
  }, [lastMessage, processWebSocketMessage]);
  
  // Efeito para enviar a mensagem de subscribe quando a conexão for estabelecida
  useEffect(() => {
    if (sessionId && userId && !subscribedRef.current) {
      console.log('Enviando mensagem de subscribe para o websocket');
      wsSendMessage({
        type: 'subscribe',
        payload: {
          sessionId,
          userId,
          username,
          role
        },
        timestamp: Date.now()
      });
      subscribedRef.current = true;
    }
  }, [sessionId, userId, username, role, wsSendMessage]);
  
  // Função para enviar mensagens através do websocket
  const sendMessage = useCallback((message: any) => {
    return wsSendMessage({
      ...message,
      timestamp: Date.now(),
      sessionId,
      userId,
      username,
      role
    });
  }, [wsSendMessage, sessionId, userId, username, role]);
  
  // Função para criar uma nova sessão
  const createSession = useCallback(async (name: string): Promise<string> => {
    if (!username || !userId) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      const session = await api.createSession(name, userId);
      setSessionId(session.id);
      setRole('OWNER');
      return session.id;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }, [username, userId]);
  
  // Função para entrar em uma sessão
  const joinSession = useCallback(async (newSessionId: string): Promise<void> => {
    if (!username) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      const userData: UserData = {
        username,
        userId: userId || undefined,
        sessionId: newSessionId
      };
      
      const updatedUser = await api.joinSession(newSessionId, userData);
      const session = await api.getSession(newSessionId);
      
      setUserId(updatedUser.userId || null);
      setSessionId(session.id);
      
      // Atualiza o role com base no ownerId da sessão
      const isOwner = updatedUser.userId === session.ownerId;
      const role = isOwner ? 'OWNER' : 'GUEST';
      setRole(role);
      
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        username,
        userId: updatedUser.userId,
        sessionId: session.id,
        role,
        isOwner
      }));
      localStorage.setItem(SESSION_ACTIVE_KEY, 'true');
    } catch (error) {
      console.error('Erro ao entrar na sessão:', error);
      throw error;
    }
  }, [username, userId]);
  
  // Função para sair de uma sessão
  const leaveSession = useCallback(async (): Promise<void> => {
    if (!sessionId || !userId) {
      return;
    }
    
    try {
      await api.leaveSession(sessionId, userId);
      clearSession();
    } catch (error) {
      console.error('Erro ao sair da sessão:', error);
      throw error;
    }
  }, [sessionId, userId]);
  
  // Função para limpar a sessão
  const clearSession = useCallback(() => {
    setUsername(null);
    setUserId(null);
    setSessionId(null);
    setRole(null);
    setIsConnected(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_ACTIVE_KEY);
    localStorage.removeItem(REDIRECT_IN_PROGRESS_KEY);
    subscribedRef.current = false;
  }, []);
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    if (username || userId || sessionId || role !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        username,
        userId,
        sessionId,
        role,
      }));
    }
  }, [username, userId, sessionId, role]);
  
  const value = {
    username,
    userId,
    sessionId,
    role,
    isConnected,
    setUsername,
    setUserId,
    setSessionId,
    setRole,
    clearSession,
    sendMessage,
    registerWebSocketHandler,
    joinSession,
    leaveSession,
    createSession
  };
  
  return (
    <UserContext.Provider value={value}>
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