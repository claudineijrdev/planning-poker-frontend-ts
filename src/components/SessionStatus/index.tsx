import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useUser } from '../../contexts/UserContext';
import './styles.css';

export const SessionStatus: React.FC = () => {
  const { sessionId, username, role} = useUser();
  const { isConnected, lastMessage, messageCount, error } = useWebSocket({ 
    sessionId, 
    username 
  });

  return (
    <div className="session-status">
      <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? 'Conectado' : 'Desconectado'}
      </div>
      <div className="session-info">
        <p>Sessão: {sessionId || 'Nenhuma'}</p>
        <p>Usuário: {username || 'Nenhum'}</p>
        <p>Função: {role === 'OWNER' ? 'Proprietário' : 'Participante'}</p>
        <p>Última atualização: {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString() : 'Nenhuma'}</p>
        <p>Total de atualizações: {messageCount}</p>
        {error && (
          <div className="error-message">
            Erro de conexão: {error.message}
          </div>
        )}
      </div>
    </div>
  );
}; 