import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import './SessionChoice.css';

const SessionChoice: React.FC = () => {
  const { username, setSessionId, setUserId, setRole } = useUser();
  const [sessionCode, setSessionCode] = useState('');
  const navigate = useNavigate();

  // Redireciona para home se não tiver username
  React.useEffect(() => {
    if (!username) {
      navigate('/');
    }
  }, [username, navigate]);

  const handleCreateSession = async () => {
    try {
      const response = await fetch('http://localhost:3001/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ownerName: username }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão');
      }

      const data = await response.json();
      setSessionId(data.session.code);
      setUserId(data.session.users[0].id); // O primeiro usuário é o owner
      setRole('OWNER');
      navigate(`/session/${data.session.code}`);
      toast.success('Sessão criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar sessão. Tente novamente.');
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      toast.error('Por favor, insira o código da sessão');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/sessions/${sessionCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: username
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Sessão não encontrada');
          return;
        }
        throw new Error('Erro ao entrar na sessão');
      }

      const data = await response.json();
      setSessionId(sessionCode);
      setUserId(data.id);
      setRole('GUEST');
      navigate(`/session/${sessionCode}`);
      toast.success('Você entrou na sessão!');
    } catch (error) {
      toast.error('Erro ao entrar na sessão. Tente novamente.');
    }
  };

  return (
    <div className="session-choice-container">
      <h1>Planning Poker</h1>
      <div className="choice-card">
        <h2>Olá, {username}!</h2>
        <div className="choice-options">
          <div className="choice-section">
            <h3>Criar nova sessão</h3>
            <p>Inicie uma nova sala de Planning Poker</p>
            <button onClick={handleCreateSession} className="primary-button">
              Criar Sessão
            </button>
          </div>

          <div className="divider">ou</div>

          <div className="choice-section">
            <h3>Entrar em uma sessão</h3>
            <form onSubmit={handleJoinSession}>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Código da sessão"
                className="session-input"
              />
              <button type="submit" className="secondary-button">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionChoice; 