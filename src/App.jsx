import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubnetCalculator from './pages/SubnetCalculator';
import CIDRCalculator from './pages/CIDRCalculator';
import IPv6Calculator from './pages/IPv6Calculator';
import VLSMCalculator from './pages/VLSMCalculator';
import IPGeolocation from './pages/IPGeolocation';
import DNSLookup from './pages/DNSLookup';
import SupernettingCalculator from './pages/SupernettingCalculator';
import IPRangeCalculator from './pages/IPRangeCalculator';
import BinaryConverter from './pages/BinaryConverter';
import NetworkOverlapDetector from './pages/NetworkOverlapDetector';
import SubnettingQuiz from './pages/SubnettingQuiz';
import BandwidthCalculator from './pages/BandwidthCalculator';
import NetworkStatus from './pages/NetworkStatus';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/subnet-calculator" element={<SubnetCalculator />} />
              <Route path="/cidr-calculator" element={<CIDRCalculator />} />
              <Route path="/ipv6-calculator" element={<IPv6Calculator />} />
              <Route path="/vlsm-calculator" element={<VLSMCalculator />} />
              <Route path="/ip-geolocation" element={<IPGeolocation />} />
              <Route path="/dns-lookup" element={<DNSLookup />} />
              <Route path="/supernetting-calculator" element={<SupernettingCalculator />} />
              <Route path="/ip-range-calculator" element={<IPRangeCalculator />} />
              <Route path="/binary-converter" element={<BinaryConverter />} />
              <Route path="/network-overlap-detector" element={<NetworkOverlapDetector />} />
              <Route path="/subnetting-quiz" element={<SubnettingQuiz />} />
              <Route path="/bandwidth-calculator" element={<BandwidthCalculator />} />
              <Route path="/network-status" element={<NetworkStatus />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
