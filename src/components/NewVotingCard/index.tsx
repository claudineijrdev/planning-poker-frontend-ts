import React, { useState, FormEvent, ChangeEvent } from 'react';
import { NewVotingCardProps } from '../../types';
import './styles.css';

const NewVotingCard: React.FC<NewVotingCardProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ title, description });
    setTitle('');
    setDescription('');
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <div className="new-voting-card">
      <div className="card-header">
        <h2>Criar novo Card</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            required
            placeholder="Digite o título da votação"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            required
            placeholder="Digite a descrição da votação"
            rows={4}
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="submit-button">
            Criar Novo Card
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVotingCard; 