import { useState } from 'react';
import './Calculator.css';

function IPRangeCalculator() {
  const [inputType, setInputType] = useState('cidr');
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [startIP, setStartIP] = useState('192.168.1.0');
  const [endIP, setEndIP] = useState('192.168.1.255');
  const [wildcardMask, setWildcardMask] = useState('0.0.0.255');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateIPv4 = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  const validateCIDR = (cidr) => {
    const parts = cidr.split('/');
    if (parts.length !== 2) return false;
    const [ip, prefix] = parts;
    const prefixNum = parseInt(prefix, 10);
    return validateIPv4(ip) && !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 32;
  };

  const ipToNumber = (ip) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  const numberToIp = (num) => {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');
  };

  const calculateFromCIDR = (cidr) => {
    const [ip, prefix] = cidr.split('/');
    const prefixLength = parseInt(prefix, 10);
    const mask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
    const wildcardMask = (~mask) >>> 0;
    const networkAddress = (ipToNumber(ip) & mask) >>> 0;
    const broadcastAddress = (networkAddress | wildcardMask) >>> 0;
    
    return {
      networkAddress: numberToIp(networkAddress),
      broadcastAddress: numberToIp(broadcastAddress),
      subnetMask: numberToIp(mask),
      wildcardMask: numberToIp(wildcardMask),
      firstHost: numberToIp(networkAddress + 1),
      lastHost: numberToIp(broadcastAddress - 1),
      totalHosts: Math.pow(2, 32 - prefixLength),
      usableHosts: Math.pow(2, 32 - prefixLength) - 2,
      prefixLength: prefixLength,
      cidr: `${numberToIp(networkAddress)}/${prefixLength}`
    };
  };

  const calculateFromRange = (start, end) => {
    const startNum = ipToNumber(start);
    const endNum = ipToNumber(end);
    
    if (startNum > endNum) {
      throw new Error('L\'adresse de début doit être inférieure à l\'adresse de fin');
    }
    
    const totalAddresses = endNum - startNum + 1;
    
    // Find the smallest CIDR that can contain this range
    let prefixLength = 32;
    for (let i = 0; i <= 32; i++) {
      const mask = (0xFFFFFFFF << (32 - i)) >>> 0;
      const networkStart = (startNum & mask) >>> 0;
      const networkEnd = networkStart + Math.pow(2, 32 - i) - 1;
      
      if (networkStart <= startNum && networkEnd >= endNum) {
        prefixLength = i;
        break;
      }
    }
    
    const mask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
    const wildcardMask = (~mask) >>> 0;
    const networkAddress = (startNum & mask) >>> 0;
    const broadcastAddress = (networkAddress | wildcardMask) >>> 0;
    
    return {
      networkAddress: numberToIp(networkAddress),
      broadcastAddress: numberToIp(broadcastAddress),
      subnetMask: numberToIp(mask),
      wildcardMask: numberToIp(wildcardMask),
      firstHost: numberToIp(networkAddress + 1),
      lastHost: numberToIp(broadcastAddress - 1),
      totalHosts: Math.pow(2, 32 - prefixLength),
      usableHosts: Math.pow(2, 32 - prefixLength) - 2,
      prefixLength: prefixLength,
      cidr: `${numberToIp(networkAddress)}/${prefixLength}`,
      originalRange: {
        start: start,
        end: end,
        count: totalAddresses
      }
    };
  };

  const calculateFromWildcard = (baseIP, wildcard) => {
    const baseNum = ipToNumber(baseIP);
    const wildcardNum = ipToNumber(wildcard);
    const mask = (~wildcardNum) >>> 0;
    
    // Count the number of consecutive 1s from the left in the mask
    let prefixLength = 0;
    let tempMask = mask;
    while (tempMask & 0x80000000) {
      prefixLength++;
      tempMask = (tempMask << 1) >>> 0;
    }
    
    const networkAddress = (baseNum & mask) >>> 0;
    const broadcastAddress = (networkAddress | wildcardNum) >>> 0;
    
    return {
      networkAddress: numberToIp(networkAddress),
      broadcastAddress: numberToIp(broadcastAddress),
      subnetMask: numberToIp(mask),
      wildcardMask: wildcard,
      firstHost: numberToIp(networkAddress + 1),
      lastHost: numberToIp(broadcastAddress - 1),
      totalHosts: wildcardNum + 1,
      usableHosts: wildcardNum - 1,
      prefixLength: prefixLength,
      cidr: `${numberToIp(networkAddress)}/${prefixLength}`
    };
  };

  const calculate = () => {
    setError('');
    
    try {
      let result;
      
      switch (inputType) {
        case 'cidr':
          if (!validateCIDR(cidr)) {
            setError('Format CIDR invalide');
            return;
          }
          result = calculateFromCIDR(cidr);
          break;
          
        case 'range':
          if (!validateIPv4(startIP) || !validateIPv4(endIP)) {
            setError('Format d\'adresse IP invalide');
            return;
          }
          result = calculateFromRange(startIP, endIP);
          break;
          
        case 'wildcard':
          if (!validateIPv4(startIP) || !validateIPv4(wildcardMask)) {
            setError('Format d\'adresse IP ou de masque wildcard invalide');
            return;
          }
          result = calculateFromWildcard(startIP, wildcardMask);
          break;
          
        default:
          setError('Type d\'entrée invalide');
          return;
      }
      
      setResult(result);
    } catch (err) {
      setError(err.message || 'Erreur lors du calcul');
    }
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Calculateur de Plages IP</h1>
        <p>Convertissez entre CIDR, plages d'adresses et masques wildcard</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label>Type d'entrée</label>
          <select value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="cidr">Notation CIDR</option>
            <option value="range">Plage d'adresses</option>
            <option value="wildcard">Masque Wildcard</option>
          </select>
        </div>

        {inputType === 'cidr' && (
          <div className="input-group">
            <label>Notation CIDR</label>
            <input
              type="text"
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
              placeholder="Ex: 192.168.1.0/24"
            />
          </div>
        )}

        {inputType === 'range' && (
          <>
            <div className="input-group">
              <label>Adresse de début</label>
              <input
                type="text"
                value={startIP}
                onChange={(e) => setStartIP(e.target.value)}
                placeholder="Ex: 192.168.1.0"
              />
            </div>
            <div className="input-group">
              <label>Adresse de fin</label>
              <input
                type="text"
                value={endIP}
                onChange={(e) => setEndIP(e.target.value)}
                placeholder="Ex: 192.168.1.255"
              />
            </div>
          </>
        )}

        {inputType === 'wildcard' && (
          <>
            <div className="input-group">
              <label>Adresse de base</label>
              <input
                type="text"
                value={startIP}
                onChange={(e) => setStartIP(e.target.value)}
                placeholder="Ex: 192.168.1.0"
              />
            </div>
            <div className="input-group">
              <label>Masque Wildcard</label>
              <input
                type="text"
                value={wildcardMask}
                onChange={(e) => setWildcardMask(e.target.value)}
                placeholder="Ex: 0.0.0.255"
              />
            </div>
          </>
        )}

        <button onClick={calculate} className="calculate-button">
          Calculer
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {result && (
        <div className="results-section">
          <h2>Résultats de la conversion</h2>
          
          <div className="result-grid">
            <div className="result-card">
              <h3><span className="card-header-icon network-icon"></span>Informations du réseau</h3>
              <div className="result-item">
                <span className="label">Notation CIDR:</span>
                <span className="value highlight">{result.cidr}</span>
              </div>
              <div className="result-item">
                <span className="label">Adresse réseau:</span>
                <span className="value">{result.networkAddress}</span>
              </div>
              <div className="result-item">
                <span className="label">Adresse de broadcast:</span>
                <span className="value">{result.broadcastAddress}</span>
              </div>
              <div className="result-item">
                <span className="label">Masque de sous-réseau:</span>
                <span className="value">{result.subnetMask}</span>
              </div>
              <div className="result-item">
                <span className="label">Masque wildcard:</span>
                <span className="value">{result.wildcardMask}</span>
              </div>
              <div className="result-item">
                <span className="label">Longueur du préfixe:</span>
                <span className="value">/{result.prefixLength}</span>
              </div>
            </div>

            <div className="result-card">
              <h3><span className="card-header-icon host-icon"></span>Plage d'hôtes</h3>
              <div className="result-item">
                <span className="label">Première adresse hôte:</span>
                <span className="value">{result.firstHost}</span>
              </div>
              <div className="result-item">
                <span className="label">Dernière adresse hôte:</span>
                <span className="value">{result.lastHost}</span>
              </div>
              <div className="result-item">
                <span className="label">Total d'adresses:</span>
                <span className="value">{result.totalHosts.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="label">Hôtes utilisables:</span>
                <span className="value">{result.usableHosts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {result.originalRange && (
            <div className="original-range">
              <h3><span className="card-header-icon chart-icon"></span>Plage originale</h3>
              <div className="range-info">
                <div className="result-item">
                  <span className="label">Plage demandée:</span>
                  <span className="value">{result.originalRange.start} - {result.originalRange.end}</span>
                </div>
                <div className="result-item">
                  <span className="label">Nombre d'adresses:</span>
                  <span className="value">{result.originalRange.count.toLocaleString()}</span>
                </div>
                <p className="range-note">
                  Le CIDR calculé ({result.cidr}) est le plus petit réseau qui peut contenir cette plage.
                </p>
              </div>
            </div>
          )}

          <div className="conversion-formats">
            <h3><span className="card-header-icon convert-icon"></span>Formats de conversion</h3>
            <div className="format-list">
              <div className="format-item">
                <span className="format-label">CIDR:</span>
                <code>{result.cidr}</code>
              </div>
              <div className="format-item">
                <span className="format-label">Plage:</span>
                <code>{result.firstHost} - {result.lastHost}</code>
              </div>
              <div className="format-item">
                <span className="format-label">Réseau/Masque:</span>
                <code>{result.networkAddress} {result.subnetMask}</code>
              </div>
              <div className="format-item">
                <span className="format-label">Wildcard:</span>
                <code>{result.networkAddress} {result.wildcardMask}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IPRangeCalculator;