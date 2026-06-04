// import { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   useEffect(() => {
//     const stored = localStorage.getItem('user');
//     if (stored) setUser(JSON.parse(stored));
//   }, []);

//   useEffect(() => {
//     const handleExpiredAuth = () => {
//       setUser(null);
//       setToken(null);
//     };

//     window.addEventListener('auth:expired', handleExpiredAuth);
//     return () => window.removeEventListener('auth:expired', handleExpiredAuth);
//   }, []);

//   const login = (userData, tokenData) => {
//     const cleanToken = typeof tokenData === 'string' ? tokenData.replace(/^"|"$/g, '') : tokenData;
//     setUser(userData);
//     setToken(cleanToken);
//     localStorage.setItem('token', cleanToken);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);



import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (!localStorage.getItem('token')) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
      window.location.replace('/login');
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

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

  // Inactivity tracking
  useEffect(() => {
    if (!token) return;
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // start timer on login
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, resetTimer]);

  const login = (userData, tokenData) => {
    const cleanToken = typeof tokenData === 'string' ? tokenData.replace(/^"|"$/g, '') : tokenData;
    setUser(userData);
    setToken(cleanToken);
    localStorage.setItem('token', cleanToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);