import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setUsername } = useUser();
  const [tempUsername, setTempUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername.trim()) {
      toast.error('Por favor, insira seu nome');
      return;
    }
    setUsername(tempUsername.trim());
    navigate('/session-choice');
  };

  return (
    <div className="home-container">
      <div className="welcome-card">
        <h1>Planning Poker</h1>
        <p>Bem-vindo ao Planning Poker! Por favor, insira seu nome para começar.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Seu nome"
            className="name-input"
            required
          />
          <button type="submit" className="start-button">
            Começar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home; 