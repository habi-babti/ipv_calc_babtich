import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Calculateur IP</h1>
        <p className="subtitle">Apprenez le sous-réseautage étape par étape avec des explications détaillées</p>
      </div>

      <div className="cards-container">
        <Link to="/subnet-calculator" className="card">
          <div className="card-icon"></div>
          <h2>Sous-réseau IPv4</h2>
          <p>Calculer les détails du sous-réseau à partir de l'IP hôte et des masques</p>
          <ul>
            <li>Bits de sous-réseau</li>
            <li>Nombre de sous-réseaux</li>
            <li>Hôtes utilisables</li>
            <li>Réseau, broadcast</li>
          </ul>
          <span className="card-link">Commencer</span>
        </Link>

        <Link to="/cidr-calculator" className="card">
          <div className="card-icon"></div>
          <h2>Notation Préfixe IPv4</h2>
          <p>Calculer les détails du réseau à partir de la notation préfixe</p>
          <ul>
            <li>Bits d'hôte</li>
            <li>Nombre total d'hôtes</li>
            <li>Adresse réseau</li>
            <li>Adresse de broadcast</li>
          </ul>
          <span className="card-link">Commencer</span>
        </Link>

        <Link to="/ipv6-calculator" className="card">
          <div className="card-icon"></div>
          <h2>Calculateur IPv6</h2>
          <p>Calculer les détails du réseau IPv6 avec notation préfixe</p>
          <ul>
            <li>Bits d'hôte IPv6</li>
            <li>Nombre d'adresses</li>
            <li>Préfixe réseau</li>
            <li>Plage d'adresses</li>
          </ul>
          <span className="card-link">Commencer</span>
        </Link>
      </div>

      <div className="info-section">
        <h2>Comment ça marche</h2>
        <p>
          Ce calculateur vous montre le processus complet étape par étape pour le sous-réseautage IPv4 et IPv6.
          Chaque calcul est décomposé en étapes individuelles avec des explications détaillées.
        </p>
        <div className="features">
          <div className="feature">
            <span>✓</span> Méthode du bloc
          </div>
          <div className="feature">
            <span>✓</span> IPv4 et IPv6
          </div>
          <div className="feature">
            <span>✓</span> Étape par étape
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>Créé par Babtich El Habib © 2025</p>
      </footer>
    </div>
  );
}

export default Home;