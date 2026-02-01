import { useState, useEffect } from 'react';
import './Calculator.css';

function BinaryConverter() {
  const [ip, setIp] = useState('192.168.1.1');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const validateIPv4 = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  const decimalToBinary = (decimal) => {
    return parseInt(decimal, 10).toString(2).padStart(8, '0');
  };

  const decimalToHex = (decimal) => {
    return parseInt(decimal, 10).toString(16).toUpperCase().padStart(2, '0');
  };

  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  const convertIP = () => {
    if (!ip.trim()) {
      setError('Veuillez entrer une adresse IP');
      return;
    }

    if (!validateIPv4(ip.trim())) {
      setError('Format d\'adresse IPv4 invalide');
      return;
    }

    setError('');
    const parts = ip.trim().split('.');
    
    const conversions = parts.map(part => ({
      decimal: part,
      binary: decimalToBinary(part),
      hex: decimalToHex(part)
    }));

    const fullBinary = conversions.map(c => c.binary).join('.');
    const fullBinaryNoDots = conversions.map(c => c.binary).join('');
    const fullHex = conversions.map(c => c.hex).join(':');
    const fullHexNoDots = conversions.map(c => c.hex).join('');

    setResults({
      parts: conversions,
      fullBinary,
      fullBinaryNoDots,
      fullHex,
      fullHexNoDots,
      decimalValue: parts.reduce((acc, part, index) => {
        return acc + (parseInt(part) * Math.pow(256, 3 - index));
      }, 0)
    });
  };

  useEffect(() => {
    convertIP();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="calculator">
      <div className="calculator-header">
        <h1>Convertisseur Binaire IP</h1>
        <p>Convertissez les adresses IPv4 entre formats décimal, binaire et hexadécimal</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label>Adresse IPv4</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Ex: 192.168.1.1"
            onKeyPress={(e) => e.key === 'Enter' && convertIP()}
          />
        </div>

        <button 
          onClick={convertIP}
          className="calculate-button"
        >
          Convertir
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {results && (
        <div className="results-section">
          <h2>Conversions pour {ip}</h2>
          
          <div className="conversion-table">
            <div className="table-header">
              <span>Octet</span>
              <span>Décimal</span>
              <span>Binaire</span>
              <span>Hexadécimal</span>
            </div>
            {results.parts.map((part, index) => (
              <div key={index} className="table-row">
                <span className="octet-number">{index + 1}</span>
                <span className="decimal-value">{part.decimal}</span>
                <span className="binary-value">{part.binary}</span>
                <span className="hex-value">0x{part.hex}</span>
              </div>
            ))}
          </div>

          <div className="full-conversions">
            <div className="conversion-card">
              <h3>🔢 Formats complets</h3>
              
              <div className="conversion-item">
                <span className="conversion-label">Décimal (original):</span>
                <div className="conversion-value">
                  <code>{ip}</code>
                  <button onClick={() => copyToClipboard(ip)} className="copy-btn">📋</button>
                </div>
              </div>

              <div className="conversion-item">
                <span className="conversion-label">Binaire (avec points):</span>
                <div className="conversion-value">
                  <code>{results.fullBinary}</code>
                  <button onClick={() => copyToClipboard(results.fullBinary)} className="copy-btn">📋</button>
                </div>
              </div>

              <div className="conversion-item">
                <span className="conversion-label">Binaire (32 bits):</span>
                <div className="conversion-value">
                  <code>{results.fullBinaryNoDots}</code>
                  <button onClick={() => copyToClipboard(results.fullBinaryNoDots)} className="copy-btn">📋</button>
                </div>
              </div>

              <div className="conversion-item">
                <span className="conversion-label">Hexadécimal (avec :):</span>
                <div className="conversion-value">
                  <code>{results.fullHex}</code>
                  <button onClick={() => copyToClipboard(results.fullHex)} className="copy-btn">📋</button>
                </div>
              </div>

              <div className="conversion-item">
                <span className="conversion-label">Hexadécimal (compact):</span>
                <div className="conversion-value">
                  <code>0x{results.fullHexNoDots}</code>
                  <button onClick={() => copyToClipboard(`0x${results.fullHexNoDots}`)} className="copy-btn">📋</button>
                </div>
              </div>

              <div className="conversion-item">
                <span className="conversion-label">Valeur décimale 32-bit:</span>
                <div className="conversion-value">
                  <code>{results.decimalValue.toLocaleString()}</code>
                  <button onClick={() => copyToClipboard(results.decimalValue.toString())} className="copy-btn">📋</button>
                </div>
              </div>
            </div>

            <div className="conversion-card">
              <h3>📚 Explications</h3>
              <div className="explanation">
                <p><strong>Binaire:</strong> Chaque octet (0-255) est représenté sur 8 bits</p>
                <p><strong>Hexadécimal:</strong> Chaque octet est représenté sur 2 chiffres hex (00-FF)</p>
                <p><strong>32-bit:</strong> L'adresse IP complète comme un entier non signé</p>
              </div>
            </div>
          </div>

          <div className="binary-breakdown">
            <h3>🔍 Décomposition binaire</h3>
            <div className="binary-grid">
              {results.parts.map((part, octetIndex) => (
                <div key={octetIndex} className="binary-octet">
                  <div className="octet-header">Octet {octetIndex + 1} ({part.decimal})</div>
                  <div className="binary-bits">
                    {part.binary.split('').map((bit, bitIndex) => (
                      <div key={bitIndex} className={`bit ${bit === '1' ? 'bit-on' : 'bit-off'}`}>
                        <div className="bit-value">{bit}</div>
                        <div className="bit-weight">{Math.pow(2, 7 - bitIndex)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="octet-calculation">
                    {part.binary.split('').map((bit, bitIndex) => 
                      bit === '1' ? Math.pow(2, 7 - bitIndex) : 0
                    ).filter(val => val > 0).join(' + ')} = {part.decimal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BinaryConverter;