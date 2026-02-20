import React, { useEffect, useRef } from 'react';
import './LandingPage.css';

/* ─────────────────────────────
   IntersectionObserver hook
───────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    el.querySelectorAll('.animate').forEach((child) => {
      child.style.animationPlayState = 'paused';
      observer.observe(child);
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─────────────────────────────
   Sub-components
───────────────────────────── */

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#hero" className="nav-logo">
          <div className="nav-logo-icon">💊</div>
          Medi<span>Scan</span> Pro
        </a>
        <ul className="nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#benefits">Benefits</a></li>
          <li><a href="#safety">Privacy</a></li>
          <li><a href="#cta" className="nav-cta">Start Scanning →</a></li>
        </ul>
      </div>
    </nav>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual">
      {/* Floating top-left badge */}
      <div className="hero-badge-float top-left">
        <span className="badge-icon">🔒</span>
        <span>Local Processing Only</span>
      </div>

      <div className="split-card">
        <div className="split-card-header">
          <div className="card-dots">
            <span /><span /><span />
          </div>
          <div className="split-card-title">MediScan Pro · Active Scan</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>v2.4.1</div>
        </div>

        <div className="split-body">
          {/* LEFT — raw handwriting */}
          <div className="split-left">
            <div className="split-label raw">Raw Prescription</div>
            <div className="handwriting">
              <p>Pt: Rahul M. 34yr M</p>
              <p>Rx:</p>
              <p>Tab. Metformin 500mg</p>
              <p>1-0-1 × 30 days</p>
              <p>Cap. Amox 250 OD</p>
              <p>Atorvastatin 10mg</p>
              <p>Dr. S. Kapoor, MBBS</p>
              <p>City Med Clinic</p>
            </div>
            {/* scan line animation */}
            <div className="scan-overlay">
              <div className="scan-line" />
            </div>
          </div>

          {/* RIGHT — parsed output */}
          <div className="split-right">
            <div className="split-label clean">Verified Output</div>
            <div className="med-card">
              <div className="med-card-item">
                <div className="label">Medication 1</div>
                <div className="value">
                  Metformin 500mg
                  <span className="tag">✓ Verified</span>
                </div>
              </div>
              <div className="med-card-item">
                <div className="label">Dosage</div>
                <div className="value">Twice Daily — 30 days</div>
              </div>
              <div className="med-card-item">
                <div className="label">Medication 2</div>
                <div className="value">
                  Amoxicillin 250mg
                  <span className="tag">✓ Verified</span>
                </div>
              </div>
              <div className="med-card-item">
                <div className="label">Dosage</div>
                <div className="value">Once Daily (OD)</div>
              </div>
              <div className="confidence-bar">
                <div className="bar-label">
                  <span>OCR Confidence</span>
                  <span style={{ color: 'var(--teal)', fontWeight: 700 }}>94%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating bottom-right badge */}
      <div className="hero-badge-float bot-right">
        <span className="badge-icon">🗃️</span>
        <span>300+ Medications DB</span>
      </div>
    </div>
  );
}

function Hero({ onStartScan }) {
  const ref = useReveal();
  return (
    <section className="hero" id="hero" ref={ref}>
      <div className="container hero-inner">
        <div className="hero-text">
          <div className="hero-badge animate delay-1">
            <span className="hero-badge-dot" />
            AI-Powered Prescription Decoder
          </div>

          <h1 className="hero-heading animate delay-2">
            Bridging the Gap Between<br />
            <span className="highlight">Messy Handwriting</span><br />
            &amp; Patient Safety
          </h1>

          <p className="hero-sub animate delay-3">
            MediScan Pro decodes illegible handwritten prescriptions into clear, structured
            digital medication data — locally, privately, and accurately.
          </p>

          <div className="hero-actions animate delay-4">
            <button className="btn-primary" onClick={onStartScan}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                <rect x="7" y="7" width="10" height="10" rx="2" />
              </svg>
              Start Scanning
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a href="#how-it-works" className="btn-secondary">
              See how it works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="hero-trust animate delay-5">
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              Local Inference
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-icon">🗄️</span>
              PostgreSQL DB
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-icon">🩺</span>
              Medical-Grade NLP
            </div>
          </div>
        </div>

        <div className="animate delay-3">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useReveal();
  const steps = [
    {
      num: '01',
      icon: '🔍',
      title: 'Intelligent OCR',
      tech: 'PaddleOCR · en_PP-OCRv4',
      desc:
        'Uses locally-run en_PP-OCRv4_rec_infer models to read handwritten prescriptions with high precision. Your data never leaves your device — zero cloud exposure.',
    },
    {
      num: '02',
      icon: '🧠',
      title: 'Medical NLP Filtering',
      tech: 'N-gram · Contextual Parsing',
      desc:
        'Advanced N-gram logic identifies medication names while intelligently ignoring noise — doctor names, clinic addresses, patient ages, and other irrelevant text.',
    },
    {
      num: '03',
      icon: '🗃️',
      title: 'Database Cross-Reference',
      tech: 'PostgreSQL · 300+ Medications',
      desc:
        'Matched names are cross-referenced against a verified local database of 300+ medications to provide Medical Uses, dosage guidance, and plain-language Patient Summaries.',
    },
  ];
  return (
    <section className="how-it-works" id="how-it-works" ref={ref}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag animate delay-1">The Technology</div>
          <h2 className="section-heading animate delay-2">
            Three Steps From Scribble<br />to Certainty
          </h2>
          <p className="section-sub animate delay-3">
            A precision pipeline that handles everything from raw image capture
            to structured, human-readable medication data.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className={`step-card animate delay-${i + 2}`} key={s.num}>
              <div className="step-number">STEP {s.num}</div>
              <div className="step-icon-wrap">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="step-tech">{s.tech}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const ref = useReveal();
  const cards = [
    {
      cls: 'accuracy',
      icon: '🎯',
      label: 'For Accuracy',
      title: 'Always the Right Medication',
      desc:
        'Corrects common OCR misspellings using a verified local database. The fuzzy-match engine ensures the right medication is identified even with imperfect handwriting.',
    },
    {
      cls: 'clarity',
      icon: '💬',
      label: 'For Clarity',
      title: 'Plain Language Instructions',
      desc:
        'Converts medical abbreviations like OD, BID, and TDS into simple, plain-language instructions — improving patient compliance and reducing dangerous misunderstandings.',
    },
    {
      cls: 'history',
      icon: '📋',
      label: 'For History',
      title: 'Your Private Scan Record',
      desc:
        'Maintain a private digital log of all your scans within the app. Access past prescriptions easily during follow-up visits without relying on paper records.',
    },
  ];
  return (
    <section className="benefits" id="benefits" ref={ref}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag animate delay-1">Why MediScan Pro</div>
          <h2 className="section-heading animate delay-2">
            Built Around Real Patient Needs
          </h2>
          <p className="section-sub animate delay-3">
            Every feature is designed to reduce friction between a doctor's intent
            and a patient's understanding.
          </p>
        </div>
        <div className="benefits-grid">
          {cards.map((c, i) => (
            <div className={`benefit-card ${c.cls} animate delay-${i + 2}`} key={c.cls}>
              <div className="benefit-icon-wrap">{c.icon}</div>
              <div className="benefit-label">{c.label}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetyBadges() {
  const ref = useReveal();
  const cards = [
    {
      icon: '🖥️',
      title: 'Local Processing Only',
      desc: 'All OCR inference runs entirely on your device using local PaddleOCR models. Prescription images and patient data are never transmitted to external servers or third-party clouds.',
    },
    {
      icon: '✅',
      title: 'Verified Medication Database',
      desc: 'Our PostgreSQL database is curated from authoritative medical sources. Every medication entry is reviewed for accuracy, with regular updates to reflect current clinical standards.',
    },
  ];
  return (
    <section className="safety" id="safety" ref={ref}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag animate delay-1">Privacy &amp; Trust</div>
          <h2 className="section-heading animate delay-2">
            Your Data, Your Device
          </h2>
        </div>
        <div className="safety-inner">
          {cards.map((c, i) => (
            <div className={`safety-card animate delay-${i + 2}`} key={c.title}>
              <div className="safety-icon">{c.icon}</div>
              <div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { number: '300+', label: 'Medications in Database' },
    { number: '94%',  label: 'Average OCR Confidence' },
    { number: '0',    label: 'External API Calls' },
    { number: '<2s',  label: 'Average Scan Time' },
  ];
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat-item" key={s.label}>
              <div className="stat-number">{s.number}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onStartScan }) {
  const ref = useReveal();
  return (
    <section className="cta-section" id="cta" ref={ref}>
      <div className="container">
        <div className="cta-box animate delay-1">
          <h2>Ready to Decode Your Prescription?</h2>
          <p>
            Start scanning in seconds. No signup. No cloud. No compromise on privacy.
          </p>
          <button className="btn-cta-white" onClick={onStartScan}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
              <rect x="7" y="7" width="10" height="10" rx="2" />
            </svg>
            Start Scanning Now
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <a href="#hero" className="footer-logo">
            <div className="footer-logo-icon">💊</div>
            Medi<span>Scan</span> Pro
          </a>
          <nav className="footer-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#benefits">Benefits</a>
            <a href="#safety">Privacy</a>
            <a href="#cta">Get Started</a>
          </nav>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} MediScan Pro. All processing is local. No patient data is collected or transmitted.
        </p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────
   Main Export
───────────────────────────── */
export default function LandingPage({ onStartScan }) {
  return (
    <>
      <Nav />
      <Hero onStartScan={onStartScan} />
      <HowItWorks />
      <Benefits />
      <Stats />
      <SafetyBadges />
      <CTASection onStartScan={onStartScan} />
      <Footer />
    </>
  );
}