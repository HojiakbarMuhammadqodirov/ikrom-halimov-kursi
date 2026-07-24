// Small reusable UI helpers shared across panels.
// Header is rendered by each panel; the layout chrome (sticky fluid-island)
// is provided by the global stylesheet under `.floating-header`.

import React from 'react';
import { SUBJECTS } from '../data/seed.js';

// -------- Simple inline SVG icons for dashboard navigation --------

function IconSvg({ children, size = 48, viewBox = '0 0 48 48' }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconOverview({ size }) {
  return (
    <IconSvg size={size}>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <rect x="28" y="4" width="16" height="20" rx="2" />
      <rect x="4" y="24" width="16" height="20" rx="2" />
      <rect x="28" y="32" width="16" height="12" rx="2" />
    </IconSvg>
  );
}

export function IconStudents({ size }) {
  return (
    <IconSvg size={size}>
      <circle cx="18" cy="16" r="6" />
      <circle cx="36" cy="16" r="4" />
      <path d="M8 38c0-5.523 4.477-10 10-10s10 4.477 10 10" />
      <path d="M28 38c0-3.314 3.582-6 8-6s8 2.686 8 6" />
    </IconSvg>
  );
}

export function IconTeachers({ size }) {
  return (
    <IconSvg size={size}>
      <path d="M24 30c-4 0-8 1-8 4v2h16v-2c0-3-4-4-8-4z" />
      <circle cx="24" cy="18" r="6" />
      <path d="M6 14l18-6 18 6-18 6-18-6z" />
      <path d="M42 14v8" />
    </IconSvg>
  );
}

export function IconSettings({ size }) {
  return (
    <IconSvg size={size}>
      <circle cx="24" cy="24" r="4" />
      <path d="M24 4v4M24 40v4M4 24h4M40 24h4M9.86 9.86l2.83 2.83M35.31 35.31l2.83 2.83M9.86 38.14l2.83-2.83M35.31 12.69l2.83-2.83" />
    </IconSvg>
  );
}

export function IconAttendance({ size }) {
  return (
    <IconSvg size={size}>
      <rect x="6" y="6" width="36" height="36" rx="3" />
      <path d="M6 16h36M16 6v36" />
      <circle cx="24" cy="28" r="4" />
    </IconSvg>
  );
}

export function IconResults({ size }) {
  return (
    <IconSvg size={size}>
      <path d="M6 38l10-14 8 6 18-22" />
      <path d="M36 8h6v30H6V8h6" />
      <circle cx="16" cy="20" r="2" fill="currentColor" stroke="none" />
      <circle cx="30" cy="14" r="2" fill="currentColor" stroke="none" />
    </IconSvg>
  );
}

export function IconPayments({ size }) {
  return (
    <IconSvg size={size}>
      <rect x="4" y="10" width="40" height="28" rx="3" />
      <path d="M4 18h40" />
      <circle cx="24" cy="30" r="4" />
      <line x1="24" y1="26" x2="24" y2="34" />
      <line x1="20" y1="30" x2="28" y2="30" />
    </IconSvg>
  );
}

export function IconSubjects({ size }) {
  return (
    <IconSvg size={size}>
      <path d="M12 6v36M12 12h28v24H12M12 24h20" />
      <circle cx="24" cy="30" r="2" fill="currentColor" stroke="none" />
    </IconSvg>
  );
}

export function IconHome({ size }) {
  return (
    <IconSvg size={size}>
      <path d="M6 26l18-18 18 18" />
      <path d="M12 20v16h8v-8h8v8h8V20" />
    </IconSvg>
  );
}

export function IconTests({ size }) {
  return (
    <IconSvg size={size}>
      <rect x="8" y="4" width="32" height="40" rx="3" />
      <path d="M16 18l4 4 8-8M16 32l4 4 8-8" />
    </IconSvg>
  );
}

export function IconMaterials({ size }) {
  return (
    <IconSvg size={size}>
      <path d="M24 8L6 16v24l18-8 18 8V16L24 8z" />
      <path d="M24 8v24M6 16l18 8 18-8" />
    </IconSvg>
  );
}

export function IconPayment({ size }) {
  return (
    <IconSvg size={size}>
      <circle cx="24" cy="24" r="18" />
      <path d="M18 24h12M24 18v12" />
    </IconSvg>
  );
}

// -------- Dashboard Navigation Card --------

export function NavCard({ icon: Icon, title, subtitle, stat, foot, onClick, accent, delay = 0 }) {
  return (
    <button
      className="nav-card"
      onClick={onClick}
      style={{ '--card-accent': accent || 'var(--accent)', animationDelay: `${delay}ms` }}
    >
      <div className="nav-card-glow" aria-hidden="true" />
      <div className="nav-card-icon">
        {Icon && <Icon size={44} />}
      </div>
      <div className="nav-card-body">
        <div className="nav-card-title">{title}</div>
        {subtitle && <div className="nav-card-sub">{subtitle}</div>}
        <div className="nav-card-foot">
          {stat !== undefined && stat !== null && <span className="nav-card-stat">{stat}</span>}
          {foot && <span className="muted">{foot}</span>}
          <span className="nav-card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

// -------- Page Wrapper (for sub-pages with back navigation) --------

export function Page({ title, backLabel, onBack, children, wide = false }) {
  return (
    <div className="page-enter">
      <div className="page-top">
        <button className="btn btn-ghost" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
            <path d="M13 8H3M7 4l-4 4 4 4" />
          </svg>
          {backLabel || 'Dashboard'}
        </button>
        {title && <h1 className="page-title">{title}</h1>}
      </div>
      {children}
    </div>
  );
}

export function formatMoney(n) {
  return n.toLocaleString('uz-UZ') + ' so\'m';
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function daysUntil(iso) {
  const now = new Date();
  const target = new Date(iso);
  return Math.ceil((target - now) / 86400000);
}

export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Pill({ kind, children }) {
  return <span className={`pill pill-${kind}`}>{children}</span>;
}

export function SubjectChip({ subject, label }) {
  if (subject === 'all' || !subject) {
    return (
      <span className="subject-chip" data-subject="all">
        <span className="glyph">·</span>
        {label || 'Hammasi'}
      </span>
    );
  }
  const s = SUBJECTS[subject];
  if (!s) return null;
  return (
    <span className="subject-chip" data-subject={subject}>
      <span className="glyph">{s.glyph}</span>
      {label || s.label}
    </span>
  );
}

export function ProgressBar({ value, variant = 'accent', showPct = true }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className="progress-row">
      <div className="progress-bar" aria-hidden="true">
        <div className="progress-fill" data-variant={variant} style={{ width: v + '%' }} />
      </div>
      {showPct && <span className="pct">{v}%</span>}
    </div>
  );
}

export function Sparkline({ data, subject, width = 140, height = 32 }) {
  if (!data || data.length === 0) return <span className="muted">—</span>;
  const w = width, h = height;
  const max = 100, min = 0;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return [x, y];
  });
  const last = data[data.length - 1];
  const lastX = w;
  const lastY = h - ((last - min) / (max - min)) * h;
  const colorVar = subject === 'fizika' ? 'var(--fizika)'
                 : subject === 'matematika' ? 'var(--matem)'
                 : 'currentColor';
  return (
    <svg className="sparkline" data-subject={subject || ''} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label="Ball dinamikasi">
      <polyline fill="none" stroke={colorVar} strokeWidth="2" points={pts.map((p) => p.join(',')).join(' ')} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill={colorVar} />
      ))}
      <circle cx={lastX} cy={lastY} r="3.6" fill={colorVar} />
    </svg>
  );
}

/* =================================================================
   HEADER TIMER — live countdown for student header
   ================================================================= */

export function HeaderTimer({ nextTestDate, variant = 'pill' }) {
  const [display, setDisplay] = React.useState(() => calcTimer(nextTestDate));

  React.useEffect(() => {
    function tick() { setDisplay(calcTimer(nextTestDate)); }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [nextTestDate]);

  if (!nextTestDate || !display) return null;
  const expired = display.days <= 0 && display.hours <= 0 && display.minutes <= 0;
  const isUrgent = !expired && display.days <= 3;

  if (variant === 'hero') {
    if (expired) {
      return (
        <div className="hero-timer urgent">
          <span className="ht-dot" />
          <span className="ht-val urgent">Test vaqti!</span>
        </div>
      );
    }
    return (
      <div className={`hero-timer ${isUrgent ? 'urgent' : ''}`}>
        <span className="ht-dot" />
        <span className="ht-val">
          {display.days > 0 && <><em>{display.days}</em>k </>}
          {display.hours > 0 && <><em>{display.hours}</em>s </>}
          <em>{display.minutes}</em>m
        </span>
      </div>
    );
  }

  // Pill variant (default — for header)
  if (expired) {
    return (
      <div className="header-timer">
        <span className="timer-dot" />
        <span className="timer-val">Test vaqti!</span>
      </div>
    );
  }
  return (
    <div className="header-timer">
      <span className="timer-dot" />
      <span>Testga</span>
      <span className="timer-val">
        {display.days > 0 && `${display.days}k `}
        {display.hours > 0 && `${display.hours}s `}
        {display.minutes}m
      </span>
      <span>qoldi</span>
    </div>
  );
}

function calcTimer(nextTestDate) {
  try {
    const now = new Date();
    const target = new Date(nextTestDate);
    const ms = target - now;
    if (ms <= 0) return { days: 0, hours: 0, minutes: 0 };
    const totalMinutes = Math.floor(ms / 60000);
    return {
      days: Math.floor(totalMinutes / 1440),
      hours: Math.floor((totalMinutes % 1440) / 60),
      minutes: totalMinutes % 60,
    };
  } catch { return { days: 0, hours: 0, minutes: 0 }; }
}

export function EmptyState({ art: Art, title, hint }) {
  return (
    <div className="empty-state">
      {Art && <div className="empty-art"><Art size={140} /></div>}
      {title && <h3>{title}</h3>}
      {hint && <p>{hint}</p>}
    </div>
  );
}

export function Header({ title, user, onLogout, right, theme = 'light', onToggleTheme }) {
  return (
    <header className="floating-header">
      <div className="floating-header-inner">
        <div className="brand">
          <div className="brand-mark">I</div>
          {title}
        </div>
        <div className="role-pill">panel</div>
        {right}
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
          title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim'}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="10" cy="10" r="4" />
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.29 12.29A8 8 0 017.71 2.71 8 8 0 1017.29 12.29z" />
            </svg>
          )}
        </button>
        <div className="user-chip">
          <div className="user-avatar-sm">{initials(user?.fullName || user?.username)}</div>
          <span className="user-name">{user?.fullName || user?.username}</span>
        </div>
        <button className="logout-btn" onClick={onLogout} aria-label="Chiqish">Chiqish</button>
      </div>
    </header>
  );
}

export function Stat({ label, value, foot, eyebrow }) {
  return (
    <div className="stat">
      {eyebrow && <div className="stat-eyebrow">{eyebrow}</div>}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  );
}

export function Section({ title, action, children }) {
  return (
    <section className="card">
      {(title || action) && (
        <div className="card-title">
          {title && <h2>{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function ShellCard({ children, className, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`shell ${className || ''}`} {...rest}>
      <div className="card">{children}</div>
    </Tag>
  );
}

export function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-inner">
          {title && <h3>{title}</h3>}
          {children}
          {actions && <div className="modal-actions">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
