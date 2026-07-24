import React, { useCallback, useEffect, useState } from 'react';
import { loadState, saveState } from './data/storage.js';
import { logout } from './lib/auth.js';
import Login from './components/Login.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import TeacherPanel from './components/TeacherPanel.jsx';
import StudentPanel from './components/StudentPanel.jsx';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('ikrom-kursi-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  } catch { return 'light'; }
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [user, setUser] = useState(() => {
    try {
      const id = localStorage.getItem('ikrom-kursi-session');
      if (!id) return null;
      return loadState().users.find((u) => u.id === id) || null;
    } catch { return null; }
  });
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply data-theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ikrom-kursi-theme', theme); } catch { /* noop */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // Persist state on every change.
  useEffect(() => { saveState(state); }, [state]);

  function handleLogin(u) { setUser(u); }
  function handleLogout() { logout(); setUser(null); }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app">
      {user.role === 'admin'   && <AdminPanel   state={state} setState={setState} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
      {user.role === 'teacher' && <TeacherPanel state={state} setState={setState} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
      {user.role === 'student' && <StudentPanel state={state} setState={setState} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
    </div>
  );
}
