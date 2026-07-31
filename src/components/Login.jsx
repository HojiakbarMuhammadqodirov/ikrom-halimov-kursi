import React, { useState } from 'react';
import { login } from '../lib/auth.js';
import { AtomOrbit, WaveInterference, RulerCompass } from './SubjectArt.jsx';

const DEMO_ACCOUNTS = [
  { role: 'Admin',      user: 'admincourse',     pass: 'admincourse2026' },
  { role: 'O\'qituvchi', user: 'IkromjonHalimov', pass: 'HalimovTeacher123' },
  { role: 'O\'quvchi',   user: 'ali.akbarov',     pass: 'ali.akbarov2026' },
];

export default function Login({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const result = login(username, password);
    if (!result.ok) { setError(result.error); return; }
    onLogin(result.user);
  }

  function fillDemo(acct) {
    setUsername(acct.user);
    setPassword(acct.pass);
    setError('');
  }

  async function copyValue(value, key) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1400);
    } catch { /* ignore */ }
  }

  return (
    <div className="login-wrap">
      {/* Left editorial aside — dark, with the atom + wave decor. */}
      <aside className="login-aside">
        <div>
          <div className="eyebrow" style={{ background: 'rgba(244, 241, 236, 0.08)', color: 'rgba(244, 241, 236, 0.7)' }}>
            <span style={{ background: 'rgba(244, 241, 236, 0.5)' }} /> Fizika &amp; Matematika
          </div>
          <h1>
            Chuqur <em>ilm</em>,<br />
            aniq <em>natijalar</em>.
          </h1>
          <p className="lede">
            Ikrom Halimov kursi — fizika va matematika yo&lsquo;nalishi bo&lsquo;yicha
            tizimli tayyorgarlik, haftalik testlar, batafsil tahlil.
          </p>
        </div>

        <div className="meta">
          <span><b>2</b>fan</span>
          <span><b>40+</b>savol</span>
          <span><b>20</b>kunlik</span>
          <span><b>1:1</b>tahlil</span>
        </div>

        {/* Decorative art layers */}
        <div className="art-layer" style={{ top: '38%', right: '-12%', transform: 'translate(0, -50%)', opacity: 0.22, color: 'rgba(244, 241, 236, 0.4)' }}>
          <AtomOrbit size={420} accent="rgba(244, 241, 236, 0.4)" />
        </div>
        <div className="art-layer" style={{ bottom: '36px', left: '40px', right: '40px', color: 'rgba(244, 241, 236, 0.35)' }}>
          <WaveInterference accent="rgba(244, 241, 236, 0.45)" height={56} />
        </div>
      </aside>

      {/* Right form */}
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit}>
          {onBack && (
            <button type="button" className="login-back" onClick={onBack}>
              <span aria-hidden="true">←</span> Bosh sahifaga
            </button>
          )}
          <div className="eyebrow"><span /> Hisobga kirish</div>
          <h2>Xush kelibsiz</h2>
          <p className="lede">
            Login va parolingizni kiriting. Demo hisoblardan birini tanlab tezda kirib ko&lsquo;rishingiz mumkin.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <div className="fields">
            <div className="field">
              <div className="field-inner">
                <label htmlFor="username">Login</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="field">
              <div className="field-inner">
                <label htmlFor="password">Parol</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          <div className="submit-row">
            <button type="submit" className="btn btn-primary btn-lg">
              Kirish
              <span className="arrow-orb" aria-hidden="true">→</span>
            </button>
          </div>

          {/* Demo account chips — copy on click */}
          <div className="demo-grid" aria-label="Demo hisoblar">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                type="button"
                key={acct.user}
                className="demo-chip"
                onClick={() => fillDemo(acct)}
                onDoubleClick={() => copyValue(acct.pass, acct.user)}
                title="Bir marta bosish — to'ldiradi, ikki marta — parolni nusxalaydi"
              >
                <span className="role">{acct.role}</span>
                <span className="user">{acct.user}</span>
                <span className="pwd">{copied === acct.user ? 'Nusxalandi' : acct.pass}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Decorative ruler/compass behind the form (subtle) */}
      <div className="art-layer" style={{ position: 'absolute', right: '4%', bottom: '4%', color: 'var(--ink-faint)', opacity: 0.10, pointerEvents: 'none' }} aria-hidden="true">
        <RulerCompass size={180} accent="var(--accent)" />
      </div>
    </div>
  );
}
