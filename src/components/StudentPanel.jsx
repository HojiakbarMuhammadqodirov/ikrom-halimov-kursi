import React, { useEffect, useMemo, useState } from 'react';
import {
  Header, Section, Sparkline, ProgressBar, SubjectChip, EmptyState, ShellCard,
  NavCard, Page, HeaderTimer,
  IconHome, IconTests, IconMaterials, IconPayment,
  formatDate, formatMoney, daysUntil, Pill, initials,
} from './shared.jsx';
import { SUBJECTS } from '../data/seed.js';
import TestRunner from './TestRunner.jsx';
import { Pythagorean, AtomOrbit, Blackboard } from './SubjectArt.jsx';

export default function StudentPanel({ state, setState, user, onLogout, theme, onToggleTheme }) {
  const student = state.students.find((s) => s.id === user.id);
  const [page, setPage] = useState(null);
  const [runningTestId, setRunningTestId] = useState(null);

  // Hourly tick so the countdown stays accurate.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const nextTest = state.settings.nextTestDate;
  const days = useMemo(() => {
    const ms = new Date(nextTest) - now;
    return Math.max(0, Math.ceil(ms / 86400000));
  }, [nextTest, now]);
  const hours = useMemo(() => {
    const ms = new Date(nextTest) - now;
    return Math.max(0, Math.floor((ms % 86400000) / 3600000));
  }, [nextTest, now]);

  const payment = state.payments.find((p) => p.studentId === student.id);
  const myResults = useMemo(
    () => state.testResults
      .filter((r) => r.studentId === student.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.testResults, student.id]
  );

  const perSubjectAvg = useMemo(() => {
    const out = {};
    Object.keys(SUBJECTS).forEach((sid) => {
      const rs = myResults.filter((r) => r.subject === sid);
      out[sid] = rs.length === 0 ? null : Math.round(rs.reduce((s, r) => s + r.score, 0) / rs.length);
    });
    return out;
  }, [myResults]);

  const avg = myResults.length === 0 ? 0 : Math.round(myResults.reduce((s, r) => s + r.score, 0) / myResults.length);

  const attendance = state.attendance.filter((a) => a.studentId === student.id);
  const attRate = attendance.length === 0 ? 0
    : Math.round((attendance.filter((a) => a.status === 'present' || a.status === 'late').length / attendance.length) * 100);

  if (runningTestId) {
    const t = state.tests.find((x) => x.id === runningTestId);
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <button className="btn btn-ghost" onClick={() => setRunningTestId(null)}>← Testlarga qaytish</button>
          <TestRunner
            state={state}
            setState={setState}
            test={t}
            student={student}
            onDone={() => setRunningTestId(null)}
          />
        </main>
      </div>
    );
  }

  // Sub-pages
  if (page === 'home') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Bosh sahifa" backLabel="Dashboard" onBack={() => setPage(null)}>
            <HomeContent
              student={student}
              myResults={myResults}
              perSubjectAvg={perSubjectAvg}
              avg={avg}
              attRate={attRate}
              state={state}
              payment={payment}
              nextTest={nextTest}
              days={days}
              hours={hours}
            />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'tests') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="Testlar" backLabel="Dashboard" onBack={() => setPage(null)}>
            <TestsContent tests={state.tests} onStart={(id) => setRunningTestId(id)} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'materials') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="O'quv materiallari" backLabel="Dashboard" onBack={() => setPage(null)}>
            <MaterialsContent materials={state.materials} />
          </Page>
        </main>
      </div>
    );
  }

  if (page === 'payment') {
    return (
      <div className="dashboard">
        <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="main">
          <Page title="To'lov ma'lumotlari" backLabel="Dashboard" onBack={() => setPage(null)}>
            <PaymentContent payment={payment} />
          </Page>
        </main>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="dashboard">
      <Header title={state.settings.courseName} user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="dashboard-hero">
        <div className="dash-role-badge">O'quvchi paneli</div>
        <div className="hero-title-row">
          <h1>Salom, {student.fullName.split(' ')[0]}.</h1>
          <HeaderTimer nextTestDate={nextTest} variant="hero" />
        </div>
        <p className="dash-lede">
          O'rtacha ballingiz <strong>{avg}%</strong> · Davomatingiz <strong>{attRate}%</strong>.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {(student.subjects || ['fizika', 'matematika']).map((sid) => (
            <SubjectChip key={sid} subject={sid} />
          ))}
        </div>
      </div>

      <nav className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <NavCard
            icon={IconHome}
            title="Bosh sahifa"
            subtitle="Shaxsiy statistika, test natijalari va davomat ko'rsatkichlari"
            stat={`${avg}%`}
            foot={`${myResults.length} ta test`}
            onClick={() => setPage('home')}
            delay={80}
          />

          <NavCard
            icon={IconTests}
            title="Testlar"
            subtitle="Fizika va matematika fanlaridan test topshirish"
            stat={`${state.tests.length} ta test`}
            foot="20 daqiqa"
            onClick={() => setPage('tests')}
            delay={160}
          />

          <NavCard
            icon={IconMaterials}
            title="Materiallar"
            subtitle="O'quv materiallari, formulalar va masalalar to'plami"
            stat={`${state.materials.length} ta`}
            foot="PDF formatda"
            onClick={() => setPage('materials')}
            delay={240}
          />

          <NavCard
            icon={IconPayment}
            title="To'lov"
            subtitle="Oylik to'lov holati, oxirgi va keyingi to'lov sanalari"
            stat={payment ? formatMoney(payment.monthlyFee) : '—'}
            foot={payment?.status === 'paid' ? "To'langan" : payment?.status === 'due_soon' ? 'Yaqin orada' : "Muddati o'tgan"}
            onClick={() => setPage('payment')}
            delay={320}
          />
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   HOME CONTENT
   ============================================================ */
function HomeContent({ student, myResults, perSubjectAvg, avg, attRate, state, payment, nextTest, days, hours }) {
  const last5 = myResults.slice(0, 5);

  return (
    <>
      {/* Countdown */}
      <div className={`countdown ${days <= 7 ? 'urgent' : ''}`} style={{ marginBottom: 24 }}>
        <div>
          <div className="label">Keyingi testgacha</div>
          <div className="time">{days} <em>kun</em> {hours} <em>soat</em></div>
        </div>
        <div className="when">
          <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244, 241, 236, 0.55)' }}>Sana</span>
          <b>{formatDate(nextTest)}</b>
        </div>
        <div className="corner-art"><AtomOrbit size={120} accent="currentColor" /></div>
      </div>

      <div className="bento">
        {/* Hero stat — overall avg */}
        <ShellCard className="span-7 tall">
          <div className="card-title">
            <h2>Umumiy natija</h2>
            <span className="meta">{myResults.length} ta test</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 22 }}>
            <div style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(56px, 7vw, 96px)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontVariationSettings: '"opsz" 144',
              color: 'var(--ink)',
            }}>{avg}%</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 14, maxWidth: '24ch', lineHeight: 1.5 }}>
              Barcha topshirilgan testlar bo'yicha o'rtacha ball.
            </div>
          </div>

          <div className="divider" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(SUBJECTS).map(([sid, s]) => {
              const v = perSubjectAvg[sid];
              return (
                <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 96, flexShrink: 0 }}><SubjectChip subject={sid} /></div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar
                      value={v === null ? 0 : v}
                      variant={v === null ? 'neutral' : (v >= 70 ? 'ok' : v >= 50 ? 'warn' : 'bad')}
                    />
                  </div>
                  <div style={{
                    fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500,
                    letterSpacing: '-0.02em', minWidth: 64, textAlign: 'right',
                    color: v === null ? 'var(--ink-faint)' : 'var(--ink)',
                  }}>
                    {v === null ? '—' : `${v}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </ShellCard>

        {/* Side stat — attendance */}
        <ShellCard className="span-5">
          <div className="card-title">
            <h2>Davomat</h2>
            <span className="meta">20 kun</span>
          </div>
          <div className="stat-value" style={{ marginBottom: 14 }}>{attRate}%</div>
          <ProgressBar value={attRate} variant={attRate >= 80 ? 'ok' : attRate >= 60 ? 'warn' : 'bad'} />
          <div className="muted" style={{ marginTop: 16, fontSize: 12 }}>
            Bugungi darsda ishtirok eting — kurs sifatining asosiy ko'rsatkichi.
          </div>
        </ShellCard>

        {/* Recent results */}
        <ShellCard className="span-12">
          <div className="card-title">
            <h2>So'nggi natijalar</h2>
            <span className="meta">5 ta test</span>
          </div>
          {last5.length === 0 ? (
            <EmptyState
              art={Pythagorean}
              title="Hali test topshirmagansiz"
              hint="Testlar sahifasidan birinchi testingizni boshlang."
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fan</th>
                  <th>Sana</th>
                  <th className="num">Ball</th>
                  <th className="num">To'g'ri</th>
                  <th>Dinamika</th>
                </tr>
              </thead>
              <tbody>
                {last5.map((r) => (
                  <tr key={r.id}>
                    <td><SubjectChip subject={r.subject} /></td>
                    <td>{formatDate(r.date)}</td>
                    <td className="num">{r.score}%</td>
                    <td className="num">{r.correctCount}/{r.total}</td>
                    <td>
                      <Sparkline
                        data={state.testResults
                          .filter((x) => x.studentId === student.id && x.subject === r.subject)
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((x) => x.score)}
                        subject={r.subject}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ShellCard>
      </div>
    </>
  );
}

/* ============================================================
   TESTS
   ============================================================ */
function TestsContent({ tests, onStart }) {
  return (
    <div className="quiz-grid">
      {tests.map((t) => (
        <article key={t.id} className="quiz-card">
          <div className="corner-art"><Blackboard size={84} accent={SUBJECTS[t.subject]?.accent} /></div>
          <div className="quiz-meta">
            <SubjectChip subject={t.subject} />
            <span className="tiny">{t.questionIds.length} ta savol</span>
          </div>
          <h3>{t.title}</h3>
          <p>{t.description}</p>
          <div className="quiz-foot">
            <span className="muted" style={{ fontSize: 12 }}>20 daqiqa · yakka tartib</span>
            <button className="btn btn-primary" onClick={() => onStart(t.id)}>
              Boshlash
              <span className="arrow-orb" aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ============================================================
   MATERIALS
   ============================================================ */
function MaterialsContent({ materials }) {
  return (
    <div className="quiz-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {materials.map((m) => (
        <article key={m.id} className="quiz-card">
          <div className="corner-art"><Blackboard size={72} accent={SUBJECTS[m.subject]?.accent} /></div>
          <div className="quiz-meta">
            <SubjectChip subject={m.subject} />
            <span className="tiny">{m.topic}</span>
          </div>
          <h3 style={{ fontSize: 18 }}>{m.title}</h3>
          <p>Yuklab olib, mavzu bo'yicha mustahkamlashni davom ettiring.</p>
          <div className="quiz-foot">
            <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{(m.type || 'pdf').toUpperCase()}</span>
            <button className="btn btn-sm" disabled>Yuklab olish</button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ============================================================
   PAYMENT
   ============================================================ */
function PaymentContent({ payment }) {
  if (!payment) {
    return (
      <ShellCard>
        <div className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>
          <div className="muted">To'lov ma'lumotlari mavjud emas.</div>
        </div>
      </ShellCard>
    );
  }

  const left = daysUntil(payment.nextDue);

  return (
    <div className="bento">
      <ShellCard className="span-6">
        <div className="card-title">
          <h2>Joriy holat</h2>
          <Pill kind={payment.status}>
            {payment.status === 'paid' ? "To'langan" : payment.status === 'due_soon' ? 'Yaqin orada' : "Muddati o'tgan"}
          </Pill>
        </div>
        <div className="kv-list">
          <span className="k">Oylik summa</span>
          <span className="v" style={{ fontSize: 20 }}>{formatMoney(payment.monthlyFee)}</span>
          <span className="k">Oxirgi to'lov</span>
          <span className="v">{formatDate(payment.lastPaid)}</span>
          <span className="k">Keyingi to'lov</span>
          <span className="v">{formatDate(payment.nextDue)}</span>
          <span className="k">Qolgan kun</span>
          <span className="v">{left >= 0 ? left + ' kun' : Math.abs(left) + ' kun kechikdi'}</span>
        </div>
      </ShellCard>

      <ShellCard className="span-6">
        <div className="card-title">
          <h2>To'lov tarixi</h2>
          <span className="meta">{payment.history.length} ta to'lov</span>
        </div>
        {payment.history.length === 0 ? (
          <div className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>Hali to'lov amalga oshirilmagan.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th className="num">Summa</th>
                </tr>
              </thead>
              <tbody>
                {payment.history.map((h, i) => (
                  <tr key={i}>
                    <td>{formatDate(h.date)}</td>
                    <td className="num">{formatMoney(h.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShellCard>
    </div>
  );
}
