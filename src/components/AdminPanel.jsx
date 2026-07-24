import React, { useMemo, useState } from 'react';
import {
  Header, Section, SubjectChip, ShellCard, ProgressBar, Sparkline, EmptyState, Pill, Modal,
  NavCard, Page,
  IconOverview, IconStudents, IconTeachers, IconSettings,
  formatMoney, formatDate, initials,
} from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import StudentDetail from './StudentDetail.jsx';
import { updateUserPassword } from '../lib/auth.js';
import { RulerCompass, Blackboard } from './SubjectArt.jsx';

export default function AdminPanel({ state, setState, user, onLogout, theme, onToggleTheme }) {
  const [page, setPage] = useState(null);
  const [viewStudentId, setViewStudentId] = useState(null);

  // If viewing a specific student from any page
  if (viewStudentId) {
    const student = state.students.find((s) => s.id === viewStudentId);
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title={student?.fullName} backLabel="Orqaga" onBack={() => setViewStudentId(null)}>
            <StudentDetail state={state} setState={setState} student={student} readOnly={false} />
          </Page>
        </main>
      </div>
    );
  }

  // Sub-pages
  if (page === 'overview') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Umumiy ko'rinish" backLabel="Dashboard" onBack={() => setPage(null)}>
            <Overview state={state} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'students') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="O'quvchilar" backLabel="Dashboard" onBack={() => setPage(null)}>
            <StudentsTab state={state} setState={setState} onView={(id) => setViewStudentId(id)} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'teachers') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="O'qituvchilar" backLabel="Dashboard" onBack={() => setPage(null)}>
            <TeachersTab state={state} setState={setState} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'settings') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Kurs sozlamalari" backLabel="Dashboard" onBack={() => setPage(null)}>
            <SettingsTab state={state} setState={setState} />
          </Page>
        </main>
      </div>
    );
  }

  // DASHBOARD
  const stats = useMemo(() => {
    const collectedThisMonth = state.payments
      .filter((p) => {
        const d = new Date(p.lastPaid);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const totalTests = state.testResults.length;
    const avgScore = totalTests === 0 ? 0
      : Math.round(state.testResults.reduce((s, r) => s + r.score, 0) / totalTests);
    return {
      students: state.students.length,
      teachers: state.users.filter((u) => u.role === 'teacher').length,
      tests: totalTests,
      collected: collectedThisMonth,
      avgScore,
    };
  }, [state]);

  const overdue = state.payments.filter((p) => p.status === 'overdue').length;

  return (
    <div className="dashboard">
      <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="dashboard-hero">
        <div className="dash-role-badge">Administrator paneli</div>
        <h1>Xush kelibsiz, {user.fullName}.</h1>
        <p className="dash-lede">
          Kursni boshqarish — o'quvchilar, o'qituvchilar, to'lovlar va test natijalari.
        </p>
      </div>

      <nav className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <NavCard
            icon={IconOverview}
            title="Umumiy ko'rinish"
            subtitle="Statistika, tushum, fanlar holati va test o'rtacha ballari"
            stat={`${stats.avgScore}%`}
            foot={`${stats.tests} ta test`}
            onClick={() => setPage('overview')}
            delay={80}
          />

          <NavCard
            icon={IconStudents}
            title="O'quvchilar"
            subtitle="Barcha o'quvchilar ro'yxati, qo'shish, o'chirish va parolni tiklash"
            stat={stats.students}
            foot={overdue > 0 ? `${overdue} ta qarzdor` : 'barcha to\'lovlar tartibda'}
            onClick={() => setPage('students')}
            delay={160}
          />

          <NavCard
            icon={IconTeachers}
            title="O'qituvchilar"
            subtitle="O'qituvchilar ro'yxati va ularni boshqarish"
            stat={stats.teachers}
            foot="Fizika & Matematika"
            onClick={() => setPage('teachers')}
            delay={240}
          />

          <NavCard
            icon={IconSettings}
            title="Sozlamalar"
            subtitle="Kurs nomi, oylik to'lov miqdori va test sanalarini o'zgartirish"
            foot={formatMoney(state.settings.monthlyFee)}
            onClick={() => setPage('settings')}
            delay={320}
          />
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   OVERVIEW
   ============================================================ */
function Overview({ state }) {
  const totalTests = state.testResults.length;
  const avgScore = totalTests === 0 ? 0
    : Math.round(state.testResults.reduce((s, r) => s + r.score, 0) / totalTests);
  const collectedThisMonth = state.payments
    .filter((p) => {
      const d = new Date(p.lastPaid);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.monthlyFee, 0);

  const overdue = state.payments.filter((p) => p.status === 'overdue');
  const dueSoon = state.payments.filter((p) => p.status === 'due_soon');

  return (
    <div className="bento">
      <ShellCard className="span-4">
        <div className="stat-label">O'quvchilar</div>
        <div className="stat-value">{state.students.length}</div>
        <div className="stat-foot"><span className="muted">faol</span></div>
      </ShellCard>

      <ShellCard className="span-4">
        <div className="stat-label">O'qituvchilar</div>
        <div className="stat-value">{state.users.filter((u) => u.role === 'teacher').length}</div>
        <div className="stat-foot"><span className="muted">{SUBJECTS.fizika.label} &amp; {SUBJECTS.matematika.label}</span></div>
      </ShellCard>

      <ShellCard className="span-4">
        <div className="stat-label">Jami testlar</div>
        <div className="stat-value">{totalTests}</div>
        <div className="stat-foot"><span className="muted">{state.students.length} o'quvchi × 2 fan × 10 urinish</span></div>
      </ShellCard>

      <ShellCard className="span-6">
        <div className="stat-label">O'rtacha ball</div>
        <div className="stat-value" style={{ color: avgScore >= 70 ? 'var(--ok)' : avgScore >= 50 ? 'var(--warn)' : 'var(--bad)' }}>
          {avgScore}%
        </div>
        <div className="stat-foot"><span className="muted">barcha testlar bo'yicha</span></div>
      </ShellCard>

      <ShellCard className="span-6 tall">
        <div className="card-title">
          <h2>Bu oy tushum</h2>
          <span className="meta">{new Date().toLocaleDateString('uz-UZ', { month: 'long' })}</span>
        </div>
        <div className="stat-value" style={{ marginBottom: 14 }}>{formatMoney(collectedThisMonth)}</div>
        <ProgressBar
          value={Math.min(100, Math.round((collectedThisMonth / (state.settings.monthlyFee * state.students.length)) * 100))}
          variant="accent"
        />
        <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
          Imkoniyat: {formatMoney(state.settings.monthlyFee * state.students.length)} (100% yig'ilgan holda).
        </div>
      </ShellCard>

      <ShellCard className="span-7">
        <div className="card-title">
          <h2>To'lov e'tibori</h2>
          <span className="meta">{overdue.length + dueSoon.length} ta o'quvchi</span>
        </div>
        {overdue.length === 0 && dueSoon.length === 0 ? (
          <div className="success-banner" style={{ marginBottom: 0 }}>Barcha to'lovlar holati yaxshi.</div>
        ) : (
          <div>
            {overdue.map((p) => {
              const s = state.students.find((x) => x.id === p.studentId);
              return (
                <div className="fine-row" key={p.id}>
                  <div className="who">
                    <div className="name">{s?.fullName}</div>
                    <div className="sub">Muddati o'tgan · {formatDate(p.nextDue)}</div>
                  </div>
                  <Pill kind="overdue">Muddati o'tgan</Pill>
                  <div className="amount">{formatMoney(p.monthlyFee)}</div>
                </div>
              );
            })}
            {dueSoon.map((p) => {
              const s = state.students.find((x) => x.id === p.studentId);
              return (
                <div className="fine-row" key={p.id}>
                  <div className="who">
                    <div className="name">{s?.fullName}</div>
                    <div className="sub">Yaqin orada · {formatDate(p.nextDue)}</div>
                  </div>
                  <Pill kind="due">Yaqin orada</Pill>
                  <div className="amount">{formatMoney(p.monthlyFee)}</div>
                </div>
              );
            })}
          </div>
        )}
      </ShellCard>

      <ShellCard className="span-5">
        <div className="card-title">
          <h2>Fanlar holati</h2>
        </div>
        {Object.entries(SUBJECTS).map(([sid, s]) => {
          const cohortResults = state.testResults.filter((r) => r.subject === sid);
          const avg = cohortResults.length === 0 ? 0 : Math.round(cohortResults.reduce((sum, r) => sum + r.score, 0) / cohortResults.length);
          return (
            <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
              <SubjectChip subject={sid} />
              <div style={{ flex: 1 }}>
                <ProgressBar value={avg} variant={avg >= 70 ? 'ok' : avg >= 50 ? 'warn' : 'bad'} />
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, letterSpacing: '-0.02em', minWidth: 56, textAlign: 'right' }}>{avg}%</div>
            </div>
          );
        })}
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--ink-faint)', marginTop: 14 }}>
          <RulerCompass size={100} accent="var(--accent)" />
        </div>
      </ShellCard>
    </div>
  );
}

/* ============================================================
   STUDENTS
   ============================================================ */
function StudentsTab({ state, setState, onView }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');

  const students = Array.isArray(state?.students) ? state.students : [];
  const visible = filter === 'all' ? students : students.filter((s) => (s.subjects || []).includes(filter));

  function removeStudent(id) {
    setState((s) => ({
      ...s,
      students: s.students.filter((x) => x.id !== id),
      users: s.users.filter((u) => u.id !== id),
    }));
  }

  function resetPassword(student) {
    const np = prompt(`Yangi parol (${student.username}):`, student.username + '2026');
    if (!np) return;
    updateUserPassword(student.id, np);
    setState((s) => ({
      ...s,
      users: s.users.map((u) => u.id === student.id ? { ...u, password: np } : u),
    }));
    alert('Parol yangilandi');
  }

  return (
    <Section
      title=""
      action={
        <div className="row-end">
          <div className="subject-filter" style={{ margin: 0 }}>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Hammasi</button>
            {Object.entries(SUBJECTS).map(([sid, s]) => (
              <button key={sid} className={filter === sid ? 'active' : ''} onClick={() => setFilter(sid)}>{s.glyph}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? 'Yopish' : '+ Yangi o\'quvchi'}
          </button>
        </div>
      }
    >
      {showAdd && <AddStudentForm setState={setState} onDone={() => setShowAdd(false)} />}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>F.I.Sh.</th>
              <th>Login</th>
              <th>Telefon</th>
              <th>Fanlar</th>
              <th>Parol</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td><a href="#" onClick={(e) => { e.preventDefault(); onView(s.id); }}>{s.fullName}</a></td>
                <td><code className="mono">{s.username}</code></td>
                <td>{s.phone || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(s.subjects || []).map((sid) => <SubjectChip key={sid} subject={sid} />)}
                  </div>
                </td>
                <td><code className="mono" style={{ fontSize: 11 }}>{s.password}</code></td>
                <td className="text-right">
                  <div className="td-actions">
                    <button className="btn btn-sm" onClick={() => onView(s.id)}>Ko'rish</button>
                    <button className="btn btn-sm" onClick={() => resetPassword(s)}>Parol</button>
                    <button className="btn btn-sm btn-danger" onClick={() => removeStudent(s.id)}>O'chirish</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function AddStudentForm({ setState, onDone }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [subjects, setSubjects] = useState(['fizika', 'matematika']);
  const [error, setError] = useState('');

  function toggleSubject(sid) {
    setSubjects((arr) => arr.includes(sid) ? arr.filter((x) => x !== sid) : [...arr, sid]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) { setError('Ism va login kerak'); return; }
    if (subjects.length === 0) { setError('Kamida bitta fan tanlang'); return; }
    setState((s) => {
      if (s.users.some((u) => u.username === username)) { setError('Bu login band'); return s; }
      const id = 's-' + Date.now();
      const student = { id, role: 'student', fullName: fullName.trim(), username: username.trim(), phone: phone.trim(), password: username.trim() + '2026', subjects };
      return {
        ...s,
        students: [...s.students, student],
        users: [...s.users, student],
        payments: [...s.payments, {
          id: 'p-' + id,
          studentId: id,
          monthlyFee: s.settings.monthlyFee,
          lastPaid: new Date().toISOString().slice(0, 10),
          nextDue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'paid',
          history: [{ date: new Date().toISOString().slice(0, 10), amount: s.settings.monthlyFee }],
        }],
      };
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="shell" style={{ marginBottom: 18 }}>
      <div className="card">
        {error && <div className="error-banner" style={{ marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div className="field">
            <div className="field-inner">
              <label>F.I.Sh.</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="field-inner">
              <label>Login</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="field-inner">
              <label>Telefon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Fanlar</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(SUBJECTS).map(([sid, s]) => (
              <label key={sid} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={subjects.includes(sid)}
                  onChange={() => toggleSubject(sid)}
                  style={{ accentColor: s.accent }}
                />
                <SubjectChip subject={sid} />
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Saqlash</button>
      </div>
    </form>
  );
}

/* ============================================================
   TEACHERS
   ============================================================ */
function TeachersTab({ state, setState }) {
  const teachers = state.users.filter((u) => u.role === 'teacher');
  const [showAdd, setShowAdd] = useState(false);

  function removeTeacher(id) {
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
  }

  return (
    <Section
      title=""
      action={<button className="btn btn-primary btn-sm" onClick={() => setShowAdd((v) => !v)}>{showAdd ? 'Yopish' : '+ Yangi o\'qituvchi'}</button>}
    >
      {showAdd && <AddTeacherForm setState={setState} onDone={() => setShowAdd(false)} />}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>F.I.Sh.</th>
              <th>Login</th>
              <th>Fan</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, borderRadius: 12 }}>{initials(t.fullName)}</div>
                    {t.fullName}
                  </div>
                </td>
                <td><code className="mono">{t.username}</code></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Object.entries(SUBJECTS).map(([sid, s]) => <SubjectChip key={sid} subject={sid} />)}
                  </div>
                </td>
                <td className="text-right">
                  <div className="td-actions">
                    <button className="btn btn-sm btn-danger" onClick={() => removeTeacher(t.id)}>O'chirish</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function AddTeacherForm({ setState, onDone }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName || !username || !password) { setError('Barcha maydonlar kerak'); return; }
    setState((s) => {
      if (s.users.some((u) => u.username === username)) { setError('Bu login band'); return s; }
      return {
        ...s,
        users: [...s.users, { id: 'u-t-' + Date.now(), role: 'teacher', fullName, username, password, subject: 'Fizika & Matematika' }],
      };
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="shell" style={{ marginBottom: 18 }}>
      <div className="card">
        {error && <div className="error-banner" style={{ marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div className="field">
            <div className="field-inner">
              <label>F.I.Sh.</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="field-inner">
              <label>Login</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="field-inner">
              <label>Parol</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Saqlash</button>
      </div>
    </form>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */
function SettingsTab({ state, setState }) {
  const [fee, setFee] = useState(state.settings.monthlyFee);
  const [nextTest, setNextTest] = useState(state.settings.nextTestDate.slice(0, 10));

  function save() {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, monthlyFee: Number(fee), nextTestDate: new Date(nextTest).toISOString() },
    }));
    alert('Sozlamalar saqlandi');
  }

  return (
    <Section title="" action={<button className="btn btn-primary" onClick={save}>Saqlash</button>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="field">
          <div className="field-inner">
            <label>Oylik to'lov (so'm)</label>
            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <div className="field-inner">
            <label>Keyingi test sanasi</label>
            <input type="date" value={nextTest} onChange={(e) => setNextTest(e.target.value)} />
          </div>
        </div>
      </div>
    </Section>
  );
}
