import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SUBJECTS } from '../data/seed.js';
import { CONTACT, COURSE, TEACHER, CREDENTIALS, STUDENT_RESULTS, METHOD, PLATFORM, FAQ } from '../data/course.js';
import { AtomOrbit, RulerCompass, WaveInterference, Pythagorean } from './SubjectArt.jsx';
import {
  IconTests, IconResults, IconAttendance, IconPayments, IconMaterials,
  formatMoney,
} from './shared.jsx';

// The whole certificate, not a crop — only the personal-data fields are painted
// over in the pixels themselves (GRE: address / email / phone / date of birth /
// gender, SAT: record locator). The unredacted originals live in
// src/certificates/ and are deliberately never imported.
import satMath from '../assets/certs/sat-math.jpg';
import grePhysics from '../assets/certs/gre-physics.jpg';
import milliy from '../assets/certs/milliy.jpg';

const CERT_IMG = { sat: satMath, gre: grePhysics, milliy };

// Subject ids are 'fizika' / 'matematika' but the CSS tokens are --fizika and
// --matem, so the hue name has to be mapped rather than interpolated directly.
const HUE = { fizika: 'fizika', matematika: 'matem' };
const hue = (subject) => `var(--${HUE[subject] || 'accent'})`;
const hueSoft = (subject) => `var(--${HUE[subject] || 'accent'}-soft)`;

const PLATFORM_ICON = {
  tests: IconTests,
  progress: IconResults,
  attendance: IconAttendance,
  payments: IconPayments,
  materials: IconMaterials,
};

const NAV = [
  { href: '#ustoz', label: 'Ustoz' },
  { href: '#natijalar', label: 'Natijalar' },
  { href: '#fanlar', label: 'Fanlar' },
  { href: '#narx', label: 'Narx' },
  { href: '#aloqa', label: 'Aloqa' },
];

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
};

/* =================================================================
   Landing
   ================================================================= */

export default function Landing({ onEnter, theme, onToggleTheme, onApply }) {
  useScrollReveal();

  return (
    <div className="ld">
      <LandingNav onEnter={onEnter} theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <Hero onEnter={onEnter} />
        <Teacher />
        <Results />
        <Subjects />
        <Method />
        <Platform onEnter={onEnter} />
        <Pricing />
        <Faq />
        <Contact onApply={onApply} />
      </main>
      <LandingFooter onEnter={onEnter} />
    </div>
  );
}

/* =================================================================
   Motion primitives — IntersectionObserver only, no scroll listeners
   ================================================================= */

// One observer for the whole page. Elements opt in with data-reveal and are
// unobserved once shown, so nothing keeps running after the first pass.
// The shown flag is a data attribute, not a class: React overwrites className
// wholesale on re-render, so a class here would be wiped the moment a revealed
// element's own className changes (e.g. the FAQ item toggling .is-open) and,
// since it is already unobserved, it would never come back — the element would
// just vanish. React leaves attributes it did not render alone.
function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.ld [data-reveal]'));
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      els.forEach((el) => el.setAttribute('data-in', ''));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Counts up once, when scrolled into view. Renders the final value immediately
// for reduced-motion users so the number is never missing.
function Counter({ to, decimals = 0, duration = 1500, suffix = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setValue(to);
      return undefined;
    }
    let raf = 0;
    let startedAt = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const tick = (now) => {
          if (!startedAt) startedAt = now;
          const p = Math.min(1, (now - startedAt) / duration);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // easeOutExpo
          setValue(to * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);

  return (
    <span ref={ref} className="num-display">
      {value.toFixed(decimals)}{suffix}
    </span>
  );
}

/* =================================================================
   Nav — floating pill, glass only while stuck
   ================================================================= */

function LandingNav({ onEnter, theme, onToggleTheme }) {
  const [stuck, setStuck] = useState(false);
  const [menu, setMenu] = useState(false);
  const sentinel = useRef(null);

  // A sentinel at the very top beats a scroll listener: no reflow per frame.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Lock the page behind the overlay, and let Escape close it.
  useEffect(() => {
    if (!menu) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const go = useCallback((href) => {
    setMenu(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <div ref={sentinel} className="ld-sentinel" aria-hidden="true" />

      <header className={`ld-nav${stuck ? ' is-stuck' : ''}`}>
        <div className="ld-nav-inner">
          <a
            className="ld-brand"
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }}
          >
            <span className="ld-brand-mark" aria-hidden="true">IH</span>
            <span className="ld-brand-text">
              <b>Ikromjon Halimov</b>
              <i>kursi</i>
            </span>
          </a>

          <nav className="ld-nav-links" aria-label="Asosiy menyu">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => { e.preventDefault(); go(item.href); }}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ld-nav-actions">
            <button
              type="button"
              className="ld-icon-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
              title={theme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
            >
              {theme === 'dark' ? <SunGlyph /> : <MoonGlyph />}
            </button>

            <button type="button" className="ld-btn ld-btn-ghost ld-nav-login" onClick={onEnter}>
              Kirish
              <span className="ld-orb" aria-hidden="true"><ArrowGlyph /></span>
            </button>

            <button
              type="button"
              className={`ld-burger${menu ? ' is-open' : ''}`}
              onClick={() => setMenu((m) => !m)}
              aria-label={menu ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={menu}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`ld-menu${menu ? ' is-open' : ''}`} aria-hidden={!menu}>
        <div className="ld-menu-inner">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              style={{ '--i': i }}
              onClick={(e) => { e.preventDefault(); go(item.href); }}
              tabIndex={menu ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            className="ld-btn ld-btn-primary ld-menu-cta"
            style={{ '--i': NAV.length }}
            onClick={() => { setMenu(false); onEnter(); }}
            tabIndex={menu ? 0 : -1}
          >
            Hisobga kirish
            <span className="ld-orb" aria-hidden="true"><ArrowGlyph /></span>
          </button>
        </div>
      </div>
    </>
  );
}

/* =================================================================
   Hero — editorial split, never centred
   ================================================================= */

function Hero({ onEnter }) {
  return (
    <section className="ld-hero" id="top">
      <div className="ld-hero-art" aria-hidden="true">
        <AtomOrbit size={720} accent="var(--accent)" />
      </div>

      <div className="ld-shell ld-hero-grid">
        <div className="ld-hero-copy">
          <p className="ld-eyebrow" data-reveal>
            <span aria-hidden="true" />
            Fizika · Matematika · Milliy sertifikat
          </p>

          <h1 data-reveal style={{ '--d': '60ms' }}>
            Fizika va matematikani
            <span className="ld-underline"> tushunib </span>
            o‘rganasiz.
          </h1>

          <p className="ld-lede" data-reveal style={{ '--d': '120ms' }}>
            {TEACHER.yearsTeaching} yillik tajriba, {TEACHER.studentsTaught}+ o‘quvchi va milliy sertifikatda
            <b> A+ (90.08 ball)</b> olgan ustoz bilan tayyorgarlik. Darslar {COURSE.venue}da,
            testlar va natijalar esa onlayn platformada.
          </p>

          <div className="ld-cta-row" data-reveal style={{ '--d': '180ms' }}>
            <a className="ld-btn ld-btn-primary ld-btn-lg" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer">
              Telegramda yozish
              <span className="ld-orb" aria-hidden="true"><ArrowGlyph /></span>
            </a>
            <a className="ld-btn ld-btn-ghost ld-btn-lg mono" href={CONTACT.phoneHref}>
              <PhoneGlyph />
              {CONTACT.phoneLabel}
            </a>
          </div>

          <dl className="ld-trust" data-reveal style={{ '--d': '240ms' }}>
            <div>
              <dt>Tajriba</dt>
              <dd><Counter to={TEACHER.yearsTeaching} /> yil</dd>
            </div>
            <div>
              <dt>O‘quvchilar</dt>
              <dd><Counter to={TEACHER.studentsTaught} suffix="+" /></dd>
            </div>
            <div>
              <dt>Bir dars</dt>
              <dd><Counter to={COURSE.pricePerLesson / 1000} /> ming so‘m</dd>
            </div>
            <div>
              <dt>Sinov darsi</dt>
              <dd>Bepul</dd>
            </div>
          </dl>
        </div>

        {/* Double-bezel proof card: outer shell + inner core */}
        <aside className="ld-proof" data-reveal style={{ '--d': '300ms' }}>
          <div className="ld-proof-core">
            <p className="ld-proof-head">
              <VerifiedGlyph />
              Hujjat bilan tasdiqlangan
            </p>

            <ul className="ld-proof-list">
              {CREDENTIALS.map((c) => (
                <li key={c.id}>
                  <span className="ld-proof-val" style={{ color: hue(c.subject) }}>
                    <Counter to={c.value} decimals={c.decimals} />
                  </span>
                  <span className="ld-proof-meta">
                    <b>{c.title}</b>
                    <i>{c.subtitle}</i>
                  </span>
                  <span className="ld-proof-grade">{c.grade}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="ld-proof-link" onClick={onEnter}>
              Platformaga kirish
              <ArrowGlyph />
            </button>
          </div>
        </aside>
      </div>

      <div className="ld-hero-wave" aria-hidden="true">
        <WaveInterference accent="var(--accent)" height={64} />
      </div>
    </section>
  );
}

/* =================================================================
   Ustoz
   ================================================================= */

function Teacher() {
  const [zoomed, setZoomed] = useState(null);

  return (
    <section className="ld-section" id="ustoz">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Ustoz"
          title={TEACHER.name}
          lede={`${TEACHER.currentRole}, ${TEACHER.school}. Ilgari fizikadan ham dars bergan.`}
        />

        <div className="ld-teacher">
          <div className="ld-teacher-bio" data-reveal>
            <p>
              Ikromjon Halimov {TEACHER.yearsTeaching} yildan beri dars beradi va shu vaqt ichida
              {' '}{TEACHER.studentsTaught} dan ortiq o‘quvchi bilan ishlagan. Hozirda
              {' '}{TEACHER.school}da matematika o‘qituvchisi.
            </p>
            <p>
              U o‘zi ham imtihon topshirib turadi — fizikadan milliy sertifikatda <b>A+ (90.08 ball,
              umumiy ballga nisbatan 100 %)</b>, GRE Physics imtihonida <b>890 ball</b> va SAT
              matematika bo‘limida <b>740 ball</b>. Ya‘ni o‘quvchidan talab qiladigan narsani
              avval o‘zida tekshiradi.
            </p>
            <p className="ld-quote">
              Formulani yodlagan o‘quvchi tanish masalani yechadi. Nima uchun shunday ekanini
              tushungan o‘quvchi notanishini ham yechadi.
            </p>
          </div>

          <div className="ld-certs">
            {CREDENTIALS.map((c, i) => (
              <article className="ld-cert" key={c.id} data-reveal style={{ '--d': `${i * 90}ms` }}>
                <div className="ld-cert-core">
                  <header>
                    <p className="ld-cert-title">{c.title}</p>
                    <span className="ld-tag" data-subject={c.subject}>{c.grade}</span>
                  </header>

                  <p className="ld-cert-val" style={{ color: hue(c.subject) }}>
                    <Counter to={c.value} decimals={c.decimals} />
                  </p>
                  <p className="ld-cert-sub">{c.subtitle}</p>

                  <button
                    type="button"
                    className="ld-cert-shot"
                    onClick={() => setZoomed(c)}
                    aria-label={`${c.title} — sertifikatni to‘liq holda ochish`}
                  >
                    <img src={CERT_IMG[c.id]} alt={`${c.title} sertifikati`} loading="lazy" decoding="async" />
                    <span className="ld-cert-zoom" aria-hidden="true">To‘liq ko‘rish</span>
                  </button>

                  <footer>
                    <span>{c.note}</span>
                    <span className="ld-cert-valid mono">{c.valid}</span>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="ld-note" data-reveal>
          Sertifikatlar to‘liq holda berilgan. Faqat shaxsiy ma‘lumotlar — manzil, telefon,
          elektron pochta, tug‘ilgan sana va hujjat kodlari — o‘chirib tashlangan.
        </p>
      </div>

      {zoomed && <CertLightbox cert={zoomed} onClose={() => setZoomed(null)} />}
    </section>
  );
}

// Full-size certificate viewer. The card preview is too small to actually read
// the document, so the whole page opens here at the screen's full height.
function CertLightbox({ cert, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="ld-lightbox" role="dialog" aria-modal="true" aria-label={cert.title} onClick={onClose}>
      <button type="button" className="ld-lightbox-close" onClick={onClose} aria-label="Yopish">
        <span aria-hidden="true">×</span>
      </button>
      <figure className="ld-lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img src={CERT_IMG[cert.id]} alt={`${cert.title} sertifikati`} />
        <figcaption>{cert.title} · {cert.subtitle}</figcaption>
      </figure>
    </div>
  );
}

/* =================================================================
   Natijalar
   ================================================================= */

function Results() {
  return (
    <section className="ld-section ld-section-alt" id="natijalar">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Natijalar"
          title="O‘quvchilar nimaga erishgan"
          lede="Kurs davomida milliy sertifikat topshirgan va oliy ta‘limga kirgan o‘quvchilar."
        />

        <div className="ld-results">
          {STUDENT_RESULTS.map((r, i) => (
            <article className="ld-result" key={r.label} data-reveal style={{ '--d': `${i * 90}ms` }}>
              <p className="ld-result-val"><Counter to={r.value} /></p>
              <p className="ld-result-label">{r.label}</p>
              <p className="ld-result-sub">{r.sub}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   Fanlar
   ================================================================= */

const SUBJECT_ART = { fizika: AtomOrbit, matematika: Pythagorean };

function Subjects() {
  const list = [SUBJECTS.fizika, SUBJECTS.matematika];

  return (
    <section className="ld-section" id="fanlar">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Fanlar"
          title="Ikki fan, to‘liq dastur"
          lede="Har bir fan bo‘limlarga bo‘lingan. Yangi mavzu oldingisiga tayanadi — bo‘shliq qolmaydi."
        />

        <div className="ld-subjects">
          {list.map((s, i) => {
            const Art = SUBJECT_ART[s.id];
            return (
              <article className="ld-subject" key={s.id} data-reveal style={{ '--d': `${i * 100}ms` }}>
                <div className="ld-subject-core">
                  <div className="ld-subject-art" aria-hidden="true">
                    <Art size={220} accent={hue(s.id)} />
                  </div>
                  <p className="ld-subject-glyph mono" style={{ color: hue(s.id) }}>{s.glyph}</p>
                  <h3>{s.label}</h3>
                  <ul>
                    {s.subtopics.map((t) => (
                      <li key={t}>
                        <span className="ld-dot" style={{ background: hue(s.id) }} aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   Qanday o‘qitamiz
   ================================================================= */

function Method() {
  return (
    <section className="ld-section ld-section-alt">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Qanday o‘qitamiz"
          title="To‘rt qadam, har hafta takrorlanadi"
          lede="Kurs bir xil tartibda ishlaydi — o‘quvchi keyingi dars nima bo‘lishini biladi."
        />

        <ol className="ld-method">
          {METHOD.map((m, i) => (
            <li key={m.n} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <span className="ld-method-n mono">{m.n}</span>
              <div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* =================================================================
   Platforma — asymmetric bento
   ================================================================= */

function Platform({ onEnter }) {
  return (
    <section className="ld-section">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Platforma"
          title="Dars doskada, nazorat ekranda"
          lede="Har bir o‘quvchining shaxsiy kabineti bor. Ota-ona ham natijani o‘sha yerdan ko‘radi."
        />

        <div className="ld-bento">
          {PLATFORM.map((f, i) => {
            const Icon = PLATFORM_ICON[f.id];
            return (
              <article className={`ld-bento-item ld-bento-${f.id}`} key={f.id} data-reveal style={{ '--d': `${i * 70}ms` }}>
                <div className="ld-bento-core">
                  <span className="ld-bento-icon" aria-hidden="true"><Icon size={26} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </article>
            );
          })}

          <article className="ld-bento-item ld-bento-cta" data-reveal style={{ '--d': '350ms' }}>
            <div className="ld-bento-core">
              <div className="ld-bento-cta-copy">
                <h3>Hisobingiz bormi?</h3>
                <p>Login va parolingiz bilan kirib, testlar va ballaringizni ko‘ring.</p>
              </div>
              <button type="button" className="ld-btn ld-btn-primary" onClick={onEnter}>
                Kirish
                <span className="ld-orb" aria-hidden="true"><ArrowGlyph /></span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   Narx
   ================================================================= */

function Pricing() {
  return (
    <section className="ld-section ld-section-alt" id="narx">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Narx"
          title="Bitta narx, yashirin to‘lovsiz"
          lede="Chegirmalar yo‘q — hamma bir xil to‘laydi. Birinchi dars bepul."
        />

        <div className="ld-price" data-reveal>
          <div className="ld-price-core">
            <div className="ld-price-main">
              <p className="ld-price-val">
                <Counter to={COURSE.pricePerLesson / 1000} />
                <span>ming so‘m</span>
              </p>
              <p className="ld-price-unit">bir dars uchun</p>
              <p className="ld-price-hint mono">{formatMoney(COURSE.pricePerLesson)}</p>
            </div>

            <ul className="ld-price-list">
              <li><CheckGlyph /> Birinchi sinov darsi bepul</li>
              <li><CheckGlyph /> Guruhda taxminan {COURSE.groupSize} o‘quvchi</li>
              <li><CheckGlyph /> Onlayn testlar va ball tahlili</li>
              <li><CheckGlyph /> Davomat va to‘lov nazorati kabinetda</li>
              <li><CheckGlyph /> Dars materiallari yuklab olinadi</li>
            </ul>

            <div className="ld-price-cta">
              <a className="ld-btn ld-btn-primary ld-btn-lg" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer">
                Sinov darsiga yozilish
                <span className="ld-orb" aria-hidden="true"><ArrowGlyph /></span>
              </a>
              <p className="ld-price-where">
                {COURSE.venue} · {COURSE.landmark}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   FAQ — hairline accordion, no boxes
   ================================================================= */

function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="ld-section">
      <div className="ld-shell ld-shell-narrow">
        <SectionHead eyebrow="Savol-javob" title="Ko‘p so‘raladigan savollar" />

        <div className="ld-faq">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`ld-faq-item${isOpen ? ' is-open' : ''}`} key={item.q} data-reveal style={{ '--d': `${i * 50}ms` }}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                  >
                    <span>{item.q}</span>
                    <span className="ld-faq-sign" aria-hidden="true"><i /><i /></span>
                  </button>
                </h3>
                <div className="ld-faq-body" id={`faq-${i}`} role="region" hidden={!isOpen}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   Aloqa + ariza
   ================================================================= */

const GRADES = ['9-sinf', '10-sinf', '11-sinf', 'Bitiruvchi', 'Boshqa'];
const SUBJECT_CHOICES = [
  { id: 'fizika', label: 'Fizika' },
  { id: 'matematika', label: 'Matematika' },
  { id: 'ikkalasi', label: 'Ikkalasi' },
];

function Contact({ onApply }) {
  const [form, setForm] = useState({ name: '', phone: '', grade: GRADES[2], subject: 'ikkalasi' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
  };

  function validate() {
    const next = {};
    if (form.name.trim().length < 3) next.name = 'Ism-familiyani to‘liq yozing';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 9) next.phone = 'Telefon raqamini to‘liq kiriting';
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const subjectLabel = SUBJECT_CHOICES.find((s) => s.id === form.subject)?.label || form.subject;
    const application = {
      id: 'a-' + Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      grade: form.grade,
      subject: form.subject,
      createdAt: new Date().toISOString(),
      status: 'yangi',
    };

    onApply?.(application);

    const message = [
      'Yangi ariza — Ikromjon Halimov kursi',
      `Ism: ${application.name}`,
      `Telefon: ${application.phone}`,
      `Sinf: ${application.grade}`,
      `Fan: ${subjectLabel}`,
    ].join('\n');

    window.open(
      `${CONTACT.telegramUrl}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );

    setSent(true);
    setForm({ name: '', phone: '', grade: GRADES[2], subject: 'ikkalasi' });
  }

  return (
    <section className="ld-section ld-section-alt" id="aloqa">
      <div className="ld-shell">
        <SectionHead
          eyebrow="Aloqa"
          title="Sinov darsiga yozilish"
          lede="Ma‘lumotlaringizni qoldiring — Telegram orqali bog‘lanamiz va jadvalni aytamiz."
        />

        <div className="ld-contact">
          <form className="ld-form" onSubmit={handleSubmit} noValidate data-reveal>
            <div className="ld-form-core">
              {sent && (
                <p className="ld-form-ok" role="status">
                  <VerifiedGlyph />
                  Arizangiz qabul qilindi. Telegram ochilmagan bo‘lsa, quyidagi tugma orqali yozing.
                </p>
              )}

              <div className="ld-field">
                <label htmlFor="ld-name">Ism-familiya</label>
                <input
                  id="ld-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Masalan: Ali Akbarov"
                  aria-invalid={!!errors.name}
                  autoComplete="name"
                />
                {errors.name && <span className="ld-field-err">{errors.name}</span>}
              </div>

              <div className="ld-field">
                <label htmlFor="ld-phone">Telefon</label>
                <input
                  id="ld-phone"
                  type="tel"
                  className="mono"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+998 __ ___ __ __"
                  aria-invalid={!!errors.phone}
                  autoComplete="tel"
                />
                {errors.phone && <span className="ld-field-err">{errors.phone}</span>}
              </div>

              <div className="ld-field">
                <label htmlFor="ld-grade">Sinf</label>
                <select id="ld-grade" value={form.grade} onChange={set('grade')}>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <fieldset className="ld-field ld-choice">
                <legend>Qaysi fan</legend>
                <div>
                  {SUBJECT_CHOICES.map((s) => (
                    <label key={s.id} className={form.subject === s.id ? 'is-on' : ''}>
                      <input
                        type="radio"
                        name="ld-subject"
                        value={s.id}
                        checked={form.subject === s.id}
                        onChange={set('subject')}
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="ld-btn ld-btn-primary ld-btn-lg ld-form-submit">
                Yuborish
                <span className="ld-orb" aria-hidden="true"><ArrowGlyph /></span>
              </button>

              <p className="ld-form-note">
                Yuborilgandan so‘ng Telegram ochiladi va xabar tayyor holda turadi — faqat jo‘natasiz.
              </p>
            </div>
          </form>

          <div className="ld-contact-side">
            <a className="ld-contact-row" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer" data-reveal>
              <span className="ld-contact-icon"><TelegramGlyph /></span>
              <span>
                <b>Telegram</b>
                <i className="mono">@{CONTACT.telegramUser}</i>
              </span>
              <ArrowGlyph />
            </a>

            <a className="ld-contact-row" href={CONTACT.phoneHref} data-reveal style={{ '--d': '70ms' }}>
              <span className="ld-contact-icon"><PhoneGlyph /></span>
              <span>
                <b>Telefon</b>
                <i className="mono">{CONTACT.phoneLabel}</i>
              </span>
              <ArrowGlyph />
            </a>

            <div className="ld-contact-row is-static" data-reveal style={{ '--d': '140ms' }}>
              <span className="ld-contact-icon"><PinGlyph /></span>
              <span>
                <b>{COURSE.venue}</b>
                <i>{COURSE.landmark}</i>
              </span>
            </div>

            <p className="ld-contact-label" data-reveal style={{ '--d': '210ms' }}>Telegram kanallar</p>
            {CONTACT.channels.map((ch, i) => (
              <a
                className="ld-contact-row"
                key={ch.url}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal
                style={{ '--d': `${260 + i * 70}ms` }}
              >
                <span className="ld-contact-icon" style={{ color: hue(ch.subject), background: hueSoft(ch.subject) }}>
                  <TelegramGlyph />
                </span>
                <span>
                  <b>{ch.label}</b>
                  <i className="mono">{ch.handle}</i>
                </span>
                <ArrowGlyph />
              </a>
            ))}

            <div className="ld-contact-art" aria-hidden="true">
              <RulerCompass size={150} accent="var(--accent)" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================================================================
   Footer
   ================================================================= */

function LandingFooter({ onEnter }) {
  return (
    <footer className="ld-footer">
      <div className="ld-shell ld-footer-inner">
        <div>
          <a className="ld-brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }}>
            <span className="ld-brand-mark" aria-hidden="true">IH</span>
            <span className="ld-brand-text">
              <b>Ikromjon Halimov</b>
              <i>kursi</i>
            </span>
          </a>
          <p className="ld-footer-note">
            Fizika va matematika bo‘yicha tayyorgarlik. {COURSE.venue}, {COURSE.landmark}.
          </p>
        </div>

        <nav className="ld-footer-links" aria-label="Sahifa bo‘limlari">
          {NAV.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          <button type="button" onClick={onEnter}>Kirish</button>
        </nav>

        <div className="ld-footer-contact">
          <a className="mono" href={CONTACT.phoneHref}>{CONTACT.phoneLabel}</a>
          <a className="mono" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer">@{CONTACT.telegramUser}</a>
        </div>
      </div>
      <div className="ld-shell ld-footer-base">
        <span>© {new Date().getFullYear()} {COURSE.name}</span>
        <span className="mono">Fizika · Matematika</span>
      </div>
    </footer>
  );
}

/* =================================================================
   Small shared bits
   ================================================================= */

function SectionHead({ eyebrow, title, lede }) {
  return (
    <header className="ld-head">
      <p className="ld-eyebrow" data-reveal><span aria-hidden="true" />{eyebrow}</p>
      <h2 data-reveal style={{ '--d': '60ms' }}>{title}</h2>
      {lede && <p className="ld-lede" data-reveal style={{ '--d': '120ms' }}>{lede}</p>}
    </header>
  );
}

/* Inline glyphs — ultra-light strokes, no icon dependency. */

function ArrowGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8h9M8.5 4l4 4-4 4" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  );
}

function VerifiedGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1.6l1.7 1.2 2.1-.1.6 2 1.7 1.2-.8 1.9.8 1.9-1.7 1.2-.6 2-2.1-.1L8 14.4l-1.7-1.2-2.1.1-.6-2-1.7-1.2.8-1.9-.8-1.9 1.7-1.2.6-2 2.1.1z" />
      <path d="M5.6 8.2l1.7 1.7 3.1-3.4" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5.2 2.4H3.4c-.8 0-1.4.7-1.3 1.5.6 5.4 4 8.8 9.4 9.4.8.1 1.5-.5 1.5-1.3v-1.8l-2.6-1-1.2 1.3A9.6 9.6 0 0 1 5 6.2L6.2 5z" />
    </svg>
  );
}

function PinGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 14.2s4.6-4 4.6-7.5a4.6 4.6 0 1 0-9.2 0C3.4 10.2 8 14.2 8 14.2z" />
      <circle cx="8" cy="6.6" r="1.8" />
    </svg>
  );
}

function TelegramGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2.6 1.9 7.3c-.6.2-.6.8 0 1l3.1 1 1.2 3.5c.2.5.7.6 1 .2l1.7-1.7 3.1 2.3c.4.3.9.1 1-.4L14.9 3.3c.1-.5-.4-.9-.9-.7z" />
      <path d="m5 9.3 7.2-4.7L6.9 10" />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.4v1.4M8 13.2v1.4M14.6 8h-1.4M2.8 8H1.4M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1" />
    </svg>
  );
}

function MoonGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.4 9.6A5.9 5.9 0 0 1 6.4 2.6a5.9 5.9 0 1 0 7 7z" />
    </svg>
  );
}
