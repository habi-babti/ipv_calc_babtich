import { useState } from 'react';
import './Calculator.css';

function NetworkOverlapDetector() {
  const [networks, setNetworks] = useState(['192.168.1.0/24', '192.168.2.0/24', '10.0.0.0/16']);
  const [results, setResults] = useState(null);
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

  const parseNetwork = (cidr) => {
    const [ip, prefix] = cidr.split('/');
    const prefixLength = parseInt(prefix, 10);
    const mask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
    const networkAddress = (ipToNumber(ip) & mask) >>> 0;
    const broadcastAddress = (networkAddress + Math.pow(2, 32 - prefixLength) - 1) >>> 0;
    
    return {
      original: cidr,
      networkAddress,
      broadcastAddress,
      networkIP: numberToIp(networkAddress),
      broadcastIP: numberToIp(broadcastAddress),
      prefixLength,
      size: Math.pow(2, 32 - prefixLength),
      cidr: `${numberToIp(networkAddress)}/${prefixLength}`
    };
  };

  const checkOverlap = (net1, net2) => {
    // Check if networks overlap
    const overlap = !(net1.broadcastAddress < net2.networkAddress || net2.broadcastAddress < net1.networkAddress);
    
    if (!overlap) return null;
    
    // Calculate overlap details
    const overlapStart = Math.max(net1.networkAddress, net2.networkAddress);
    const overlapEnd = Math.min(net1.broadcastAddress, net2.broadcastAddress);
    const overlapSize = overlapEnd - overlapStart + 1;
    
    // Determine relationship type
    let relationship;
    if (net1.networkAddress === net2.networkAddress && net1.broadcastAddress === net2.broadcastAddress) {
      relationship = 'identical';
    } else if (net1.networkAddress <= net2.networkAddress && net1.broadcastAddress >= net2.broadcastAddress) {
      relationship = 'contains';
    } else if (net2.networkAddress <= net1.networkAddress && net2.broadcastAddress >= net1.broadcastAddress) {
      relationship = 'contained';
    } else {
      relationship = 'partial';
    }
    
    return {
      network1: net1,
      network2: net2,
      relationship,
      overlapStart: numberToIp(overlapStart),
      overlapEnd: numberToIp(overlapEnd),
      overlapSize,
      overlapPercentage1: ((overlapSize / net1.size) * 100).toFixed(2),
      overlapPercentage2: ((overlapSize / net2.size) * 100).toFixed(2)
    };
  };

  const analyzeNetworks = () => {
    if (networks.length < 2) {
      setError('Veuillez entrer au moins 2 réseaux');
      return;
    }

    // Validate all networks
    const validNetworks = [];
    for (let network of networks) {
      if (!network.trim()) continue;
      if (!validateCIDR(network.trim())) {
        setError(`Format CIDR invalide: ${network}`);
        return;
      }
      validNetworks.push(parseNetwork(network.trim()));
    }

    if (validNetworks.length < 2) {
      setError('Veuillez entrer au moins 2 réseaux valides');
      return;
    }

    setError('');

    // Check all pairs for overlaps
    const overlaps = [];
    const noOverlaps = [];
    
    for (let i = 0; i < validNetworks.length; i++) {
      for (let j = i + 1; j < validNetworks.length; j++) {
        const overlap = checkOverlap(validNetworks[i], validNetworks[j]);
        if (overlap) {
          overlaps.push(overlap);
        } else {
          noOverlaps.push({
            network1: validNetworks[i],
            network2: validNetworks[j]
          });
        }
      }
    }

    // Sort networks by address for display
    const sortedNetworks = [...validNetworks].sort((a, b) => a.networkAddress - b.networkAddress);

    // Calculate total address space used
    const totalAddresses = validNetworks.reduce((sum, net) => sum + net.size, 0);
    
    // Find gaps between consecutive networks
    const gaps = [];
    for (let i = 0; i < sortedNetworks.length - 1; i++) {
      const currentEnd = sortedNetworks[i].broadcastAddress;
      const nextStart = sortedNetworks[i + 1].networkAddress;
      if (currentEnd + 1 < nextStart) {
        gaps.push({
          start: numberToIp(currentEnd + 1),
          end: numberToIp(nextStart - 1),
          size: nextStart - currentEnd - 1
        });
      }
    }

    setResults({
      networks: sortedNetworks,
      overlaps,
      noOverlaps,
      gaps,
      totalNetworks: validNetworks.length,
      totalAddresses,
      hasOverlaps: overlaps.length > 0
    });
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

  const getRelationshipIcon = (relationship) => {
    switch (relationship) {
      case 'identical': return 'identical-icon';
      case 'contains': return 'contains-icon';
      case 'contained': return 'contained-icon';
      case 'partial': return 'partial-icon';
      default: return 'unknown-icon';
    }
  };

  const getRelationshipText = (relationship) => {
    switch (relationship) {
      case 'identical': return 'Réseaux identiques';
      case 'contains': return 'Le premier contient le second';
      case 'contained': return 'Le second contient le premier';
      case 'partial': return 'Chevauchement partiel';
      default: return 'Relation inconnue';
    }
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Détecteur de Chevauchement Réseau</h1>
        <p>Analysez les chevauchements entre plusieurs réseaux IP</p>
      </div>

      <div className="input-section">
        <div className="networks-input">
          <label>Réseaux à analyser</label>
          {networks.map((network, index) => (
            <div key={index} className="network-input-row">
              <input
                type="text"
                value={network}
                onChange={(e) => updateNetwork(index, e.target.value)}
                placeholder="Ex: 192.168.1.0/24"
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
          onClick={analyzeNetworks}
          className="calculate-button"
        >
          Analyser les Chevauchements
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {results && (
        <div className="results-section">
          <div className="analysis-summary">
            <h2>
              {results.hasOverlaps ? (
                <><span className="status-icon warning-icon"></span>Chevauchements détectés</>
              ) : (
                <><span className="status-icon success-icon"></span>Aucun chevauchement</>
              )}
            </h2>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-value">{results.totalNetworks}</span>
                <span className="stat-label">Réseaux analysés</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{results.overlaps.length}</span>
                <span className="stat-label">Chevauchements</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{results.gaps.length}</span>
                <span className="stat-label">Espaces libres</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{results.totalAddresses.toLocaleString()}</span>
                <span className="stat-label">Total d'adresses</span>
              </div>
            </div>
          </div>

          {results.overlaps.length > 0 && (
            <div className="overlaps-section">
              <h3><span className="card-header-icon alert-icon"></span>Chevauchements détectés</h3>
              {results.overlaps.map((overlap, index) => (
                <div key={index} className="overlap-card">
                  <div className="overlap-header">
                    <span className={`overlap-icon ${getRelationshipIcon(overlap.relationship)}`}></span>
                    <span className="overlap-title">{getRelationshipText(overlap.relationship)}</span>
                  </div>
                  
                  <div className="overlap-details">
                    <div className="overlap-networks">
                      <div className="network-info">
                        <span className="network-label">Réseau 1:</span>
                        <span className="network-value">{overlap.network1.cidr}</span>
                      </div>
                      <div className="network-info">
                        <span className="network-label">Réseau 2:</span>
                        <span className="network-value">{overlap.network2.cidr}</span>
                      </div>
                    </div>
                    
                    <div className="overlap-range">
                      <div className="result-item">
                        <span className="label">Plage de chevauchement:</span>
                        <span className="value">{overlap.overlapStart} - {overlap.overlapEnd}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">Adresses en conflit:</span>
                        <span className="value">{overlap.overlapSize.toLocaleString()}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">% du réseau 1:</span>
                        <span className="value">{overlap.overlapPercentage1}%</span>
                      </div>
                      <div className="result-item">
                        <span className="label">% du réseau 2:</span>
                        <span className="value">{overlap.overlapPercentage2}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="networks-table">
            <h3><span className="card-header-icon table-icon"></span>Réseaux analysés</h3>
            <div className="table-header">
              <span>CIDR</span>
              <span>Adresse réseau</span>
              <span>Broadcast</span>
              <span>Taille</span>
              <span>Statut</span>
            </div>
            {results.networks.map((network, index) => {
              const hasOverlap = results.overlaps.some(o => 
                o.network1.cidr === network.cidr || o.network2.cidr === network.cidr
              );
              return (
                <div key={index} className="table-row">
                  <span className="network-cidr">{network.cidr}</span>
                  <span className="network-address">{network.networkIP}</span>
                  <span className="network-broadcast">{network.broadcastIP}</span>
                  <span className="network-size">{network.size.toLocaleString()}</span>
                  <span className={`network-status ${hasOverlap ? 'overlap' : 'clean'}`}>
                    <span className={`status-icon ${hasOverlap ? 'warning-icon' : 'success-icon'}`}></span>
                    {hasOverlap ? 'Conflit' : 'OK'}
                  </span>
                </div>
              );
            })}
          </div>

          {results.gaps.length > 0 && (
            <div className="gaps-section">
              <h3><span className="card-header-icon chart-icon"></span>Espaces libres entre réseaux</h3>
              <div className="gaps-list">
                {results.gaps.map((gap, index) => (
                  <div key={index} className="gap-item">
                    <span className="gap-range">{gap.start} - {gap.end}</span>
                    <span className="gap-size">({gap.size.toLocaleString()} adresses disponibles)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results.hasOverlaps && (
            <div className="success-message">
              <h3><span className="status-icon success-icon"></span>Excellente nouvelle !</h3>
              <p>Aucun chevauchement détecté entre vos réseaux. Votre plan d'adressage est correct.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NetworkOverlapDetector;