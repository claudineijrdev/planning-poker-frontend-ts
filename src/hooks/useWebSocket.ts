import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  username?: string;
  role?: string;
}

interface WebSocketError {
  message: string;
  code?: string;
}

interface WebSocketHookProps {
  sessionId?: string | null;
  username?: string | null;
}

export const useWebSocket = (props: WebSocketHookProps = {}) => {
  const { sessionId, username } = props;
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [error, setError] = useState<WebSocketError | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!sessionId || !username) {
      console.log('Não conectando ao WebSocket: sessão ou usuário não disponível');
      return;
    }

    try {
      const ws = new WebSocket(`ws://localhost:3001/ws/${sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          console.log('Mensagem recebida do WebSocket:', event.data);
          let message;
          try {
            message = JSON.parse(event.data);
          } catch (e) {
            console.error('Erro ao fazer parse da mensagem:', e);
            message = event.data;
          }
          setLastMessage(message);
          setMessageCount(prev => prev + 1);
        } catch (err) {
          console.error('Erro ao processar mensagem:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        setIsConnected(false);
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Tentando reconectar em ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else {
          setError({
            message: 'Não foi possível reconectar ao servidor após várias tentativas',
            code: 'RECONNECT_FAILED'
          });
        }
      };

      ws.onerror = (event) => {
        console.error('Erro no WebSocket:', event);
        setError({
          message: 'Erro na conexão com o servidor',
          code: 'CONNECTION_ERROR'
        });
      };
    } catch (err) {
      console.error('Erro ao criar WebSocket:', err);
      setError({
        message: 'Erro ao criar conexão WebSocket',
        code: 'CREATION_ERROR'
      });
    }
  }, [sessionId, username]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return {
    isConnected,
    lastMessage,
    messageCount,
    error,
    sendMessage
  };
}; 