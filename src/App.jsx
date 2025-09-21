import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Users, UserCheck, Baby, Calendar } from 'lucide-react';

function App() {
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [responsesRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://18.118.160.254:3001'}/api/responses`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://18.118.160.254:3001'}/api/stats`)
      ]);
      
      setResponses(responsesRes.data.responses);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar os dados. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = responses.filter(response => 
    response['Seu nome e Sobrenome']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response['Nome de quem virá com você']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getConfirmationBadge = (confirmation) => {
    if (!confirmation) return null;
    
    const isConfirmed = confirmation.toLowerCase().includes('sim');
    return (
      <span className={`confirmation-badge ${isConfirmed ? 'confirmation-yes' : 'confirmation-no'}`}>
        {isConfirmed ? 'Confirmado' : 'Não confirmado'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <Calendar className="animate-spin" size={48} />
          <p>Carregando confirmações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🎉 Aniversário da Stella</h1>
        <p>Confirmações de presença</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalResponses || 0}</div>
          <div className="stat-label">
            <Users size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Total de Respostas
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.confirmedPresence || 0}</div>
          <div className="stat-label">
            <UserCheck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Confirmaram Presença
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.withChildren || 0}</div>
          <div className="stat-label">
            <Baby size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Vêm com Crianças
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalPeople || 0}</div>
          <div className="stat-label">
            <Users size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Total de Pessoas
          </div>
        </div>
      </div>

      <div className="responses-container">
        <div className="responses-header">
          <h2 className="responses-title">Lista de Confirmações</h2>
          <div className="search-box">
            <Search size={20} style={{ marginRight: '10px', color: '#666' }} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredResponses.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma confirmação encontrada</h3>
            <p>{searchTerm ? 'Tente outro termo de busca.' : 'Ainda não há confirmações registradas.'}</p>
          </div>
        ) : (
          <div className="responses-grid">
            {filteredResponses.map((response, index) => (
              <div key={index} className="response-card">
                <div className="response-header">
                  <div className="response-name">
                    {response['Seu nome e Sobrenome'] || 'Nome não informado'}
                  </div>
                  <div className="response-date">
                    {formatDate(response['Carimbo de data/hora'])}
                  </div>
                </div>
                
                <div className="response-details">
                  <div className="detail-item">
                    <div className="detail-label">Confirmação</div>
                    <div className="detail-value">
                      {getConfirmationBadge(response['Você confirma sua presença?'])}
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Acompanhante</div>
                    <div className="detail-value">
                      {response['Nome de quem virá com você'] || 'Sozinho(a)'}
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Crianças</div>
                    <div className="detail-value">
                      {response['Se tiver criança, qual idade e nome?'] || 'Nenhuma'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


