import React, { useCallback, useEffect, useState } from 'react';
import { loadState, saveState } from './data/storage.js';
import { logout } from './lib/auth.js';
import Login from './components/Login.jsx';
import Landing from './components/Landing.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import TeacherPanel from './components/TeacherPanel.jsx';
import StudentPanel from './components/StudentPanel.jsx';

// Light is the default on purpose: the landing page is the first thing a
// visitor sees and it is designed light-first. Dark is opt-in via the toggle
// and remembered from then on.
function getInitialTheme() {
  try {
    const stored = localStorage.getItem('ikrom-kursi-theme');
    if (stored === 'dark' || stored === 'light') return stored;
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
  // No router in this app — the public side is one more piece of view state.
  // 'landing' is the front door; 'login' is reached from the Kirish button.
  const [view, setView] = useState('landing');

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
  function handleLogout() { logout(); setUser(null); setView('landing'); }

  // Landing sign-up form. The application is stored so the admin panel can show
  // it; the form itself also opens Telegram so nothing depends on this alone.
  function handleApply(application) {
    setState((s) => ({ ...s, applications: [application, ...(s.applications || [])] }));
  }

  if (!user) {
    if (view === 'login') {
      return <Login onLogin={handleLogin} onBack={() => setView('landing')} />;
    }
    return (
      <Landing
        onEnter={() => { setView('login'); window.scrollTo(0, 0); }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onApply={handleApply}
      />
    );
  }

  return (
    <div className="app">
      {user.role === 'admin'   && <AdminPanel   state={state} setState={setState} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
      {user.role === 'teacher' && <TeacherPanel state={state} setState={setState} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
      {user.role === 'student' && <StudentPanel state={state} setState={setState} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}
    </div>
  );
}
