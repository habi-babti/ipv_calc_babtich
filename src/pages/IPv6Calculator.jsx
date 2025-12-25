import { useState } from 'react';
import { calculateIPv6 } from '../utils/ipv6Calculator';
import StepDisplay from '../components/StepDisplay';
import './Calculator.css';

function IPv6Calculator() {
  const [ipAddress, setIpAddress] = useState('2001:db8:85a3::8a2e:370:7334');
  const [prefix, setPrefix] = useState('64');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateIPv6 = (ip) => {
    // Basic IPv6 validation
    const expanded = ip.replace('::', ':PLACEHOLDER:');
    const parts = expanded.split(':').filter(p => p !== 'PLACEHOLDER');
    if (parts.length > 8) return false;
    for (const part of parts) {
      if (part && !/^[0-9a-fA-F]{1,4}$/.test(part)) return false;
    }
    return true;
  };

  const validatePrefix = (p) => {
    const num = parseInt(p, 10);
    return !isNaN(num) && num >= 0 && num <= 128;
  };

  const handleCalculate = () => {
    setError('');
    
    if (!validateIPv6(ipAddress)) {
      setError('Format d\'adresse IPv6 invalide');
      return;
    }
    if (!validatePrefix(prefix)) {
      setError('Préfixe invalide (doit être entre 0 et 128)');
      return;
    }

    try {
      const calculation = calculateIPv6(ipAddress, parseInt(prefix, 10));
      setResult(calculation);
    } catch (e) {
      setError('Erreur de calcul : ' + e.message);
    }
  };

  const handleInput = (value) => {
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
        <h1>Calculateur IPv6</h1>
        <p>Calculer les détails du réseau IPv6 avec des explications étape par étape</p>
      </div>

      <div className="input-section">
        <div className="input-group cidr-input">
          <label>Adresse IPv6 / Préfixe</label>
          <div className="cidr-row">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="ex: 2001:db8:85a3::8a2e:370:7334"
            />
            <span className="cidr-slash">/</span>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="64"
              className="prefix-input"
            />
          </div>
          <small>Entrez l'adresse IPv6 et le préfixe (0-128)</small>
        </div>
        <button onClick={handleCalculate} className="calculate-btn">
          Calculer étape par étape
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <>
          <div className="results-table" style={{marginTop: '2rem', background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2563eb'}}>
            <h3 style={{color: '#2563eb', marginBottom: '1rem'}}>Résultats finaux</h3>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <tbody>
                <tr>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b'}}>Adresse complète</td>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#059669', fontFamily: 'monospace', textAlign: 'right'}}>{result.results.expandedAddress}</td>
                </tr>
                <tr>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b'}}>Bits d'hôte</td>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#059669', fontFamily: 'monospace', textAlign: 'right'}}>{result.results.hostBits}</td>
                </tr>
                <tr>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b'}}>Nombre d'adresses</td>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#059669', fontFamily: 'monospace', textAlign: 'right'}}>{result.results.totalAddresses}</td>
                </tr>
                <tr>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b'}}>Préfixe réseau</td>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#059669', fontFamily: 'monospace', textAlign: 'right'}}>{result.results.networkPrefix}</td>
                </tr>
                <tr>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b'}}>Dernière adresse</td>
                  <td style={{padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#059669', fontFamily: 'monospace', textAlign: 'right'}}>{result.results.lastAddress}</td>
                </tr>
                <tr>
                  <td style={{padding: '0.75rem 1rem', color: '#64748b'}}>Notation Préfixe</td>
                  <td style={{padding: '0.75rem 1rem', color: '#059669', fontFamily: 'monospace', textAlign: 'right', fontWeight: 'bold'}}>{result.results.cidrNotation}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <StepDisplay steps={result.steps} />
        </>
      )}

      <footer className="footer">
        <p>Créé par Babtich El Habib © 2025</p>
      </footer>
    </div>
  );
}

export default IPv6Calculator;
