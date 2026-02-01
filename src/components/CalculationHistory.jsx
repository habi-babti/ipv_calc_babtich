import { useState, useEffect } from 'react';
import { getSavedCalculations, deleteCalculation, toggleFavorite, exportCalculations } from '../utils/storage';
import { exportToCSV, exportToPDF } from '../utils/export';
import './CalculationHistory.css';

function CalculationHistory({ isOpen, onClose, onLoadCalculation }) {
  const [calculations, setCalculations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, favorites, recent
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCalculations();
    }
  }, [isOpen]);

  const loadCalculations = () => {
    const saved = getSavedCalculations();
    setCalculations(saved);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce calcul ?')) {
      deleteCalculation(id);
      loadCalculations();
    }
  };

  const handleToggleFavorite = (id) => {
    toggleFavorite(id);
    loadCalculations();
  };

  const handleExportAll = () => {
    exportCalculations();
  };

  const handleExportCalculation = (calculation, format) => {
    if (format === 'csv') {
      exportToCSV(calculation, `${calculation.type}-${calculation.id}`);
    } else if (format === 'pdf') {
      exportToPDF(calculation, `${calculation.type}-${calculation.id}`);
    }
  };

  const filteredCalculations = calculations.filter(calc => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'favorites' && calc.favorite) ||
                         (filter === 'recent' && new Date(calc.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesSearch = searchTerm === '' || 
                         calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getCalculationPreview = (calc) => {
    const { input, result } = calc;
    switch (calc.type) {
      case 'subnet':
      case 'cidr':
        return `${input.ip || input.cidr} → ${result.networkAddress}/${result.prefixLength}`;
      case 'binary':
        return `${input.ip} → ${result.fullBinary}`;
      case 'supernet':
        return `${calc.input.networks?.length || 0} réseaux → ${result.supernet?.cidr}`;
      case 'overlap':
        return `${result.totalNetworks} réseaux, ${result.overlaps?.length || 0} conflits`;
      case 'bandwidth':
        return `${result.totalUsers || 'N/A'} utilisateurs → ${result.recommended?.toFixed(2)} Mbps`;
      default:
        return 'Calcul réseau';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      subnet: 'Sous-réseau',
      cidr: 'CIDR',
      binary: 'Binaire',
      supernet: 'Supernet',
      overlap: 'Chevauchement',
      bandwidth: 'Bande passante',
      iprange: 'Plage IP',
      geolocation: 'Géolocalisation',
      dns: 'DNS'
    };
    return labels[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h2>
            <span className="card-header-icon history-icon"></span>
            Historique des Calculs
          </h2>
          <button onClick={onClose} className="close-button">
            <span className="close-icon"></span>
          </button>
        </div>

        <div className="history-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher dans l'historique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon"></span>
          </div>

          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tous ({calculations.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              Favoris ({calculations.filter(c => c.favorite).length})
            </button>
            <button 
              className={`filter-tab ${filter === 'recent' ? 'active' : ''}`}
              onClick={() => setFilter('recent')}
            >
              Récents
            </button>
          </div>

          <button onClick={handleExportAll} className="export-all-button">
            <span className="button-icon export-icon"></span>
            Exporter Tout
          </button>
        </div>

        <div className="history-list">
          {filteredCalculations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"></span>
              <p>Aucun calcul trouvé</p>
              <small>Effectuez des calculs pour les voir apparaître ici</small>
            </div>
          ) : (
            filteredCalculations.map(calc => (
              <div key={calc.id} className="history-item">
                <div className="item-header">
                  <div className="item-info">
                    <span className={`type-badge ${calc.type}`}>
                      {getTypeLabel(calc.type)}
                    </span>
                    <h3>{calc.name}</h3>
                    <p className="calculation-preview">
                      {getCalculationPreview(calc)}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => handleToggleFavorite(calc.id)}
                      className={`favorite-button ${calc.favorite ? 'active' : ''}`}
                      title={calc.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <span className={`favorite-icon ${calc.favorite ? 'filled' : 'outline'}`}></span>
                    </button>
                    <div className="export-dropdown">
                      <button className="export-button">
                        <span className="export-icon"></span>
                      </button>
                      <div className="export-menu">
                        <button onClick={() => handleExportCalculation(calc, 'csv')}>
                          <span className="csv-icon"></span>
                          CSV
                        </button>
                        <button onClick={() => handleExportCalculation(calc, 'pdf')}>
                          <span className="pdf-icon"></span>
                          PDF
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onLoadCalculation(calc)}
                      className="load-button"
                      title="Charger ce calcul"
                    >
                      <span className="load-icon"></span>
                    </button>
                    <button
                      onClick={() => handleDelete(calc.id)}
                      className="delete-button"
                      title="Supprimer"
                    >
                      <span className="delete-icon"></span>
                    </button>
                  </div>
                </div>
                <div className="item-meta">
                  <span className="timestamp">
                    {new Date(calc.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CalculationHistory;