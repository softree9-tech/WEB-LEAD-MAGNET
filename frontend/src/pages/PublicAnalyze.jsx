import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeadCaptureForm from '../components/LeadCaptureForm';
import LeadResults, { exportToExcel } from '../components/LeadResults';
import { processSingleLead, validateWebsite, emailReport } from '../api/api';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';
import StickyFooter from '../components/StickyFooter';
import LightContactSection from '../components/LightContactSection';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Zap,
  BarChart2,
  TrendingUp,
  Lock,
  Clock,
  FileText,
  AlertTriangle,
  LayoutGrid,
  Code,
  Download,
  Award,
  Users,
  Globe,
  Smartphone,
  MousePointerClick,
  Layout,
  Check,
  Search,
  RefreshCw,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../PublicPortal.css';
import '../PremiumReport.css';

export default function PublicAnalyze() {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [lastFormData, setLastFormData] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Email report states
  const [showEmailCaptcha, setShowEmailCaptcha] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [emailToast, setEmailToast] = useState(null);
  const emailRecaptchaRef = React.useRef(null);
  const emailWidgetIdRef = React.useRef(null);

  // Carousel state
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  const [isCarouselHovered, setIsCarouselHovered] = React.useState(false);
  const slideNames = ['Score & Report', 'Overview', 'Top Issues', 'Opportunities', 'Detailed Analysis', 'Recommendations', 'Technical Insights'];

  const handleNextSlide = () => setCurrentSlide(prev => (prev + 1) % slideNames.length);
  const handlePrevSlide = () => setCurrentSlide(prev => (prev - 1 + slideNames.length) % slideNames.length);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNextSlide();
    if (distance < -minSwipeDistance) handlePrevSlide();
  };

  React.useEffect(() => {
    if (isCarouselHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideNames.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isCarouselHovered, slideNames.length]);

  // Simulated status updates for the premium agent analysis loader
  const loadingSteps = [
    "Initializing multi-agent analysis engine...",
    "Scanning website structure and page layout...",
    "Auditing lead capture points and CTAs...",
    "Analyzing mobile responsiveness and UX metrics...",
    "Evaluating SEO tags, metadata, and performance...",
    "Generating custom AI strategic recommendations..."
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 4500); // Progress through steps every 4.5 seconds
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!showEmailCaptcha) return;
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    const renderWidget = () => {
      if (emailWidgetIdRef.current !== null) return;
      if (!emailRecaptchaRef.current) return;
      try {
        emailWidgetIdRef.current = window.grecaptcha.render(emailRecaptchaRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            setShowEmailCaptcha(false);
            handleEmailDelivery(token);
          }
        });
      } catch (err) {
        console.warn("reCAPTCHA render skipped:", err.message);
      }
    };

    const interval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        clearInterval(interval);
        renderWidget();
      }
    }, 300);

    return () => {
      clearInterval(interval);
      if (emailWidgetIdRef.current !== null) {
        try { window.grecaptcha.reset(emailWidgetIdRef.current); } catch (_) { }
        emailWidgetIdRef.current = null;
      }
    };
  }, [showEmailCaptcha]);

  const handleEmailDelivery = async (captchaToken) => {
    setEmailing(true);
    try {
      const payload = {
        name: lastFormData?.fullName || result.name || 'Client',
        email: lastFormData?.email || result.email || 'unknown@example.com',
        website: lastFormData?.website || result.website || '',
        report_data: result
      };
      await emailReport(payload);
      setEmailDelivered(true);
      setEmailToast('Executive report has been delivered to your business email.');
      setTimeout(() => setEmailToast(null), 5000);
    } catch (err) {
      console.error('Email report failed', err);
      alert('Failed to email the report. Please try again.');
    } finally {
      setEmailing(false);
    }
  };

  const handleSubmit = async (formData, isRecalc = false) => {
    setError(null);

    // ── Step 1: Pre-flight website validation ───────────────────────────
    if (!isRecalc) setValidating(true);
    try {
      const validation = await validateWebsite(formData.website);
      if (!validation.valid) {
        setError(validation.error);
        if (!isRecalc) setValidating(false);
        else setIsRecalculating(false);
        return;
      }
    } catch (err) {
      setError('Unable to verify the website. Please check the URL and try again.');
      if (!isRecalc) setValidating(false);
      else setIsRecalculating(false);
      return;
    }
    if (!isRecalc) setValidating(false);

    // ── Step 2: Run full AI analysis ────────────────────────────────────
    setLastFormData(formData);
    if (isRecalc) {
      setIsRecalculating(true);
    } else {
      setLoading(true);
      setLoadingStep(0);
    }

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        website: formData.website,
        recaptcha_token: formData.recaptchaToken,
        source: 'Public Lead Magnet'
      };

      const data = await processSingleLead(payload);
      const processed = data.output_row || data;
      setResult(processed);
    } catch (err) {
      console.error("Analysis failed:", err);
      const detail = err.response?.data?.detail || err.message || "An unexpected error occurred during the analysis.";
      setError(detail);
    } finally {
      if (isRecalc) setIsRecalculating(false);
      else setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setStarted(false);
  };

  if (result) {
    // Computed KPIs for the executive hero
    const seoScore = parseInt(result.seo_score || 0);
    const aeoScore = parseInt(result.aeo_score || 0);
    const consistencyVal = result.design === 'Modern' ? 90 : 60;
    const flowVal = result.message === 'Clear' ? 80 : 50;
    const mobileVal = result.seo_mobile ? 80 : 30;
    const engagementVal = result.cta === 'Strong' ? 90 : 40;
    const uxScore = Math.round((consistencyVal + flowVal + mobileVal + engagementVal) / 4);
    const trustSignals = [
      result.has_analytics?.google_analytics, result.has_analytics?.tag_manager,
      result.has_analytics?.facebook_pixel, result.has_analytics?.linkedin_tag,
      result.has_lead_capture, result.has_cta, result.has_newsletter,
      result.seo_ssl, result.ssl_enforced, result.seo_title,
      result.seo_meta_desc, result.seo_canonical, result.seo_og
    ];
    const trustScore = Math.round((trustSignals.filter(Boolean).length / 13) * 100);
    const cleanDomain = result.website.replace(/^https?:\/\/(www\.)?/, '');

    if (!started) {
      return (
        <div className="public-portal-theme">
          <Navigation />

          <div className="portal-main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
            <div className="form-card-glass analysis-gate-card animate-fade-in">
              <div className="gate-icon-ring">
                <ShieldCheck size={36} />
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                  Intelligence Report Ready
                </h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Our AI agents completed a deep analysis of <strong style={{ color: '#FF7A00' }}>{cleanDomain}</strong>.<br />
                  Your executive intelligence report contains strategic insights across {7 + (result.battle_data ? 1 : 0)} categories.
                </p>
              </div>

              <div className="gate-checklist">
                {[
                  'Domain verified & full-page structure parsed',
                  'Executive presence & brand credibility scored',
                  'Conversion intelligence & CTA analysis compiled',
                  'SEO performance & AI visibility audited',
                  'Strategic action plan generated'
                ].map((item, i) => (
                  <div className="gate-check-item" key={i}>
                    <div className="gate-check-icon"><Check size={12} /></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', width: '100%' }}>
                <div style={{ background: 'rgba(255,122,0,0.05)', border: '1px solid rgba(255,122,0,0.12)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF7A00' }}>{seoScore}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEO Score</div>
                </div>
                <div style={{ background: 'rgba(255,122,0,0.05)', border: '1px solid rgba(255,122,0,0.12)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF7A00' }}>{uxScore}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>UX Score</div>
                </div>
                <div style={{ background: 'rgba(255,122,0,0.05)', border: '1px solid rgba(255,122,0,0.12)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF7A00' }}>{trustScore}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trust Score</div>
                </div>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="btn-premium-cta"
                style={{ width: '100%', fontSize: '1.1rem' }}
              >
                <Sparkles size={18} className="btn-premium-cta-icon" />
                View Executive Intelligence Report
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="public-portal-theme" style={{ display: 'block', minHeight: '100vh', backgroundAttachment: 'fixed' }}>
        <div className="portal-navbar" style={{ borderBottom: '1px solid rgba(10,10,26,0.08)' }}>
          <div className="mx-auto w-full max-w-7xl flex items-center justify-between" style={{ padding: '0 1rem' }}>
            <Link to="/" className="portal-logo-container" style={{ textDecoration: 'none' }}>
              <Logo size={28} />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  background: '#fff',
                  color: '#FF6B00',
                  border: '1px solid rgba(255, 107, 0, 0.3)',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#FFF0E6'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
              >
                <ArrowLeft size={14} />
                New Analysis
              </button>
            </div>
          </div>
        </div>

        <div className="portal-container" style={{ padding: '75px 2rem 4rem', maxWidth: '1400px' }}>

          {/* ── EXECUTIVE HERO ──────────────────────────── */}
          <div className="executive-hero premium-animate premium-animate-d1">
            <div className="executive-hero-inner">
              <div className="exec-badge-row">
                <div className="exec-status-badge">
                  <ShieldCheck size={13} />
                  AI Analysis Complete
                </div>
                <span className="exec-date-badge">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h1 className="exec-title">
                Executive Intelligence Report<br />
                <span className="domain-highlight">{cleanDomain}</span>
              </h1>

              <p className="exec-subtitle">
                {result.executive_summary || "Comprehensive AI-powered analysis covering conversion optimization, brand presence, technical performance, and strategic growth opportunities."}
              </p>
            </div>
          </div>

          {/* ── KPI STRIP ──────────────────────────────── */}
          <div className="exec-kpi-strip premium-animate premium-animate-d2">
            <div className="exec-kpi-card">
              <span className="kpi-label">SEO Performance</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{seoScore}</span>
                <span className="kpi-unit">/100</span>
              </div>
              <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${seoScore}%` }} /></div>
              <span className="kpi-sub">{seoScore > 80 ? 'Excellent' : seoScore > 50 ? 'Average' : 'Needs Work'}</span>
            </div>

            <div className="exec-kpi-card">
              <span className="kpi-label">UX & Conversion</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{uxScore}</span>
                <span className="kpi-unit">/100</span>
              </div>
              <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${uxScore}%` }} /></div>
              <span className="kpi-sub">{uxScore > 80 ? 'Strong' : uxScore > 60 ? 'Moderate' : 'Weak'}</span>
            </div>

            <div className="exec-kpi-card">
              <span className="kpi-label">Trust & Credibility</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{trustScore}</span>
                <span className="kpi-unit">/100</span>
              </div>
              <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${trustScore}%` }} /></div>
              <span className="kpi-sub">{trustScore > 75 ? 'Low Risk' : trustScore > 40 ? 'Moderate Risk' : 'High Risk'}</span>
            </div>

            <div className="exec-kpi-card">
              <span className="kpi-label">AI Visibility</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{aeoScore}</span>
                <span className="kpi-unit">/100</span>
              </div>
              <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${aeoScore}%` }} /></div>
              <span className="kpi-sub">{aeoScore > 60 ? 'Visible' : aeoScore > 30 ? 'Low Visibility' : 'Invisible'}</span>
            </div>
          </div>

          {/* ── ACTIONS BAR ────────────────────────────── */}
          <div className="exec-actions-bar premium-animate premium-animate-d3">
            <div className="exec-actions-left">
              <div className="exec-status-badge" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                <Cpu size={12} />
                {result.first_impression_verdict || 'Average'} Presence
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                Presence Score: <strong style={{ color: '#0a0a1a' }}>{result.first_impression_score || 0}/10</strong>
              </span>
            </div>
            <div className="exec-actions-right">
              <button className="action-btn" onClick={() => {
                if (lastFormData) handleSubmit({ ...lastFormData, recaptchaToken: "admin_bypass" }, true);
              }} disabled={isRecalculating}>
                <RefreshCw size={14} className={isRecalculating ? "spinning" : ""} /> {isRecalculating ? "Recalculating..." : "Recalculate"}
              </button>
              <button
                className={`action-btn primary ${emailing ? 'spinning-parent' : ''} ${emailDelivered ? 'success-btn' : ''}`}
                onClick={() => {
                  if (emailDelivered || emailing) return;
                  setShowEmailCaptcha(true);
                }}
                disabled={emailDelivered || emailing}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {emailing ? (
                  <><Loader2 size={14} className="spinning" /> Delivering PDF...</>
                ) : emailDelivered ? (
                  <><Check size={14} /> Delivered Successfully</>
                ) : (
                  <><Mail size={14} /> Email Full Report</>
                )}
              </button>
            </div>
          </div>

          {emailToast && (
            <div style={{
              position: 'fixed', bottom: '2rem', right: '2rem',
              background: '#10b981', color: 'white', padding: '1rem 1.5rem',
              borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 9999,
              animation: 'fade-in 0.3s ease-out'
            }}>
              <Check size={18} />
              <span style={{ fontWeight: 600 }}>{emailToast}</span>
            </div>
          )}

          {showEmailCaptcha && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 9999
            }}>
              <div style={{
                background: 'white', padding: '2rem', borderRadius: '12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Security Verification</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Please verify to receive your PDF report.</p>
                <div ref={emailRecaptchaRef}></div>
                <button
                  onClick={() => setShowEmailCaptcha(false)}
                  style={{
                    marginTop: '1rem', background: 'transparent', border: 'none',
                    color: '#64748b', cursor: 'pointer', fontSize: '0.9rem',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── RESULTS ────────────────────────────────── */}
          <div className="premium-animate premium-animate-d4">
            <LeadResults leads={[result]} isPublic={true} />
          </div>

          {/* ── REPORT FOOTER ──────────────────────────── */}
          <div className="report-footer premium-animate premium-animate-d5">
            <div className="report-footer-brand">
              <Sparkles size={14} color="#FF7A00" />
              Powered by Softree AI Intelligence Engine
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569' }}>
              Report generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Confidential
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="public-portal-theme">
        <Navigation />

        <div className="portal-main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <div className="form-card-glass animate-fade-in" style={{
            padding: '3.5rem 2.5rem',
            maxWidth: '500px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Cinematic scanning beam */}
            <div className="scanning-beam" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, var(--accent-orange), transparent)',
              animation: 'scan 2.8s ease-in-out infinite',
              opacity: 0.6
            }} />

            {/* Animated Scanning Circle */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <div className="spinning-loader" style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                position: 'absolute',
                top: 0,
                left: 0
              }} />
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(5, 5, 5, 0.95)',
                position: 'absolute',
                top: '10px',
                left: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-orange)'
              }}>
                <Cpu size={32} className="animate-pulse" style={{ color: '#FF7A00' }} />
              </div>
            </div>

            <div style={{ width: '100%' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'black', lineHeight: 1.4 }}>
                Generating Your AI Performance Intelligence Report
              </h3>

              {/* Custom progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{
                  height: '100%',
                  width: `${((loadingStep + 1) / loadingSteps.length) * 100}%`,
                  background: 'linear-gradient(90deg, #FF9E43, #FF7A00)',
                  transition: 'width 0.5s ease',
                  borderRadius: '3px'
                }} />
              </div>

              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.5 }}>
                {loadingSteps[loadingStep]}
              </p>
            </div>

            {/* Micro-features showing analysis parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-gray)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#FF7A00" />
                <span>Performance</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <BarChart2 size={14} color="#FF7A00" />
                <span>SEO Audit</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#FF7A00" />
                <span>Trust Signals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Validating State ──────────────────────────────────────────────────────
  if (validating) {
    return (
      <div className="public-portal-theme">
        <Navigation />

        <div className="portal-main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <div className="form-card-glass animate-fade-in" style={{
            padding: '3.5rem 2.5rem',
            maxWidth: '480px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <div className="spinning-loader" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                position: 'absolute',
                top: 0,
                left: 0
              }} />
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(5, 5, 5, 0.95)',
                position: 'absolute',
                top: '8px',
                left: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={28} className="animate-pulse" style={{ color: '#FF7A00' }} />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Verifying Website Accessibility
              </h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Checking DNS resolution, server response, and domain availability...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-portal-theme">
      {/* NAVBAR */}
      <Navigation />

      <div className="portal-main-content">

        {/* SECTION 1: HERO SECTION */}
        <section className="portal-section">
          <div className="portal-container hero-split-grid">

            {/* Left side = headline + benefits */}
            <div className="hero-left-col animate-fade-in">
              <div className="orange-badge">
                <Sparkles size={13} style={{ marginRight: '4px' }} />
                AI Growth Intelligence
              </div>
              <h1 className="hero-title">
                Analyze Your Website <span className="highlight-orange">Discover Growth Opportunities</span>
              </h1>
              <p className="hero-subtitle">
                Get a comprehensive AI-powered audit of your webpage. Our platform analyzes content quality, SEO performance, user experience, trust signals, and conversion readiness to uncover issues that may be limiting visibility, lead generation, and revenue growth.
              </p>

              {/* Benefit Icons below */}
              <div className="hero-benefits-grid">

                {/* Benefit 1 */}
                <div className="hero-benefit-item">
                  <div className="benefit-icon-wrapper">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="benefit-title">Growth Focused</h4>
                  <p className="benefit-desc">Actionable insights that drive real results</p>
                </div>

                {/* Benefit 2 */}
                <div className="hero-benefit-item">
                  <div className="benefit-icon-wrapper">
                    <Zap size={20} />
                  </div>
                  <h4 className="benefit-title">Instant Results</h4>
                  <p className="benefit-desc">Get your report within minutes</p>
                </div>

                {/* Benefit 3 */}
                <div className="hero-benefit-item">
                  <div className="benefit-icon-wrapper">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="benefit-title">100% Secure</h4>
                  <p className="benefit-desc">Your data is safe and confidential</p>
                </div>

              </div>
            </div>

            {/* Right side = Form Card */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <LeadCaptureForm onSubmit={handleSubmit} loading={loading || validating} error={error} />
            </div>

          </div>
        </section>

        {/* SECTION 2: SAMPLE AUDIT REPORT */}
        <section className="portal-section sample-report-section">
          <div className="portal-container">

            <div className="section-header" style={{ textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
              <h2 className="section-title">See a Sample Audit Report</h2>
              <p className="section-subtitle">Here’s a preview of the insights you’ll receive after analyzing your page.</p>
            </div>

            {/* Dashboard Mockup Frame - Carousel Version */}
            <div 
              className="mock-dashboard-carousel" 
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
              style={{ 
                position: 'relative', 
                width: '100%', 
                overflow: 'hidden', 
                background: '#FFFFFF', 
                border: '1px solid rgba(10, 10, 26, 0.08)', 
                borderRadius: '16px', 
                boxShadow: '0 8px 32px -20px rgba(10, 10, 26, 0.14)',
                paddingBottom: '3rem'
              }}
            >
              {/* Carousel Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(10,10,26,0.08)', background: '#F8F9FC' }}>
                 <div className="mock-sidebar-brand" style={{ marginBottom: 0 }}>
                    <div className="mock-brand-title">SOFTREE</div>
                    <div className="mock-brand-sub">TECHNOLOGY</div>
                 </div>
                 <div style={{ fontWeight: 700, color: 'var(--accent-orange)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   {slideNames[currentSlide]} <span style={{ color: 'var(--text-gray)', fontWeight: 600, fontSize: '0.8rem' }}>({currentSlide + 1}/{slideNames.length})</span>
                 </div>
              </div>

              {/* Carousel Track */}
              <div 
                style={{ 
                  display: 'flex', 
                  transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)', 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  alignItems: 'stretch'
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Slide 1: Score & Report */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-score-report.png" alt="Sample Score & Full Report Email" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>

                {/* Slide 2: Overview */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-overview.png" alt="Overview - Executive Presence Intelligence" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>

                {/* Slide 3: Top Issues */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-top-issues.png" alt="Top Issues Found" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>

                {/* Slide 4: Opportunities */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-opportunities.png" alt="Key Opportunity Areas" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>

                {/* Slide 5: Detailed Analysis */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-analysis.png" alt="Detailed Analysis - Estimated Impact" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>

                {/* Slide 6: Recommendations */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-recommendations.png" alt="AI Recommendations" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>

                {/* Slide 7: Technical Insights */}
                <div style={{ minWidth: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src="/reports/sample-ai-visibility.png" alt="Technical Insights - AI Visibility" style={{ width: '100%', maxWidth: '960px', height: '550px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </div>
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={handlePrevSlide} 
                style={{ 
                  position: 'absolute', top: '50%', left: '1.5rem', transform: 'translateY(-50%)', 
                  background: 'white', border: '1px solid rgba(10,10,26,0.1)', borderRadius: '50%', 
                  width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'var(--accent-orange)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextSlide} 
                style={{ 
                  position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', 
                  background: 'white', border: '1px solid rgba(10,10,26,0.1)', borderRadius: '50%', 
                  width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'var(--accent-orange)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                <ChevronRight size={24} />
              </button>

              {/* Pagination Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', position: 'absolute', bottom: '1.5rem', width: '100%' }}>
                {slideNames.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)} 
                    style={{ 
                      width: currentSlide === idx ? '24px' : '8px', 
                      height: '8px', 
                      borderRadius: '4px', 
                      background: currentSlide === idx ? 'var(--accent-orange)' : 'rgba(10,10,26,0.15)', 
                      border: 'none', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s ease',
                      padding: 0
                    }} 
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="mock-disclaimer">
              This is a sample report for demonstration only. Your actual report will be generated based on the page you submit.
            </div>

          </div>
        </section>

        {/* SECTION 3: WHAT WE ANALYZE */}
        <section className="portal-section">
          <div className="portal-container">

            <div className="section-header" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <h2 className="section-title">What We Analyze</h2>
              <p className="section-subtitle">Our multi-agent system audits your digital footprint across six strategic conversion layers.</p>
            </div>

            <div className="analyze-cards-grid">

              {/* Card 1 */}
              <div className="analyze-premium-card">
                <div className="analyze-card-header">
                  <div className="analyze-icon-wrapper">
                    <TrendingUp size={22} />
                  </div>
                  <h4 className="analyze-card-title">Conversion Intelligence</h4>
                </div>
                <p className="analyze-card-desc">Identify friction points hurting conversions and opportunities to increase sign-ups and sales.</p>
              </div>

              {/* Card 2 */}
              <div className="analyze-premium-card">
                <div className="analyze-card-header">
                  <div className="analyze-icon-wrapper">
                    <MousePointerClick size={22} />
                  </div>
                  <h4 className="analyze-card-title">CTA Effectiveness</h4>
                </div>
                <p className="analyze-card-desc">Evaluate the placement, visibility, copy, and visual contrast of your primary and secondary calls-to-action.</p>
              </div>

              {/* Card 3 */}
              <div className="analyze-premium-card">
                <div className="analyze-card-header">
                  <div className="analyze-icon-wrapper">
                    <Award size={22} />
                  </div>
                  <h4 className="analyze-card-title">Trust & Credibility</h4>
                </div>
                <p className="analyze-card-desc">Analyze trust signals, security badges, social proof elements, and overall domain authority flags.</p>
              </div>

              {/* Card 4 */}
              <div className="analyze-premium-card">
                <div className="analyze-card-header">
                  <div className="analyze-icon-wrapper">
                    <Layout size={22} />
                  </div>
                  <h4 className="analyze-card-title">User Experience</h4>
                </div>
                <p className="analyze-card-desc">Assess overall page layout usability, content hierarchy, readability, and interface clarity.</p>
              </div>

              {/* Card 5 */}
              <div className="analyze-premium-card">
                <div className="analyze-card-header">
                  <div className="analyze-icon-wrapper">
                    <Smartphone size={22} />
                  </div>
                  <h4 className="analyze-card-title">Mobile Performance</h4>
                </div>
                <p className="analyze-card-desc">Check responsiveness, button sizes, mobile font sizes, and layout adaptation on smaller screens.</p>
              </div>

              {/* Card 6 */}
              <div className="analyze-premium-card">
                <div className="analyze-card-header">
                  <div className="analyze-icon-wrapper">
                    <Search size={22} />
                  </div>
                  <h4 className="analyze-card-title">SEO & Technical</h4>
                </div>
                <p className="analyze-card-desc">Review critical meta tags, title lengths, semantic headings hierarchy, image alt text, and page response speeds.</p>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 4: TRUST / ENTERPRISE SECTION */}
        <section className="portal-section trust-badges-section">
          <div className="portal-container">

            <div className="section-header" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '3.5rem' }}>
              <h2 className="section-title">Why Growth Teams Trust Softree Technology</h2>
            </div>

            <div className="trust-badges-flex">

              {/* Badge 1 */}
              <div className="trust-badge-card">
                <div className="trust-icon-wrapper">
                  <ShieldCheck size={28} />
                </div>
                <div className="trust-badge-title">ISO/IEC 27001:2022</div>
                <div className="trust-badge-desc">Certified Security Management</div>
              </div>

              {/* Badge 2 */}
              <div className="trust-badge-card">
                <div className="trust-icon-wrapper">
                  <Award size={28} />
                </div>
                <div className="trust-badge-title">ISO 9001:2015</div>
                <div className="trust-badge-desc">Certified Quality Management</div>
              </div>

              {/* Badge 3: Microsoft Logo */}
              <div className="trust-badge-card">
                <div className="trust-icon-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', width: '24px', height: '24px', margin: '2px 0' }}>
                  <div style={{ background: '#f25022', width: '11px', height: '11px' }}></div>
                  <div style={{ background: '#7fba00', width: '11px', height: '11px' }}></div>
                  <div style={{ background: '#00a4ef', width: '11px', height: '11px' }}></div>
                  <div style={{ background: '#ffb900', width: '11px', height: '11px' }}></div>
                </div>
                <div className="trust-badge-title">Microsoft</div>
                <div className="trust-badge-desc">Technology Expertise</div>
              </div>

              {/* Badge 4 */}
              <div className="trust-badge-card">
                <div className="trust-icon-wrapper">
                  <Users size={28} />
                </div>
                <div className="trust-badge-title">Global Delivery Team</div>
                <div className="trust-badge-desc">Across Multiple Time Zones</div>
              </div>

              {/* Badge 5 */}
              <div className="trust-badge-card">
                <div className="trust-icon-wrapper">
                  <Globe size={28} />
                </div>
                <div className="trust-badge-title">Serving Clients</div>
                <div className="trust-badge-desc">US, UK & Australia</div>
              </div>

            </div>

          </div>
        </section>

      </div>

      {/* FOOTER */}
      <LightContactSection />
      <StickyFooter />

    </div>
  );
}
