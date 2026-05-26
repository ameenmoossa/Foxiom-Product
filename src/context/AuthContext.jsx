import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleExpiredAuth = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleExpiredAuth);
    return () => window.removeEventListener('auth:expired', handleExpiredAuth);
  }, []);

  const login = (userData, tokenData) => {
    const cleanToken = typeof tokenData === 'string' ? tokenData.replace(/^"|"$/g, '') : tokenData;
    setUser(userData);
    setToken(cleanToken);
    localStorage.setItem('token', cleanToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
