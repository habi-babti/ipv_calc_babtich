import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import CalculationHistory from './CalculationHistory';
import './Navbar.css';

function Navbar() {
  const [showHistory, setShowHistory] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLoadCalculation = (calculation) => {
    // This would be handled by the specific calculator page
    console.log('Loading calculation:', calculation);
    setShowHistory(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <NavLink to="/" className="brand-link">
          <span className="brand-icon network-icon"></span>
          <span>Calculateur IP</span>
        </NavLink>
      </div>
      
      <div className={`nav-links ${showMobileMenu ? 'mobile-open' : ''}`}>
        <div className="nav-group">
          <span className="nav-group-title">Calculateurs</span>
          <NavLink to="/subnet-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
            Sous-réseau IPv4
          </NavLink>
          <NavLink to="/cidr-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
            CIDR
          </NavLink>
          <NavLink to="/ipv6-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
            IPv6
          </NavLink>
          <NavLink to="/binary-converter" className={({ isActive }) => isActive ? 'active' : ''}>
            Binaire
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Outils</span>
          <NavLink to="/ip-geolocation" className={({ isActive }) => isActive ? 'active' : ''}>
            Géolocalisation
          </NavLink>
          <NavLink to="/dns-lookup" className={({ isActive }) => isActive ? 'active' : ''}>
            DNS
          </NavLink>
          <NavLink to="/network-status" className={({ isActive }) => isActive ? 'active' : ''}>
            État Réseau
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">Avancé</span>
          <NavLink to="/supernetting-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
            Supernetting
          </NavLink>
          <NavLink to="/network-overlap-detector" className={({ isActive }) => isActive ? 'active' : ''}>
            Chevauchements
          </NavLink>
          <NavLink to="/subnetting-quiz" className={({ isActive }) => isActive ? 'active' : ''}>
            Quiz
          </NavLink>
        </div>
      </div>

      <div className="nav-actions">
        <button 
          onClick={() => setShowHistory(true)}
          className="nav-action-button"
          title="Historique des calculs"
        >
          <span className="history-icon"></span>
        </button>
        
        <ThemeToggle />
        
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="mobile-menu-button"
        >
          <span className={`menu-icon ${showMobileMenu ? 'open' : ''}`}></span>
        </button>
      </div>

      <CalculationHistory 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadCalculation={handleLoadCalculation}
      />
    </nav>
  );
}

export default Navbar;
