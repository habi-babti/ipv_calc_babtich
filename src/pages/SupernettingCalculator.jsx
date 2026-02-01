import { useState } from 'react';
import './Calculator.css';

function SupernettingCalculator() {
  const [networks, setNetworks] = useState(['192.168.0.0/24', '192.168.1.0/24']);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateCIDR = (cidr) => {
    const parts = cidr.split('/');
    if (parts.length !== 2) return false;
    
    const [ip, prefix] = parts;
    const prefixNum = parseInt(prefix, 10);
    
    if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 32) return false;
    
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) return false;
    
    return ipParts.every(part => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
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

  const calculateSupernet = () => {
    if (networks.length < 2) {
      setError('Veuillez entrer au moins 2 réseaux');
      return;
    }

    // Validate all networks
    for (let network of networks) {
      if (!network.trim()) continue;
      if (!validateCIDR(network.trim())) {
        setError(`Format CIDR invalide: ${network}`);
        return;
      }
    }

    setError('');

    try {
      const validNetworks = networks.filter(n => n.trim()).map(network => {
        const [ip, prefix] = network.trim().split('/');
        const prefixLength = parseInt(prefix, 10);
        const networkAddress = ipToNumber(ip);
        const mask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
        const actualNetworkAddress = (networkAddress & mask) >>> 0;
        
        return {
          original: network.trim(),
          ip: numberToIp(actualNetworkAddress),
          prefix: prefixLength,
          networkAddress: actualNetworkAddress,
          mask: mask,
          size: Math.pow(2, 32 - prefixLength)
        };
      });

      // Sort networks by address
      validNetworks.sort((a, b) => a.networkAddress - b.networkAddress);

      // Find the supernet
      let minAddress = validNetworks[0].networkAddress;
      let maxAddress = validNetworks[validNetworks.length - 1].networkAddress + validNetworks[validNetworks.length - 1].size - 1;

      // Find the smallest prefix that can contain all networks
      let supernetPrefix = 32;
      for (let prefix = 0; prefix <= 32; prefix++) {
        const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        const supernetStart = (minAddress & mask) >>> 0;
        const supernetEnd = supernetStart + Math.pow(2, 32 - prefix) - 1;
        
        if (supernetStart <= minAddress && supernetEnd >= maxAddress) {
          supernetPrefix = prefix;
          break;
        }
      }

      const supernetMask = (0xFFFFFFFF << (32 - supernetPrefix)) >>> 0;
      const supernetAddress = (minAddress & supernetMask) >>> 0;
      const supernetSize = Math.pow(2, 32 - supernetPrefix);

      // Calculate efficiency
      const totalOriginalHosts = validNetworks.reduce((sum, net) => sum + net.size, 0);
      const efficiency = ((totalOriginalHosts / supernetSize) * 100).toFixed(2);

      // Check for gaps
      const gaps = [];
      for (let i = 0; i < validNetworks.length - 1; i++) {
        const currentEnd = validNetworks[i].networkAddress + validNetworks[i].size;
        const nextStart = validNetworks[i + 1].networkAddress;
        if (currentEnd < nextStart) {
          gaps.push({
            start: numberToIp(currentEnd),
            end: numberToIp(nextStart - 1),
            size: nextStart - currentEnd
          });
        }
      }

      setResult({
        originalNetworks: validNetworks,
        supernet: {
          address: numberToIp(supernetAddress),
          prefix: supernetPrefix,
          cidr: `${numberToIp(supernetAddress)}/${supernetPrefix}`,
          mask: numberToIp(supernetMask),
          size: supernetSize,
          firstHost: numberToIp(supernetAddress + 1),
          lastHost: numberToIp(supernetAddress + supernetSize - 2),
          broadcast: numberToIp(supernetAddress + supernetSize - 1)
        },
        efficiency: efficiency,
        gaps: gaps,
        totalOriginalHosts: totalOriginalHosts
      });

    } catch (err) {
      setError('Erreur lors du calcul du supernet');
    }
  };

  const addNetwork = () => {
    setNetworks([...networks, '']);
  };

  const removeNetwork = (index) => {
    if (networks.length > 2) {
      setNetworks(networks.filter((_, i) => i !== index));
    }
  };

  const updateNetwork = (index, value) => {
    const newNetworks = [...networks];
    newNetworks[index] = value;
    setNetworks(newNetworks);
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Calculateur de Supernetting</h1>
        <p>Calculez l'agrégation de routes et la summarisation de réseaux</p>
      </div>

      <div className="input-section">
        <div className="networks-input">
          <label>Réseaux à agréger</label>
          {networks.map((network, index) => (
            <div key={index} className="network-input-row">
              <input
                type="text"
                value={network}
                onChange={(e) => updateNetwork(index, e.target.value)}
                placeholder="Ex: 192.168.0.0/24"
              />
              {networks.length > 2 && (
                <button 
                  onClick={() => removeNetwork(index)}
                  className="remove-button"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button onClick={addNetwork} className="add-button">
            + Ajouter un réseau
          </button>
        </div>

        <button 
          onClick={calculateSupernet}
          className="calculate-button"
        >
          Calculer le Supernet
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {result && (
        <div className="results-section">
          <h2>Résultat du Supernetting</h2>
          
          <div className="result-grid">
            <div className="result-card">
              <h3><span className="card-header-icon network-icon"></span>Supernet Calculé</h3>
              <div className="result-item">
                <span className="label">Réseau supernet:</span>
                <span className="value highlight">{result.supernet.cidr}</span>
              </div>
              <div className="result-item">
                <span className="label">Adresse réseau:</span>
                <span className="value">{result.supernet.address}</span>
              </div>
              <div className="result-item">
                <span className="label">Masque de sous-réseau:</span>
                <span className="value">{result.supernet.mask}</span>
              </div>
              <div className="result-item">
                <span className="label">Première adresse hôte:</span>
                <span className="value">{result.supernet.firstHost}</span>
              </div>
              <div className="result-item">
                <span className="label">Dernière adresse hôte:</span>
                <span className="value">{result.supernet.lastHost}</span>
              </div>
              <div className="result-item">
                <span className="label">Adresse de broadcast:</span>
                <span className="value">{result.supernet.broadcast}</span>
              </div>
            </div>

            <div className="result-card">
              <h3><span className="card-header-icon stats-icon"></span>Statistiques</h3>
              <div className="result-item">
                <span className="label">Taille du supernet:</span>
                <span className="value">{result.supernet.size.toLocaleString()} adresses</span>
              </div>
              <div className="result-item">
                <span className="label">Total réseaux originaux:</span>
                <span className="value">{result.totalOriginalHosts.toLocaleString()} adresses</span>
              </div>
              <div className="result-item">
                <span className="label">Efficacité:</span>
                <span className={`value ${parseFloat(result.efficiency) > 50 ? 'success' : 'warning'}`}>
                  {result.efficiency}%
                </span>
              </div>
              <div className="result-item">
                <span className="label">Espaces inutilisés:</span>
                <span className="value">{result.gaps.length} gap(s)</span>
              </div>
            </div>
          </div>

          <div className="original-networks">
            <h3><span className="card-header-icon list-icon"></span>Réseaux originaux</h3>
            <div className="networks-table">
              <div className="table-header">
                <span>Réseau</span>
                <span>Adresse réseau</span>
                <span>Taille</span>
                <span>Plage</span>
              </div>
              {result.originalNetworks.map((network, index) => (
                <div key={index} className="table-row">
                  <span className="network-cidr">{network.original}</span>
                  <span className="network-address">{network.ip}</span>
                  <span className="network-size">{network.size.toLocaleString()}</span>
                  <span className="network-range">
                    {network.ip} - {numberToIp(network.networkAddress + network.size - 1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {result.gaps.length > 0 && (
            <div className="gaps-section">
              <h3><span className="card-header-icon warning-icon"></span>Espaces non utilisés</h3>
              <div className="gaps-list">
                {result.gaps.map((gap, index) => (
                  <div key={index} className="gap-item">
                    <span className="gap-range">{gap.start} - {gap.end}</span>
                    <span className="gap-size">({gap.size.toLocaleString()} adresses)</span>
                  </div>
                ))}
              </div>
              <p className="gap-note">
                Ces plages d'adresses sont incluses dans le supernet mais ne sont pas utilisées par les réseaux originaux.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SupernettingCalculator;