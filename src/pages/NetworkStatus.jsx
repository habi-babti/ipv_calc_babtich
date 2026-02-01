import { useState, useEffect } from 'react';
import { 
  getCurrentIPInfo, 
  performSpeedTest, 
  assessNetworkQuality, 
  checkMultipleServices,
  ping,
  simulateTraceroute 
} from '../utils/networkStatus';
import './Calculator.css';

function NetworkStatus() {
  const [ipInfo, setIpInfo] = useState(null);
  const [speedTest, setSpeedTest] = useState(null);
  const [networkQuality, setNetworkQuality] = useState(null);
  const [serviceStatus, setServiceStatus] = useState([]);
  const [pingResults, setPingResults] = useState([]);
  const [traceroute, setTraceroute] = useState(null);
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const popularServices = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'GitHub', url: 'https://www.github.com' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com' },
    { name: 'AWS', url: 'https://aws.amazon.com' },
    { name: 'Microsoft', url: 'https://www.microsoft.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ];

  const pingTargets = ['google.com', 'github.com', 'cloudflare.com', '8.8.8.8'];

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(prev => ({ ...prev, overview: true }));
    
    try {
      const [ip, quality] = await Promise.all([
        getCurrentIPInfo(),
        assessNetworkQuality()
      ]);
      
      setIpInfo(ip);
      setNetworkQuality(quality);
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  const runSpeedTest = async () => {
    setLoading(prev => ({ ...prev, speed: true }));
    setSpeedTest(null);
    
    try {
      const result = await performSpeedTest();
      setSpeedTest(result);
    } catch (error) {
      console.error('Speed test error:', error);
      setSpeedTest({ error: 'Test de vitesse échoué' });
    } finally {
      setLoading(prev => ({ ...prev, speed: false }));
    }
  };

  const checkServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    
    try {
      const results = await checkMultipleServices(popularServices.map(s => s.url));
      const statusList = results.map((result, index) => ({
        name: popularServices[index].name,
        url: popularServices[index].url,
        ...result.value
      }));
      setServiceStatus(statusList);
    } catch (error) {
      console.error('Service check error:', error);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const runPingTests = async () => {
    setLoading(prev => ({ ...prev, ping: true }));
    setPingResults([]);
    
    try {
      const results = await Promise.allSettled(
        pingTargets.map(target => ping(target))
      );
      
      const pingData = results.map((result, index) => ({
        target: pingTargets[index],
        ...result.value
      }));
      
      setPingResults(pingData);
    } catch (error) {
      console.error('Ping test error:', error);
    } finally {
      setLoading(prev => ({ ...prev, ping: false }));
    }
  };

  const runTraceroute = async (target = 'google.com') => {
    setLoading(prev => ({ ...prev, traceroute: true }));
    
    try {
      const result = await simulateTraceroute(target);
      setTraceroute(result);
    } catch (error) {
      console.error('Traceroute error:', error);
    } finally {
      setLoading(prev => ({ ...prev, traceroute: false }));
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'secondary';
    }
  };

  const getSpeedCategory = (speed) => {
    if (speed >= 100) return { label: 'Très rapide', color: 'success' };
    if (speed >= 25) return { label: 'Rapide', color: 'success' };
    if (speed >= 10) return { label: 'Correct', color: 'warning' };
    if (speed >= 1) return { label: 'Lent', color: 'warning' };
    return { label: 'Très lent', color: 'error' };
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>État du Réseau</h1>
        <p>Vérifiez votre connexion internet et testez l'accessibilité des services</p>
      </div>

      <div className="network-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={`tab ${activeTab === 'speed' ? 'active' : ''}`}
          onClick={() => setActiveTab('speed')}
        >
          Test de vitesse
        </button>
        <button 
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          État des services
        </button>
        <button 
          className={`tab ${activeTab === 'diagnostics' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnostics')}
        >
          Diagnostics
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="network-overview">
            <button 
              onClick={loadOverviewData}
              className="refresh-button"
              disabled={loading.overview}
            >
              <span className="button-icon refresh-icon"></span>
              {loading.overview ? 'Actualisation...' : 'Actualiser'}
            </button>

            <div className="result-grid">
              {ipInfo && (
                <div className="result-card">
                  <h3><span className="card-header-icon location-icon"></span>Votre IP Publique</h3>
                  {ipInfo.error ? (
                    <div className="error-message">{ipInfo.error}</div>
                  ) : (
                    <>
                      <div className="result-item">
                        <span className="label">Adresse IP:</span>
                        <span className="value highlight">{ipInfo.ip}</span>
                      </div>
                      {ipInfo.country && (
                        <div className="result-item">
                          <span className="label">Localisation:</span>
                          <span className="value">{ipInfo.city}, {ipInfo.country}</span>
                        </div>
                      )}
                      {ipInfo.isp && (
                        <div className="result-item">
                          <span className="label">Fournisseur:</span>
                          <span className="value">{ipInfo.isp}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {networkQuality && (
                <div className="result-card">
                  <h3><span className="card-header-icon signal-icon"></span>Qualité de Connexion</h3>
                  <div className="result-item">
                    <span className="label">État:</span>
                    <span className={`value ${getQualityColor(networkQuality.quality)}`}>
                      {networkQuality.description}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="label">Temps de réponse:</span>
                    <span className="value">{networkQuality.responseTime}ms</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Tests réussis:</span>
                    <span className="value">{networkQuality.successfulTests}/{networkQuality.totalTests}</span>
                  </div>
                </div>
              )}

              <div className="result-card">
                <h3><span className="card-header-icon info-icon"></span>Informations Navigateur</h3>
                <div className="result-item">
                  <span className="label">Statut:</span>
                  <span className={`value ${navigator.onLine ? 'success' : 'error'}`}>
                    {navigator.onLine ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">User Agent:</span>
                  <span className="value" style={{ fontSize: '0.8rem' }}>
                    {navigator.userAgent.substring(0, 50)}...
                  </span>
                </div>
                {navigator.connection && (
                  <div className="result-item">
                    <span className="label">Type de connexion:</span>
                    <span className="value">{navigator.connection.effectiveType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'speed' && (
        <div className="tab-content">
          <div className="speed-test-section">
            <button 
              onClick={runSpeedTest}
              className="calculate-button"
              disabled={loading.speed}
            >
              <span className="button-icon speed-icon"></span>
              {loading.speed ? 'Test en cours...' : 'Lancer le test de vitesse'}
            </button>

            {speedTest && (
              <div className="speed-results">
                {speedTest.error ? (
                  <div className="error-message">{speedTest.error}</div>
                ) : (
                  <div className="result-card">
                    <h3><span className="card-header-icon trend-icon"></span>Résultats du Test</h3>
                    <div className="speed-display">
                      <div className="speed-value">
                        {speedTest.downloadSpeed} <span className="speed-unit">Mbps</span>
                      </div>
                      <div className={`speed-category ${getSpeedCategory(speedTest.downloadSpeed).color}`}>
                        {getSpeedCategory(speedTest.downloadSpeed).label}
                      </div>
                    </div>
                    <div className="result-item">
                      <span className="label">Durée du test:</span>
                      <span className="value">{speedTest.testDuration?.toFixed(1)}s</span>
                    </div>
                    <div className="result-item">
                      <span className="label">Timestamp:</span>
                      <span className="value">{new Date(speedTest.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="tab-content">
          <div className="services-section">
            <button 
              onClick={checkServices}
              className="calculate-button"
              disabled={loading.services}
            >
              <span className="button-icon check-icon"></span>
              {loading.services ? 'Vérification...' : 'Vérifier les services'}
            </button>

            {serviceStatus.length > 0 && (
              <div className="services-grid">
                {serviceStatus.map((service, index) => (
                  <div key={index} className="service-card">
                    <div className="service-header">
                      <h4>{service.name}</h4>
                      <span className={`status-badge ${service.accessible ? 'online' : 'offline'}`}>
                        {service.accessible ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                    <div className="service-details">
                      <div className="service-url">{service.url}</div>
                      {service.responseTime && (
                        <div className="response-time">{service.responseTime}ms</div>
                      )}
                      {service.error && (
                        <div className="service-error">{service.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="tab-content">
          <div className="diagnostics-section">
            <div className="diagnostic-tools">
              <button 
                onClick={runPingTests}
                className="diagnostic-button"
                disabled={loading.ping}
              >
                <span className="button-icon ping-icon"></span>
                {loading.ping ? 'Test Ping...' : 'Test Ping'}
              </button>

              <button 
                onClick={() => runTraceroute()}
                className="diagnostic-button"
                disabled={loading.traceroute}
              >
                <span className="button-icon route-icon"></span>
                {loading.traceroute ? 'Traceroute...' : 'Traceroute'}
              </button>
            </div>

            {pingResults.length > 0 && (
              <div className="ping-results">
                <h3><span className="card-header-icon ping-icon"></span>Résultats Ping</h3>
                <div className="ping-table">
                  <div className="table-header">
                    <span>Cible</span>
                    <span>Temps de réponse</span>
                    <span>Statut</span>
                  </div>
                  {pingResults.map((result, index) => (
                    <div key={index} className="table-row">
                      <span className="ping-target">{result.target}</span>
                      <span className="ping-time">
                        {result.responseTime ? `${result.responseTime}ms` : 'N/A'}
                      </span>
                      <span className={`ping-status ${result.status}`}>
                        {result.status === 'success' ? 'Succès' : 'Échec'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {traceroute && (
              <div className="traceroute-results">
                <h3><span className="card-header-icon route-icon"></span>Traceroute vers {traceroute.target}</h3>
                <div className="traceroute-table">
                  <div className="table-header">
                    <span>Saut</span>
                    <span>Hôte</span>
                    <span>IP</span>
                    <span>Temps</span>
                  </div>
                  {traceroute.hops.map((hop, index) => (
                    <div key={index} className="table-row">
                      <span className="hop-number">{hop.hop}</span>
                      <span className="hop-host">{hop.host}</span>
                      <span className="hop-ip">{hop.ip}</span>
                      <span className="hop-time">{hop.responseTime.toFixed(1)}ms</span>
                    </div>
                  ))}
                </div>
                <div className="traceroute-note">
                  <small>{traceroute.note}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NetworkStatus;