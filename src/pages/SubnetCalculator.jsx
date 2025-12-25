import { useState } from 'react';
import { calculateTable1 } from '../utils/ipv4Calculator';
import StepDisplay from '../components/StepDisplay';
import ResultsTable from '../components/ResultsTable';
import './Calculator.css';

function SubnetCalculator() {
  const [hostIP, setHostIP] = useState('192.168.10.130');
  const [initialMask, setInitialMask] = useState('255.255.255.0');
  const [newMask, setNewMask] = useState('255.255.255.192');
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

  const validateMask = (mask) => {
    if (!validateIP(mask)) return false;
    const octets = mask.split('.').map(Number);
    let foundZero = false;
    for (const octet of octets) {
      const binary = octet.toString(2).padStart(8, '0');
      for (const bit of binary) {
        if (bit === '0') foundZero = true;
        else if (foundZero) return false;
      }
    }
    return true;
  };

  const handleCalculate = () => {
    setError('');
    
    if (!validateIP(hostIP)) {
      setError('Format d\'adresse IP hôte invalide');
      return;
    }
    if (!validateMask(initialMask)) {
      setError('Format du masque de sous-réseau initial invalide');
      return;
    }
    if (!validateMask(newMask)) {
      setError('Format du nouveau masque de sous-réseau invalide');
      return;
    }

    try {
      const calculation = calculateTable1(hostIP, initialMask, newMask);
      setResult(calculation);
    } catch (e) {
      setError('Erreur de calcul : ' + e.message);
    }
  };

  return (
    <div className="calculator-page">
      <div className="calculator-header">
        <h1>Calculateur de Sous-réseau</h1>
        <p>Calculer les détails du sous-réseau avec des explications étape par étape</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label>Adresse IP de l'hôte</label>
          <input
            type="text"
            value={hostIP}
            onChange={(e) => setHostIP(e.target.value)}
            placeholder="ex: 192.168.10.130"
          />
        </div>
        <div className="input-group">
          <label>Masque de sous-réseau initial</label>
          <input
            type="text"
            value={initialMask}
            onChange={(e) => setInitialMask(e.target.value)}
            placeholder="ex: 255.255.255.0"
          />
        </div>
        <div className="input-group">
          <label>Nouveau masque de sous-réseau</label>
          <input
            type="text"
            value={newMask}
            onChange={(e) => setNewMask(e.target.value)}
            placeholder="ex: 255.255.255.192"
          />
        </div>
        <button onClick={handleCalculate} className="calculate-btn">
          Calculer étape par étape
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <>
          <ResultsTable results={result.results} type="table1" />
          <StepDisplay steps={result.steps} />
        </>
      )}

      <footer className="footer">
        <p>Créé par Babtich El Habib © 2025</p>
      </footer>
    </div>
  );
}

export default SubnetCalculator;
