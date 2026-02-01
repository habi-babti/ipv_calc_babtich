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
        <h2 className="section-title">Calculateurs de Base</h2>
        <div className="cards-grid">
          <Link to="/subnet-calculator" className="card">
            <div className="card-icon">🔢</div>
            <h3>Sous-réseau IPv4</h3>
            <p>Calculer les détails du sous-réseau à partir de l'IP hôte et des masques</p>
            <span className="card-link">Commencer</span>
          </Link>

          <Link to="/cidr-calculator" className="card">
            <div className="card-icon">📊</div>
            <h3>Notation Préfixe IPv4</h3>
            <p>Calculer les détails du réseau à partir de la notation préfixe</p>
            <span className="card-link">Commencer</span>
          </Link>

          <Link to="/ipv6-calculator" className="card">
            <div className="card-icon">🌐</div>
            <h3>Calculateur IPv6</h3>
            <p>Calculer les détails du réseau IPv6 avec notation préfixe</p>
            <span className="card-link">Commencer</span>
          </Link>

          <Link to="/vlsm-calculator" className="card">
            <div className="card-icon">📋</div>
            <h3>Tableaux VLSM</h3>
            <p>Générer des tableaux de planification VLSM vides pour laboratoires Cisco</p>
            <span className="card-link">Commencer</span>
          </Link>
        </div>

        <h2 className="section-title">Outils Réseau</h2>
        <div className="cards-grid">
          <Link to="/ip-geolocation" className="card">
            <div className="card-icon">🌍</div>
            <h3>Géolocalisation IP</h3>
            <p>Localiser une adresse IP et obtenir des informations sur l'ISP</p>
            <span className="card-link">Localiser</span>
          </Link>

          <Link to="/dns-lookup" className="card">
            <div className="card-icon">🔍</div>
            <h3>Recherche DNS</h3>
            <p>Rechercher les enregistrements DNS (A, AAAA, MX, NS, etc.)</p>
            <span className="card-link">Rechercher</span>
          </Link>
        </div>

        <h2 className="section-title">Calculateurs Avancés</h2>
        <div className="cards-grid">
          <Link to="/supernetting-calculator" className="card">
            <div className="card-icon">🔗</div>
            <h3>Supernetting</h3>
            <p>Calculer l'agrégation de routes et la summarisation</p>
            <span className="card-link">Calculer</span>
          </Link>

          <Link to="/ip-range-calculator" className="card">
            <div className="card-icon">📏</div>
            <h3>Plages IP</h3>
            <p>Convertir entre CIDR, plages et masques wildcard</p>
            <span className="card-link">Convertir</span>
          </Link>

          <Link to="/binary-converter" className="card">
            <div className="card-icon">💻</div>
            <h3>Convertisseur Binaire</h3>
            <p>Convertir les adresses IP entre formats binaire, décimal et hexadécimal</p>
            <span className="card-link">Convertir</span>
          </Link>

          <Link to="/network-overlap-detector" className="card">
            <div className="card-icon">⚠️</div>
            <h3>Détecteur de Chevauchement</h3>
            <p>Vérifier si les sous-réseaux se chevauchent</p>
            <span className="card-link">Vérifier</span>
          </Link>
        </div>

        <h2 className="section-title">Outils Éducatifs</h2>
        <div className="cards-grid">
          <Link to="/subnetting-quiz" className="card">
            <div className="card-icon">🎯</div>
            <h3>Quiz Sous-réseautage</h3>
            <p>Testez vos connaissances avec des problèmes interactifs</p>
            <span className="card-link">Commencer</span>
          </Link>
        </div>

        <h2 className="section-title">Outils Pratiques</h2>
        <div className="cards-grid">
          <Link to="/bandwidth-calculator" className="card">
            <div className="card-icon">📈</div>
            <h3>Calculateur de Bande Passante</h3>
            <p>Calculer les besoins en bande passante pour différents services</p>
            <span className="card-link">Calculer</span>
          </Link>
        </div>
      </div>

      <div className="info-section">
        <h2>Comment ça marche</h2>
        <p>
          Ce calculateur vous montre le processus complet étape par étape pour le sous-réseautage IPv4 et IPv6.
          Chaque calcul est décomposé en étapes individuelles avec des explications détaillées. Inclut également
          des outils pour générer des tableaux VLSM vides pour vos laboratoires.
        </p>
        <div className="features">
          <div className="feature">
            <span>✓</span> Méthode du bloc
          </div>
          <div className="feature">
            <span>✓</span> IPv4 et IPv6
          </div>
          <div className="feature">
            <span>✓</span> Tableaux VLSM
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