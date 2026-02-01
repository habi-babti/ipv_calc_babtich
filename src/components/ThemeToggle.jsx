import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          <span className={`toggle-icon ${theme === 'light' ? 'sun-icon' : 'moon-icon'}`}></span>
        </div>
      </div>
    </button>
  );
}

export default ThemeToggle;