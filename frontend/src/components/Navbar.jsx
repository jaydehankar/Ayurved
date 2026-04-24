import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Check localStorage for logged-in user
  useEffect(() => {
    const stored = localStorage.getItem('ayurUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }

    // Listen for auth changes from Login page
    const handleAuthChange = () => {
      const stored = localStorage.getItem('ayurUser');
      setUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener('userAuthChanged', handleAuthChange);
    return () => window.removeEventListener('userAuthChanged', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ayurUser');
    setUser(null);
    window.dispatchEvent(new Event('userAuthChanged'));
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="brand-icon">🌿</span>
        Ayurvedazen
      </NavLink>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/quiz" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Take Quiz</NavLink>
        <NavLink to="/doctors" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Doctors</NavLink>
        <NavLink to="/feedback" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Feedback</NavLink>
      </div>

      <div className="navbar-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle-btn"
        >
          <span className="theme-icon" key={theme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>

        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <NavLink to="/login" className="login-nav-btn" onClick={() => setMenuOpen(false)}>
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

