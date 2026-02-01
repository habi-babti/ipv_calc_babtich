import { useState } from 'react';
import './Calculator.css';

function BandwidthCalculator() {
  const [calculationType, setCalculationType] = useState('service');
  const [services, setServices] = useState([
    { name: 'Navigation Web', users: 50, bandwidthPerUser: 0.5, unit: 'Mbps' },
    { name: 'Email', users: 50, bandwidthPerUser: 0.1, unit: 'Mbps' },
    { name: 'Vidéoconférence HD', users: 10, bandwidthPerUser: 2, unit: 'Mbps' }
  ]);
  const [fileSize, setFileSize] = useState(100);
  const [fileSizeUnit, setFileSizeUnit] = useState('MB');
  const [transferTime, setTransferTime] = useState(60);
  const [timeUnit, setTimeUnit] = useState('seconds');
  const [results, setResults] = useState(null);

  const serviceTemplates = [
    { name: 'Navigation Web', bandwidth: 0.5, unit: 'Mbps' },
    { name: 'Email', bandwidth: 0.1, unit: 'Mbps' },
    { name: 'Streaming Vidéo SD', bandwidth: 1, unit: 'Mbps' },
    { name: 'Streaming Vidéo HD', bandwidth: 3, unit: 'Mbps' },
    { name: 'Streaming Vidéo 4K', bandwidth: 15, unit: 'Mbps' },
    { name: 'Vidéoconférence SD', bandwidth: 1, unit: 'Mbps' },
    { name: 'Vidéoconférence HD', bandwidth: 2, unit: 'Mbps' },
    { name: 'VoIP', bandwidth: 0.1, unit: 'Mbps' },
    { name: 'Téléchargement de fichiers', bandwidth: 5, unit: 'Mbps' },
    { name: 'Sauvegarde cloud', bandwidth: 10, unit: 'Mbps' },
    { name: 'Gaming en ligne', bandwidth: 1, unit: 'Mbps' },
    { name: 'Streaming musical', bandwidth: 0.3, unit: 'Mbps' }
  ];

  const convertToMbps = (value, unit) => {
    const conversions = {
      'bps': value / 1000000,
      'Kbps': value / 1000,
      'Mbps': value,
      'Gbps': value * 1000,
      'Tbps': value * 1000000
    };
    return conversions[unit] || value;
  };

  const convertFromMbps = (mbps, targetUnit) => {
    const conversions = {
      'bps': mbps * 1000000,
      'Kbps': mbps * 1000,
      'Mbps': mbps,
      'Gbps': mbps / 1000,
      'Tbps': mbps / 1000000
    };
    return conversions[targetUnit] || mbps;
  };

  const convertFileSize = (size, unit) => {
    const conversions = {
      'B': size / 1000000,
      'KB': size / 1000,
      'MB': size,
      'GB': size * 1000,
      'TB': size * 1000000
    };
    return conversions[unit] || size;
  };

  const convertTime = (time, unit) => {
    const conversions = {
      'seconds': time,
      'minutes': time * 60,
      'hours': time * 3600,
      'days': time * 86400
    };
    return conversions[unit] || time;
  };

  const calculateServiceBandwidth = () => {
    let totalBandwidth = 0;
    const serviceDetails = [];

    services.forEach(service => {
      const bandwidthMbps = convertToMbps(service.bandwidthPerUser, service.unit);
      const totalServiceBandwidth = bandwidthMbps * service.users;
      totalBandwidth += totalServiceBandwidth;
      
      serviceDetails.push({
        ...service,
        bandwidthMbps,
        totalBandwidth: totalServiceBandwidth
      });
    });

    // Add 20% overhead for network protocols
    const withOverhead = totalBandwidth * 1.2;
    
    // Recommended bandwidth (50% more for peak usage)
    const recommended = withOverhead * 1.5;

    return {
      type: 'service',
      services: serviceDetails,
      totalBandwidth,
      withOverhead,
      recommended,
      totalUsers: services.reduce((sum, s) => sum + s.users, 0)
    };
  };

  const calculateFileBandwidth = () => {
    const fileSizeMB = convertFileSize(fileSize, fileSizeUnit);
    const timeSeconds = convertTime(transferTime, timeUnit);
    
    // Convert MB to Mbits (1 MB = 8 Mbits)
    const fileSizeMbits = fileSizeMB * 8;
    
    // Required bandwidth in Mbps
    const requiredBandwidth = fileSizeMbits / timeSeconds;
    
    // With overhead (25% for TCP/IP overhead)
    const withOverhead = requiredBandwidth * 1.25;
    
    // Recommended (additional 30% buffer)
    const recommended = withOverhead * 1.3;

    return {
      type: 'file',
      fileSize: fileSizeMB,
      transferTime: timeSeconds,
      requiredBandwidth,
      withOverhead,
      recommended,
      fileSizeMbits
    };
  };

  const calculate = () => {
    let result;
    
    if (calculationType === 'service') {
      result = calculateServiceBandwidth();
    } else {
      result = calculateFileBandwidth();
    }
    
    setResults(result);
  };

  const addService = () => {
    setServices([...services, { name: '', users: 1, bandwidthPerUser: 1, unit: 'Mbps' }]);
  };

  const removeService = (index) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addServiceTemplate = (template) => {
    setServices([...services, {
      name: template.name,
      users: 1,
      bandwidthPerUser: template.bandwidth,
      unit: template.unit
    }]);
  };

  const formatBandwidth = (mbps) => {
    if (mbps >= 1000) {
      return `${(mbps / 1000).toFixed(2)} Gbps`;
    }
    return `${mbps.toFixed(2)} Mbps`;
  };

  const formatFileSize = (mb) => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatTime = (seconds) => {
    if (seconds >= 3600) {
      return `${(seconds / 3600).toFixed(2)} heures`;
    } else if (seconds >= 60) {
      return `${(seconds / 60).toFixed(2)} minutes`;
    }
    return `${seconds.toFixed(2)} secondes`;
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Calculateur de Bande Passante</h1>
        <p>Calculez les besoins en bande passante pour différents services et transferts de fichiers</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label>Type de calcul</label>
          <select value={calculationType} onChange={(e) => setCalculationType(e.target.value)}>
            <option value="service">Besoins par service</option>
            <option value="file">Transfert de fichier</option>
          </select>
        </div>

        {calculationType === 'service' ? (
          <div className="services-section">
            <div className="services-header">
              <label>Services et utilisateurs</label>
              <div className="service-templates">
                <span>Modèles rapides:</span>
                {serviceTemplates.slice(0, 6).map((template, index) => (
                  <button
                    key={index}
                    onClick={() => addServiceTemplate(template)}
                    className="template-button"
                  >
                    + {template.name}
                  </button>
                ))}
              </div>
            </div>
            
            {services.map((service, index) => (
              <div key={index} className="service-row">
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  placeholder="Nom du service"
                />
                <input
                  type="number"
                  value={service.users}
                  onChange={(e) => updateService(index, 'users', parseInt(e.target.value) || 0)}
                  placeholder="Utilisateurs"
                  min="1"
                />
                <input
                  type="number"
                  value={service.bandwidthPerUser}
                  onChange={(e) => updateService(index, 'bandwidthPerUser', parseFloat(e.target.value) || 0)}
                  placeholder="Bande passante"
                  step="0.1"
                  min="0"
                />
                <select
                  value={service.unit}
                  onChange={(e) => updateService(index, 'unit', e.target.value)}
                >
                  <option value="Kbps">Kbps</option>
                  <option value="Mbps">Mbps</option>
                  <option value="Gbps">Gbps</option>
                </select>
                {services.length > 1 && (
                  <button 
                    onClick={() => removeService(index)}
                    className="remove-button"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            <button onClick={addService} className="add-button">
              + Ajouter un service
            </button>
          </div>
        ) : (
          <div className="file-section">
            <div className="input-group">
              <label>Taille du fichier</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
                <select
                  value={fileSizeUnit}
                  onChange={(e) => setFileSizeUnit(e.target.value)}
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
            </div>
            
            <div className="input-group">
              <label>Temps de transfert souhaité</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={transferTime}
                  onChange={(e) => setTransferTime(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                >
                  <option value="seconds">Secondes</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Heures</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <button onClick={calculate} className="calculate-button">
          Calculer la Bande Passante
        </button>
      </div>

      {results && (
        <div className="results-section">
          <h2>Résultats du calcul</h2>
          
          {results.type === 'service' ? (
            <>
              <div className="result-grid">
                <div className="result-card">
                  <h3>📊 Résumé</h3>
                  <div className="result-item">
                    <span className="label">Total utilisateurs:</span>
                    <span className="value">{results.totalUsers}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Bande passante théorique:</span>
                    <span className="value">{formatBandwidth(results.totalBandwidth)}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Avec overhead réseau (+20%):</span>
                    <span className="value">{formatBandwidth(results.withOverhead)}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Recommandé (+50% pic):</span>
                    <span className="value highlight">{formatBandwidth(results.recommended)}</span>
                  </div>
                </div>
              </div>

              <div className="services-breakdown">
                <h3>📋 Détail par service</h3>
                <div className="services-table">
                  <div className="table-header">
                    <span>Service</span>
                    <span>Utilisateurs</span>
                    <span>Par utilisateur</span>
                    <span>Total</span>
                  </div>
                  {results.services.map((service, index) => (
                    <div key={index} className="table-row">
                      <span className="service-name">{service.name}</span>
                      <span className="service-users">{service.users}</span>
                      <span className="service-per-user">
                        {service.bandwidthPerUser} {service.unit}
                      </span>
                      <span className="service-total">
                        {formatBandwidth(service.totalBandwidth)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="result-grid">
              <div className="result-card">
                <h3>📁 Transfert de fichier</h3>
                <div className="result-item">
                  <span className="label">Taille du fichier:</span>
                  <span className="value">{formatFileSize(results.fileSize)}</span>
                </div>
                <div className="result-item">
                  <span className="label">Temps souhaité:</span>
                  <span className="value">{formatTime(results.transferTime)}</span>
                </div>
                <div className="result-item">
                  <span className="label">Bande passante théorique:</span>
                  <span className="value">{formatBandwidth(results.requiredBandwidth)}</span>
                </div>
                <div className="result-item">
                  <span className="label">Avec overhead TCP/IP (+25%):</span>
                  <span className="value">{formatBandwidth(results.withOverhead)}</span>
                </div>
                <div className="result-item">
                  <span className="label">Recommandé (+30% buffer):</span>
                  <span className="value highlight">{formatBandwidth(results.recommended)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bandwidth-recommendations">
            <h3>💡 Recommandations</h3>
            <div className="recommendations-list">
              <div className="recommendation">
                <span className="rec-icon">⚡</span>
                <span className="rec-text">
                  Utilisez la valeur recommandée pour gérer les pics d'utilisation
                </span>
              </div>
              <div className="recommendation">
                <span className="rec-icon">🔄</span>
                <span className="rec-text">
                  L'overhead réseau inclut les protocoles TCP/IP, Ethernet, etc.
                </span>
              </div>
              <div className="recommendation">
                <span className="rec-icon">📈</span>
                <span className="rec-text">
                  Prévoyez une marge pour la croissance future du trafic
                </span>
              </div>
              <div className="recommendation">
                <span className="rec-icon">🎯</span>
                <span className="rec-text">
                  Considérez la QoS pour prioriser le trafic critique
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BandwidthCalculator;