import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span>Calculateur IP</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Accueil
        </NavLink>
        <NavLink to="/subnet-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
          Sous-réseau IPv4
        </NavLink>
        <NavLink to="/cidr-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
          Notation Préfixe IPv4
        </NavLink>
        <NavLink to="/ipv6-calculator" className={({ isActive }) => isActive ? 'active' : ''}>
          IPv6
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
