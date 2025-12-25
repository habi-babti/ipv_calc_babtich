import { useState } from 'react';
import { calculateTable2 } from '../utils/ipv4Calculator';
import StepDisplay from '../components/StepDisplay';
import ResultsTable from '../components/ResultsTable';
import './Calculator.css';

function CIDRCalculator() {
  const [ipAddress, setIpAddress] = useState('172.16.45.200');
  const [prefix, setPrefix] = useState('28');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateIP = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  const validatePrefix = (p) => {
    const num = parseInt(p, 10);
    return !isNaN(num) && num >= 0 && num <= 32;
  };

  const handleCalculate = () => {
    setError('');
    
    if (!validateIP(ipAddress)) {
      setError('Format d\'adresse IP invalide');
      return;
    }
    if (!validatePrefix(prefix)) {
      setError('Préfixe invalide (doit être entre 0 et 32)');
      return;
    }

    try {
      const calculation = calculateTable2(ipAddress, parseInt(prefix, 10));
      setResult(calculation);
    } catch (e) {
      setError('Erreur de calcul : ' + e.message);
    }
  };

  const handleCIDRInput = (value) => {
    if (value.includes('/')) {
      const [ip, p] = value.split('/');
      setIpAddress(ip);
      if (p) setPrefix(p);
    } else {
      setIpAddress(value);
    }
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Calculateur Notation Préfixe</h1>
        <p>Calculer les détails du réseau à partir de la notation préfixe avec des explications étape par étape</p>
      </div>

      <div className="input-section">
        <div className="input-group cidr-input">
          <label>Adresse IP / Préfixe</label>
          <div className="cidr-row">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => handleCIDRInput(e.target.value)}
              placeholder="ex: 172.16.45.200"
            />
            <span className="cidr-slash">/</span>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="28"
              className="prefix-input"
            />
          </div>
          <small>Entrez l'IP et le préfixe séparément, ou collez la notation complète (ex: 192.168.1.1/24)</small>
        </div>
        <button onClick={handleCalculate} className="calculate-btn">
          Calculer étape par étape
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <>
          <ResultsTable results={result.results} type="table2" />
          <StepDisplay steps={result.steps} />
        </>
      )}

      <footer className="footer">
        <p>Créé par Babtich El Habib © 2025</p>
      </footer>
    </div>
  );
}

export default CIDRCalculator;
