import React from 'react';
import { useUser } from '../../contexts/UserContext';
import './styles.css';

const Header: React.FC = () => {
  const { username, sessionId, clearSession } = useUser();

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          <span className="username">{username}</span>
        </div>
        
        <div className="session-info">
          <span className="session-label">Código da Sessão:</span>
          <span className="session-code">{sessionId}</span>
        </div>

        <button onClick={clearSession} className="leave-button">
          Sair da Sessão
        </button>
      </div>
    </header>
  );
};

export default Header; 