import React, { useMemo, useState } from 'react';
import {
  Header, Section, SubjectChip, ProgressBar, Sparkline, EmptyState, ShellCard, Modal,
  NavCard, Page,
  IconAttendance, IconResults, IconPayments, IconStudents,
  formatDate, formatMoney, daysUntil, Pill, initials,
} from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import StudentDetail from './StudentDetail.jsx';

export default function TeacherPanel({ state, setState, user, onLogout, theme, onToggleTheme }) {
  const [page, setPage] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  if (selectedStudentId) {
    const student = state.students.find((s) => s.id === selectedStudentId);
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title={student?.fullName} backLabel="Orqaga" onBack={() => setSelectedStudentId(null)}>
            <StudentDetail state={state} setState={setState} student={student} />
          </Page>
        </main>
      </div>
    );
  }

  // Sub-pages
  if (page === 'attendance') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Davomat" backLabel="Dashboard" onBack={() => setPage(null)}>
            <AttendanceTab state={state} setState={setState} onSelect={setSelectedStudentId} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'results') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Test natijalari" backLabel="Dashboard" onBack={() => setPage(null)}>
            <ResultsTab state={state} onSelect={setSelectedStudentId} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'payments') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Oylik to'lovlar" backLabel="Dashboard" onBack={() => setPage(null)}>
            <PaymentsTab state={state} setState={setState} onSelect={setSelectedStudentId} />
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
          <Page title="O'quvchilar bilan ishlash" backLabel="Dashboard" onBack={() => setPage(null)}>
            <StudentsTab state={state} setState={setState} onSelect={setSelectedStudentId} />
          </Page>
        </main>
      </div>
    );
  }

  // DASHBOARD
  const today = new Date().toISOString().slice(0, 10);
  const pendingAttendance = state.students.filter(
    (s) => !state.attendance.find((a) => a.studentId === s.id && a.date === today)
  ).length;
  const overduePayments = state.payments.filter((p) => p.status === 'overdue').length;
  const totalStudents = state.students.length;

  return (
    <div className="dashboard">
      <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="dashboard-hero">
        <div className="dash-role-badge">O'qituvchi paneli</div>
        <h1>Xush kelibsiz, {user.fullName}.</h1>
        <p className="dash-lede">
          O'quvchilar davomatini kuzatish, test natijalarini tahlil qilish va to'lovlarni boshqarish.
        </p>
      </div>

      <nav className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <NavCard
            icon={IconAttendance}
            title="Davomat"
            subtitle="Kunlik davomatni belgilash — kelgan, kechikkan va kelmagan o'quvchilar"
            stat={pendingAttendance > 0 ? `${pendingAttendance} ta` : 'Barchasi belgilandi'}
            foot={pendingAttendance > 0 ? 'belgilanmagan' : '✅'}
            onClick={() => setPage('attendance')}
            delay={80}
          />

          <NavCard
            icon={IconResults}
            title="Test natijalari"
            subtitle="So'nggi test natijalari, o'zgarish dinamikasi va o'rtacha ballar"
            stat={`${state.testResults.length} ta`}
            foot="barcha natijalar"
            onClick={() => setPage('results')}
            delay={160}
          />

          <NavCard
            icon={IconPayments}
            title="To'lovlar"
            subtitle="Oylik to'lovlarni qabul qilish va holatini kuzatish"
            stat={overduePayments > 0 ? `${overduePayments} ta qarzdor` : 'Barcha to\'langan'}
            foot={`${totalStudents} ta o'quvchi`}
            onClick={() => setPage('payments')}
            delay={240}
          />

          <NavCard
            icon={IconStudents}
            title="O'quvchilar"
            subtitle="Har bir o'quvchi holatini ko'rish va tezkor o'zgartirishlar kiritish"
            stat={`${totalStudents} ta`}
            foot="barcha o'quvchilar"
            onClick={() => setPage('students')}
            delay={320}
          />
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   ATTENDANCE — with real calendar
   Years & months via dropdowns, days as circular buttons in a row,
   today highlighted in terracotta, selected day filled.
   ============================================================ */
function AttendanceTab({ state, setState, onSelect }) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // year range: current year - 1  to  current year + 1
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
  ];

  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selDay, setSelDay] = useState(now.getDate());

  // Build days array for selected month
  const daysInMonth = useMemo(() => {
    const count = new Date(selYear, selMonth + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [selYear, selMonth]);

  // Safe day — auto-clamp if month change makes current day invalid (e.g. Jan 31 → Feb)
  const safeDay = Math.min(selDay, daysInMonth.length);

  // Selected date as ISO string
  const selectedDate = `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
  const isToday = selectedDate === todayStr;

  // --- attendance helpers ---
  function getRecord(studentId) {
    return state.attendance.find((a) => a.studentId === studentId && a.date === selectedDate);
  }

  function updateRecord(studentId, status, lateMinutes) {
    setState((s) => {
      const existing = s.attendance.find((a) => a.studentId === studentId && a.date === selectedDate);
      if (existing) {
        return { ...s, attendance: s.attendance.map((a) => a.id === existing.id ? { ...a, status, lateMinutes } : a) };
      }
      return { ...s, attendance: [...s.attendance, { id: 'a-' + studentId + '-' + Date.now(), studentId, date: selectedDate, status, lateMinutes }] };
    });
  }

  // Handle month/year change
  function changeMonth(newMonth) {
    setSelMonth(newMonth);
  }

  function changeYear(newYear) {
    setSelYear(newYear);
  }

  return (
    <Section title="">
      {/* -------- Calendar strip -------- */}
      <div className="cal-strip">
        <div className="cal-controls">
          <select
            className="input-inline cal-select"
            value={selYear}
            onChange={(e) => changeYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            className="input-inline cal-select"
            value={selMonth}
            onChange={(e) => changeMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>

        <div className="cal-days">
          {daysInMonth.map((d) => {
            const dateStr = `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isDayToday = dateStr === todayStr;
            const isSelected = d === safeDay;
            return (
              <button
                key={d}
                className={`cal-day ${isDayToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelDay(d)}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------- Attendance table for selected date -------- */}
      <div className="table-wrap" style={{ marginTop: 20 }}>
        <div className="cal-date-label">
          {formatDate(selectedDate)}
          {isToday && <span className="cal-today-badge">Bugun</span>}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th>Holat</th>
              <th>Kech qolish (daq.)</th>
              <th>20 kunlik davomat %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.students.map((s) => {
              const rec = getRecord(s.id);
              const records = state.attendance.filter((a) => a.studentId === s.id).slice(-20);
              const presentCount = records.filter((a) => a.status === 'present' || a.status === 'late').length;
              const rate = records.length === 0 ? 0 : Math.round((presentCount / records.length) * 100);
              return (
                <tr key={s.id}>
                  <td>
                    <a href="#" onClick={(e) => { e.preventDefault(); onSelect(s.id); }}>{s.fullName}</a>
                  </td>
                  <td>
                    <select
                      className="input-inline"
                      value={rec?.status || ''}
                      onChange={(e) => updateRecord(s.id, e.target.value, rec?.lateMinutes || 0)}
                    >
                      <option value="">— belgilanmagan —</option>
                      <option value="present">Keldi</option>
                      <option value="late">Kechikdi</option>
                      <option value="absent">Kelmadi</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input-inline"
                      type="number"
                      min="0"
                      max="120"
                      value={rec?.lateMinutes || 0}
                      onChange={(e) => updateRecord(s.id, rec?.status || 'late', Number(e.target.value))}
                      style={{ width: 80 }}
                      disabled={rec?.status !== 'late'}
                    />
                  </td>
                  <td>
                    <ProgressBar
                      value={rate}
                      variant={rate >= 80 ? 'ok' : rate >= 60 ? 'warn' : 'bad'}
                    />
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-sm" onClick={() => onSelect(s.id)}>Batafsil</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ============================================================
   RESULTS
   ============================================================ */
function ResultsTab({ state, onSelect }) {
  const [subjectFilter, setSubjectFilter] = useState('all');

  return (
    <Section
      title=""
      action={
        <div className="subject-filter" style={{ margin: 0 }}>
          <button className={subjectFilter === 'all' ? 'active' : ''} onClick={() => setSubjectFilter('all')}>Hammasi</button>
          {Object.entries(SUBJECTS).map(([sid, s]) => (
            <button key={sid} className={subjectFilter === sid ? 'active' : ''} onClick={() => setSubjectFilter(sid)}>
              {s.glyph} {s.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>O'quvchi</th>
              {subjectFilter === 'all' && <th>Fan</th>}
              <th>So'nggi 10 natija</th>
              <th className="num">Ohirgi ball</th>
              <th>O'zgarish</th>
              <th className="num">O'rtacha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.students.flatMap((s) => {
              const subjectsToShow = subjectFilter === 'all' ? Object.keys(SUBJECTS) : [subjectFilter];
              return subjectsToShow.map((sid) => {
                const results = state.testResults
                  .filter((r) => r.studentId === s.id && r.subject === sid)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .reverse();
                if (results.length === 0 && subjectFilter === 'all') return [<tr key={`${s.id}-${sid}-empty`} className="muted"><td>{s.fullName}</td><td><SubjectChip subject={sid} /></td><td colSpan={5} style={{ fontSize: 12 }}>Hali natija yo'q</td></tr>];
                if (results.length === 0) return [];
                const last = results[results.length - 1];
                const prev = results[results.length - 2];
                const delta = last && prev ? last.score - prev.score : 0;
                const avg = results.length === 0 ? 0 : Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
                return [(
                  <tr key={`${s.id}-${sid}`}>
                    <td>
                      <a href="#" onClick={(e) => { e.preventDefault(); onSelect(s.id); }}>{s.fullName}</a>
                    </td>
                    {subjectFilter === 'all' && <td><SubjectChip subject={sid} /></td>}
                    <td><Sparkline data={results.map((r) => r.score)} subject={sid} /></td>
                    <td className="num">{last ? last.score + '%' : '—'}</td>
                    <td>
                      {delta > 0 && <Pill kind="up">▲ +{delta}</Pill>}
                      {delta < 0 && <Pill kind="down">▼ {delta}</Pill>}
                      {delta === 0 && <Pill kind="flat">— 0</Pill>}
                    </td>
                    <td className="num">{avg}%</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-sm" onClick={() => onSelect(s.id)}>Batafsil</button>
                      </div>
                    </td>
                  </tr>
                )];
              }).flat();
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ============================================================
   PAYMENTS
   ============================================================ */
function PaymentsTab({ state, setState, onSelect }) {
  const [confirmId, setConfirmId] = useState(null);

  function markPaid(studentId) {
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      payments: s.payments.map((p) => p.studentId === studentId ? {
        ...p,
        lastPaid: today,
        nextDue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'paid',
        history: [{ date: today, amount: p.monthlyFee }, ...p.history],
      } : p),
    }));
  }

  const target = confirmId ? state.payments.find((p) => p.studentId === confirmId) : null;
  const targetStudent = target ? state.students.find((s) => s.id === target.studentId) : null;

  return (
    <Section title="">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>O'quvchi</th>
              <th className="num">Oylik summa</th>
              <th>So'nggi to'lov</th>
              <th>Keyingi to'lov</th>
              <th>Qolgan kun</th>
              <th>Holat</th>
              <th colSpan="2">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {state.students.map((s) => {
              const p = state.payments.find((x) => x.studentId === s.id);
              if (!p) return null;
              const left = daysUntil(p.nextDue);
              return (
                <tr key={s.id}>
                  <td>
                    <a href="#" onClick={(e) => { e.preventDefault(); onSelect(s.id); }}>{s.fullName}</a>
                  </td>
                  <td className="num">{formatMoney(p.monthlyFee)}</td>
                  <td>{formatDate(p.lastPaid)}</td>
                  <td>{formatDate(p.nextDue)}</td>
                  <td>{left >= 0 ? left + ' kun' : Math.abs(left) + ' kun kechikdi'}</td>
                  <td>
                    <Pill kind={p.status}>{p.status === 'paid' ? "To'langan" : p.status === 'due_soon' ? 'Yaqin orada' : "Muddati o'tgan"}</Pill>
                  </td>
                  <td colSpan="2">
                    <div className="td-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => setConfirmId(s.id)}>To'landi</button>
                      <button className="btn btn-sm" onClick={() => onSelect(s.id)}>Batafsil</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!target}
        onClose={() => setConfirmId(null)}
        title="To'lovni tasdiqlash"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Bekor qilish</button>
            <button className="btn btn-primary" onClick={() => { markPaid(confirmId); setConfirmId(null); }}>
              Tasdiqlash
              <span className="arrow-orb" aria-hidden="true">✓</span>
            </button>
          </>
        }
      >
        {target && targetStudent && (
          <p>
            <b>{targetStudent.fullName}</b> uchun <b>{formatMoney(target.monthlyFee)}</b> miqdorida
            oylik to'lov qabul qilinsinmi? Yangi to'lov sanasi bugungi sana bilan belgilanadi.
          </p>
        )}
      </Modal>
    </Section>
  );
}

/* ============================================================
   STUDENTS
   Interactive student cards — teachers can manage attendance,
   payments, and lates inline.
   ============================================================ */
function StudentsTab({ state, setState, onSelect }) {
  if (!state || !Array.isArray(state.students)) {
    return <div className="stud-cards" />;
  }

  const today = new Date().toISOString().slice(0, 10);
  const [payId, setPayId] = useState(null);
  const [closedIds, setClosedIds] = useState(new Set());

  const att = Array.isArray(state.attendance) ? state.attendance : [];
  const tResults = Array.isArray(state.testResults) ? state.testResults : [];
  const pays = Array.isArray(state.payments) ? state.payments : [];

  // ---------- attendance helpers ----------
  function todayFor(studentId) {
    return att.find((a) => a.studentId === studentId && a.date === today);
  }

  function setAttendance(studentId, status, lateMinutes) {
    setState((s) => {
      const arr = Array.isArray(s.attendance) ? s.attendance : [];
      const existing = arr.find((a) => a.studentId === studentId && a.date === today);
      if (existing) {
        return { ...s, attendance: arr.map((a) => a.id === existing.id ? { ...a, status, lateMinutes } : a) };
      }
      return { ...s, attendance: [...arr, { id: 'a-' + studentId + '-' + Date.now(), studentId, date: today, status, lateMinutes }] };
    });
  }

  // ---------- payment helpers ----------
  function markPaid(studentId) {
    const todayStr = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      payments: (s.payments || []).map((p) => p.studentId === studentId ? {
        ...p,
        lastPaid: todayStr,
        nextDue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'paid',
        history: [{ date: todayStr, amount: p.monthlyFee }, ...(p.history || [])],
      } : p),
    }));
    setPayId(null);
  }

  const targetPay = payId ? pays.find((p) => p.studentId === payId) : null;
  const targetStudent = targetPay ? state.students.find((s) => s.id === targetPay.studentId) : null;

  // ---------- compute stats per student ----------
  const studentStats = state.students.map((s) => {
    const attRecords = att.filter((a) => a.studentId === s.id);
    const recentAtt = attRecords.slice(-20);
    const presentCount = recentAtt.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attRate = recentAtt.length === 0 ? 0 : Math.round((presentCount / recentAtt.length) * 100);

    const subjectResults = tResults.filter((r) => r.studentId === s.id);
    const lastBySub = {};
    subjectResults.forEach((r) => {
      if (r && r.subject && r.date) {
        if (!lastBySub[r.subject] || new Date(r.date) > new Date(lastBySub[r.subject].date)) {
          lastBySub[r.subject] = r;
        }
      }
    });
    const avgBySub = {};
    subjectResults.forEach((r) => {
      if (r && r.subject && r.score != null) {
        if (!avgBySub[r.subject]) avgBySub[r.subject] = { sum: 0, count: 0 };
        avgBySub[r.subject].sum += r.score;
        avgBySub[r.subject].count += 1;
      }
    });

    const pay = pays.find((p) => p.studentId === s.id);
    const payDays = pay && pay.nextDue ? daysUntil(pay.nextDue) : null;

    return { s, attRate, lastBySub, avgBySub, pay, payDays };
  });

  const sorted = [...studentStats].sort((a, b) => {
    if (!a || !b || !a.s || !b.s) return 0;
    const aOverdue = a.pay?.status === 'overdue' ? 1 : 0;
    const bOverdue = b.pay?.status === 'overdue' ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    return (a.attRate || 0) - (b.attRate || 0);
  });

  return (
    <div className="stud-cards">
      {sorted.length === 0 && (
        <div className="empty-state" style={{ padding: '32px 20px' }}>
          <h3>O'quvchilar yo'q</h3>
          <p>Hozircha hech qanday o'quvchi qo'shilmagan.</p>
        </div>
      )}
      {sorted.map((item) => {
        if (!item || !item.s) return null;
        const { s, attRate, lastBySub, avgBySub, pay, payDays } = item;
        const t = todayFor(s.id);
        const isClosed = closedIds.has(s.id);
        const avgAll = avgBySub ? Object.values(avgBySub) : [];
        const overallAvg = avgAll.length === 0 ? 0
          : Math.round(avgAll.reduce((a, b) => a + (b && b.sum != null ? Math.round(b.sum / b.count) : 0), 0) / avgAll.length);

        return (
          <div key={s.id} className={`stud-card ${isClosed ? 'collapsed' : ''}`}>
            <div className="stud-card-head" onClick={() => {
              if (isClosed) setClosedIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
              else setClosedIds((prev) => { const n = new Set(prev); n.add(s.id); return n; });
            }}>
              <div className="stud-avatar">{initials(s.fullName)}</div>
              <div className="stud-meta">
                <div className="stud-name">{s.fullName}</div>
                <div className="stud-sub">{s.phone || ''}</div>
              </div>
              <div className="stud-badges">
                <span className={`stud-badge ${attRate >= 80 ? 'green' : attRate >= 60 ? 'amber' : 'red'}`}>
                  {attRate}%
                </span>
                {pay && pay.status && (
                  <span className={`stud-badge ${pay.status === 'paid' ? 'green' : pay.status === 'due_soon' ? 'amber' : 'red'}`}>
                    {pay.status === 'paid' ? "To'langan" : pay.status === 'due_soon' ? 'Yaqin' : 'Qarzdor'}
                  </span>
                )}
              </div>
              <svg className={`stud-chevron ${isClosed ? '' : 'open'}`} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 12l3-3 3 3" /></svg>
            </div>

            <div className="stud-card-body">
              <div className="stud-row">
                <label className="stud-label">Davomat (bugun)</label>
                <div className="stud-inline-group">
                  <select
                    className="input-inline"
                    value={(t && t.status) || ''}
                    onChange={(e) => setAttendance(s.id, e.target.value, (t && t.lateMinutes) || 0)}
                  >
                    <option value="">— belgilanmagan —</option>
                    <option value="present">Keldi</option>
                    <option value="late">Kechikdi</option>
                    <option value="absent">Kelmadi</option>
                  </select>
                  <input
                    className="input-inline"
                    type="number"
                    min="0"
                    max="120"
                    value={(t && t.lateMinutes) || 0}
                    onChange={(e) => setAttendance(s.id, (t && t.status) || 'late', Number(e.target.value))}
                    style={{ width: 70 }}
                    disabled={!t || t.status !== 'late'}
                    placeholder="daq."
                  />
                </div>
              </div>

              <div className="stud-row">
                <label className="stud-label">To'lov</label>
                <div className="stud-inline-group">
                  <span className="stud-pay-info">
                    {pay ? `${formatMoney(p.monthlyFee)}` : '—'}
                    {payDays !== null && payDays !== undefined && !isNaN(payDays) && (
                      <span className="muted" style={{ marginLeft: 6, fontSize: 11 }}>
                        {payDays >= 0 ? `${payDays} kun qoldi` : `${Math.abs(payDays)} kun kechikdi`}
                      </span>
                    )}
                  </span>
                  <button className="btn btn-sm btn-primary" onClick={() => setPayId(s.id)}>
                    To'landi
                  </button>
                </div>
              </div>

              <div className="stud-row">
                <label className="stud-label">O'rtacha ball</label>
                <div className="stud-inline-group">
                  <span className="stud-score">{isNaN(overallAvg) ? 0 : overallAvg}%</span>
                  <div className="stud-subjects">
                    {lastBySub && Object.entries(lastBySub).map(([sid, r]) => (
                      <span key={sid} className="stud-subj">
                        <SubjectChip subject={sid} />
                        {' '}{r && r.score ? r.score : 0}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="stud-row stud-actions">
                <button className="btn btn-sm" onClick={() => onSelect(s.id)}>
                  Batafsil ko'rish
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <Modal
        open={!!targetPay}
        onClose={() => setPayId(null)}
        title="To'lovni tasdiqlash"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setPayId(null)}>Bekor qilish</button>
            <button className="btn btn-primary" onClick={() => markPaid(payId)}>
              Tasdiqlash
              <span className="arrow-orb" aria-hidden="true">✓</span>
            </button>
          </>
        }
      >
        {targetPay && targetStudent && (
          <p>
            <b>{targetStudent.fullName}</b> uchun <b>{formatMoney(targetPay.monthlyFee)}</b> miqdorida
            oylik to'lov qabul qilinsinmi?
          </p>
        )}
      </Modal>
    </div>
  );
}
