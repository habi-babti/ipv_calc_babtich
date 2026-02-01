import { useState } from 'react';
import './Calculator.css';

function IPGeolocation() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateIP = (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const lookupIP = async () => {
    if (!ip.trim()) {
      setError('Veuillez entrer une adresse IP');
      return;
    }

    if (!validateIP(ip.trim())) {
      setError('Format d\'adresse IP invalide');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Using ip-api.com (free service, no API key required)
      const response = await fetch(`https://ip-api.com/json/${ip.trim()}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setResult(data);
      } else {
        setError(data.message || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentIP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIp(data.ip);
    } catch (err) {
      setError('Impossible d\'obtenir votre IP publique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Géolocalisation IP</h1>
        <p>Obtenez des informations détaillées sur la localisation et l'ISP d'une adresse IP</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label>Adresse IP</label>
          <div className="ip-input-container">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Ex: 8.8.8.8 ou 2001:4860:4860::8888"
              onKeyPress={(e) => e.key === 'Enter' && lookupIP()}
            />
            <button 
              onClick={getCurrentIP}
              className="secondary-button"
              disabled={loading}
            >
              Mon IP
            </button>
          </div>
        </div>

        <button 
          onClick={lookupIP}
          className="calculate-button"
          disabled={loading}
        >
          {loading ? 'Recherche...' : 'Localiser'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {result && (
        <div className="results-section">
          <h2>Informations de Géolocalisation</h2>
          
          <div className="result-grid">
            <div className="result-card">
              <h3><span className="card-header-icon location-icon"></span>Localisation</h3>
              <div className="result-item">
                <span className="label">Pays:</span>
                <span className="value">{result.country} ({result.countryCode})</span>
              </div>
              <div className="result-item">
                <span className="label">Région:</span>
                <span className="value">{result.regionName} ({result.region})</span>
              </div>
              <div className="result-item">
                <span className="label">Ville:</span>
                <span className="value">{result.city}</span>
              </div>
              <div className="result-item">
                <span className="label">Code postal:</span>
                <span className="value">{result.zip || 'N/A'}</span>
              </div>
            </div>

            <div className="result-card">
              <h3><span className="card-header-icon coordinates-icon"></span>Coordonnées</h3>
              <div className="result-item">
                <span className="label">Latitude:</span>
                <span className="value">{result.lat}</span>
              </div>
              <div className="result-item">
                <span className="label">Longitude:</span>
                <span className="value">{result.lon}</span>
              </div>
              <div className="result-item">
                <span className="label">Fuseau horaire:</span>
                <span className="value">{result.timezone}</span>
              </div>
            </div>

            <div className="result-card">
              <h3><span className="card-header-icon provider-icon"></span>Fournisseur</h3>
              <div className="result-item">
                <span className="label">ISP:</span>
                <span className="value">{result.isp}</span>
              </div>
              <div className="result-item">
                <span className="label">Organisation:</span>
                <span className="value">{result.org}</span>
              </div>
              <div className="result-item">
                <span className="label">AS:</span>
                <span className="value">{result.as}</span>
              </div>
              <div className="result-item">
                <span className="label">IP recherchée:</span>
                <span className="value">{result.query}</span>
              </div>
            </div>
          </div>

          <div className="map-link">
            <a 
              href={`https://www.google.com/maps?q=${result.lat},${result.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-button"
            >
              <span className="button-icon map-icon"></span>
              Voir sur Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default IPGeolocation;