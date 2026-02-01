import { useState } from 'react';
import './Calculator.css';

function DNSLookup() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const recordTypes = [
    { value: 'A', label: 'A - Adresse IPv4' },
    { value: 'AAAA', label: 'AAAA - Adresse IPv6' },
    { value: 'MX', label: 'MX - Serveur de messagerie' },
    { value: 'NS', label: 'NS - Serveur de noms' },
    { value: 'CNAME', label: 'CNAME - Nom canonique' },
    { value: 'TXT', label: 'TXT - Enregistrement texte' },
    { value: 'SOA', label: 'SOA - Autorité de zone' },
    { value: 'PTR', label: 'PTR - Pointeur (DNS inverse)' }
  ];

  const validateDomain = (domain) => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain);
  };

  const lookupDNS = async () => {
    if (!domain.trim()) {
      setError('Veuillez entrer un nom de domaine');
      return;
    }

    if (!validateDomain(domain.trim())) {
      setError('Format de domaine invalide');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Using DNS over HTTPS with Cloudflare
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain.trim()}&type=${recordType}`,
        {
          headers: {
            'Accept': 'application/dns-json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.Status === 0 && data.Answer) {
        setResults(data);
      } else {
        setError(`Aucun enregistrement ${recordType} trouvé pour ${domain}`);
        setResults(null);
      }
    } catch (err) {
      setError('Erreur lors de la recherche DNS. Vérifiez votre connexion.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const formatRecordData = (record) => {
    switch (record.type) {
      case 1: // A
        return record.data;
      case 28: // AAAA
        return record.data;
      case 15: // MX
        return `${record.data} (Priorité: ${record.priority || 'N/A'})`;
      case 2: // NS
        return record.data;
      case 5: // CNAME
        return record.data;
      case 16: // TXT
        return record.data;
      case 6: // SOA
        return record.data;
      case 12: // PTR
        return record.data;
      default:
        return record.data;
    }
  };

  const getRecordTypeName = (type) => {
    const typeMap = {
      1: 'A',
      28: 'AAAA',
      15: 'MX',
      2: 'NS',
      5: 'CNAME',
      16: 'TXT',
      6: 'SOA',
      12: 'PTR'
    };
    return typeMap[type] || `Type ${type}`;
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Recherche DNS</h1>
        <p>Recherchez les enregistrements DNS pour n'importe quel domaine</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label>Nom de domaine</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Ex: google.com, github.com"
            onKeyPress={(e) => e.key === 'Enter' && lookupDNS()}
          />
        </div>

        <div className="input-group">
          <label>Type d'enregistrement</label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
          >
            {recordTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={lookupDNS}
          className="calculate-button"
          disabled={loading}
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {results && (
        <div className="results-section">
          <h2>Résultats DNS pour {results.Question[0].name}</h2>
          
          <div className="dns-info">
            <div className="result-item">
              <span className="label">Statut:</span>
              <span className="value success">
                <span className="status-icon success-icon"></span>
                Résolu
              </span>
            </div>
            <div className="result-item">
              <span className="label">Serveur DNS:</span>
              <span className="value">Cloudflare (1.1.1.1)</span>
            </div>
            <div className="result-item">
              <span className="label">Nombre d'enregistrements:</span>
              <span className="value">{results.Answer.length}</span>
            </div>
          </div>

          <div className="dns-records">
            <h3>Enregistrements trouvés</h3>
            <div className="records-table">
              <div className="table-header">
                <span>Type</span>
                <span>Nom</span>
                <span>Valeur</span>
                <span>TTL</span>
              </div>
              {results.Answer.map((record, index) => (
                <div key={index} className="table-row">
                  <span className="record-type">{getRecordTypeName(record.type)}</span>
                  <span className="record-name">{record.name}</span>
                  <span className="record-data">{formatRecordData(record)}</span>
                  <span className="record-ttl">{record.TTL}s</span>
                </div>
              ))}
            </div>
          </div>

          {results.Authority && results.Authority.length > 0 && (
            <div className="dns-authority">
              <h3>Serveurs d'autorité</h3>
              <div className="authority-list">
                {results.Authority.map((auth, index) => (
                  <div key={index} className="authority-item">
                    <span className="auth-name">{auth.name}</span>
                    <span className="auth-data">{auth.data}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DNSLookup;