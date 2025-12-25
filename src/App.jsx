import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubnetCalculator from './pages/SubnetCalculator';
import CIDRCalculator from './pages/CIDRCalculator';
import IPv6Calculator from './pages/IPv6Calculator';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subnet-calculator" element={<SubnetCalculator />} />
            <Route path="/cidr-calculator" element={<CIDRCalculator />} />
            <Route path="/ipv6-calculator" element={<IPv6Calculator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
