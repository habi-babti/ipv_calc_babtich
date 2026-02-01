// Network status and connectivity utilities

// Check if a website/service is accessible
export const checkServiceStatus = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    
    return {
      url,
      status: 'online',
      responseTime: Date.now() - performance.now(),
      accessible: true
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    return {
      url,
      status: 'offline',
      error: error.message,
      accessible: false
    };
  }
};

// Check multiple services
export const checkMultipleServices = async (urls) => {
  const promises = urls.map(url => checkServiceStatus(url));
  return Promise.allSettled(promises);
};

// Get current public IP information
export const getCurrentIPInfo = async () => {
  try {
    // Try multiple IP services for reliability
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ip-api.com/json/'
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service, { timeout: 5000 });
        const data = await response.json();
        
        if (data.ip || data.query) {
          return {
            ip: data.ip || data.query,
            country: data.country,
            region: data.region || data.regionName,
            city: data.city,
            isp: data.isp || data.org,
            timezone: data.timezone,
            lat: data.lat,
            lon: data.lon,
            source: service
          };
        }
      } catch (error) {
        console.warn(`Failed to get IP from ${service}:`, error);
        continue;
      }
    }
    
    throw new Error('All IP services failed');
  } catch (error) {
    console.error('Error getting IP info:', error);
    return {
      error: 'Unable to determine public IP',
      offline: !navigator.onLine
    };
  }
};

// Simple speed test (download test)
export const performSpeedTest = async (testDuration = 10000) => {
  const testUrl = 'https://speed.cloudflare.com/__down?bytes=';
  const testSizes = [1000000, 5000000, 10000000]; // 1MB, 5MB, 10MB
  
  try {
    const results = [];
    
    for (const size of testSizes) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${testUrl}${size}`, {
          cache: 'no-cache'
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        await response.blob(); // Download the data
        const endTime = performance.now();
        
        const duration = (endTime - startTime) / 1000; // seconds
        const speedMbps = (size * 8) / (duration * 1000000); // Mbps
        
        results.push({
          size,
          duration,
          speedMbps: Math.round(speedMbps * 100) / 100
        });
        
        // Stop if we have a good measurement
        if (duration > 2 && speedMbps > 0) break;
        
      } catch (error) {
        console.warn(`Speed test failed for size ${size}:`, error);
        continue;
      }
    }
    
    if (results.length === 0) {
      throw new Error('All speed tests failed');
    }
    
    // Calculate average speed
    const avgSpeed = results.reduce((sum, result) => sum + result.speedMbps, 0) / results.length;
    
    return {
      downloadSpeed: Math.round(avgSpeed * 100) / 100,
      results,
      timestamp: new Date().toISOString(),
      testDuration: results[results.length - 1].duration
    };
    
  } catch (error) {
    console.error('Speed test error:', error);
    return {
      error: 'Speed test failed',
      message: error.message
    };
  }
};

// Network quality assessment
export const assessNetworkQuality = async () => {
  const startTime = performance.now();
  
  try {
    // Test connection to multiple reliable services
    const testServices = [
      'https://www.google.com',
      'https://www.cloudflare.com',
      'https://www.github.com'
    ];
    
    const results = await Promise.allSettled(
      testServices.map(url => checkServiceStatus(url, 3000))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.accessible).length;
    const totalTime = performance.now() - startTime;
    
    let quality = 'poor';
    let description = 'Connexion instable ou lente';
    
    if (successful === testServices.length && totalTime < 2000) {
      quality = 'excellent';
      description = 'Connexion rapide et stable';
    } else if (successful >= 2 && totalTime < 5000) {
      quality = 'good';
      description = 'Connexion correcte';
    } else if (successful >= 1) {
      quality = 'fair';
      description = 'Connexion lente mais fonctionnelle';
    }
    
    return {
      quality,
      description,
      successfulTests: successful,
      totalTests: testServices.length,
      responseTime: Math.round(totalTime),
      online: navigator.onLine,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      quality: 'poor',
      description: 'Erreur lors du test de connexion',
      error: error.message,
      online: navigator.onLine,
      timestamp: new Date().toISOString()
    };
  }
};

// Monitor network status changes
export class NetworkMonitor {
  constructor() {
    this.listeners = [];
    this.isOnline = navigator.onLine;
    this.lastCheck = null;
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Periodic connectivity check
    this.startPeriodicCheck();
  }
  
  handleOnline() {
    this.isOnline = true;
    this.notifyListeners({ type: 'online', timestamp: new Date().toISOString() });
  }
  
  handleOffline() {
    this.isOnline = false;
    this.notifyListeners({ type: 'offline', timestamp: new Date().toISOString() });
  }
  
  startPeriodicCheck(interval = 30000) { // Check every 30 seconds
    setInterval(async () => {
      if (this.isOnline) {
        const quality = await assessNetworkQuality();
        this.lastCheck = quality;
        this.notifyListeners({ type: 'quality-check', data: quality });
      }
    }, interval);
  }
  
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Network monitor listener error:', error);
      }
    });
  }
  
  getStatus() {
    return {
      online: this.isOnline,
      lastCheck: this.lastCheck,
      connection: navigator.connection || null
    };
  }
}

// Ping utility (using image loading as fallback)
export const ping = async (host, timeout = 5000) => {
  const startTime = performance.now();
  
  try {
    // Try to load a small image from the host
    const img = new Image();
    const url = `https://${host}/favicon.ico?t=${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout'));
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;
        resolve({
          host,
          responseTime: Math.round(responseTime),
          status: 'success'
        });
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Host unreachable'));
      };
      
      img.src = url;
    });
    
  } catch (error) {
    return {
      host,
      error: error.message,
      status: 'failed'
    };
  }
};

// Traceroute simulation (limited in browser)
export const simulateTraceroute = async (host) => {
  // This is a simplified version since real traceroute requires raw sockets
  const hops = [
    { hop: 1, host: 'Gateway', ip: '192.168.1.1', responseTime: 1 },
    { hop: 2, host: 'ISP Router', ip: '10.0.0.1', responseTime: 15 },
    { hop: 3, host: 'Regional Hub', ip: '203.0.113.1', responseTime: 25 },
    { hop: 4, host: host, ip: 'Unknown', responseTime: 45 }
  ];
  
  // Simulate realistic response times
  for (let i = 0; i < hops.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    hops[i].responseTime += Math.random() * 10;
  }
  
  return {
    target: host,
    hops,
    totalTime: hops[hops.length - 1].responseTime,
    note: 'Simulation - Real traceroute not available in browser'
  };
};