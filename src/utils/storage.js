// Local storage utilities for calculations and history

export const STORAGE_KEYS = {
  CALCULATIONS: 'network_calculations',
  HISTORY: 'calculation_history',
  FAVORITES: 'favorite_calculations',
  SETTINGS: 'app_settings'
};

// Save calculation result
export const saveCalculation = (type, input, result, name = null) => {
  const calculation = {
    id: Date.now().toString(),
    type,
    input,
    result,
    name: name || `${type} - ${new Date().toLocaleString()}`,
    timestamp: new Date().toISOString(),
    favorite: false
  };

  const saved = getSavedCalculations();
  saved.unshift(calculation);
  
  // Keep only last 100 calculations
  if (saved.length > 100) {
    saved.splice(100);
  }

  localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(saved));
  addToHistory(calculation);
  
  return calculation.id;
};

// Get all saved calculations
export const getSavedCalculations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CALCULATIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved calculations:', error);
    return [];
  }
};

// Delete a calculation
export const deleteCalculation = (id) => {
  const saved = getSavedCalculations();
  const filtered = saved.filter(calc => calc.id !== id);
  localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(filtered));
};

// Toggle favorite status
export const toggleFavorite = (id) => {
  const saved = getSavedCalculations();
  const calculation = saved.find(calc => calc.id === id);
  if (calculation) {
    calculation.favorite = !calculation.favorite;
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(saved));
  }
};

// Get calculation history (simplified view)
export const getCalculationHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading calculation history:', error);
    return [];
  }
};

// Add to history (for quick access)
const addToHistory = (calculation) => {
  const history = getCalculationHistory();
  const historyItem = {
    id: calculation.id,
    type: calculation.type,
    input: calculation.input,
    timestamp: calculation.timestamp,
    name: calculation.name
  };

  history.unshift(historyItem);
  
  // Keep only last 50 history items
  if (history.length > 50) {
    history.splice(50);
  }

  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

// Clear all data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Export calculations as JSON
export const exportCalculations = () => {
  const calculations = getSavedCalculations();
  const dataStr = JSON.stringify(calculations, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `network-calculations-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import calculations from JSON
export const importCalculations = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          const existing = getSavedCalculations();
          const merged = [...imported, ...existing];
          
          // Remove duplicates based on timestamp and input
          const unique = merged.filter((calc, index, arr) => 
            index === arr.findIndex(c => 
              c.timestamp === calc.timestamp && 
              JSON.stringify(c.input) === JSON.stringify(calc.input)
            )
          );

          localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(unique));
          resolve(imported.length);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

// Get app settings
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      autoSave: true,
      showHistory: true,
      exportFormat: 'json',
      maxHistoryItems: 50
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
};

// Save app settings
export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};