import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeadCaptureForm from '../components/LeadCaptureForm';
import LeadResults, { exportToExcel } from '../components/LeadResults';
import { processSingleLead, validateWebsite } from '../api/api';
import Logo from '../components/Logo';
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
  RefreshCw
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

  const handleSubmit = async (formData) => {
    setError(null);

    // ── Step 1: Pre-flight website validation ───────────────────────────
    setValidating(true);
    try {
      const validation = await validateWebsite(formData.website);
      if (!validation.valid) {
        setError(validation.error);
        setValidating(false);
        return;
      }
    } catch (err) {
      setError('Unable to verify the website. Please check the URL and try again.');
      setValidating(false);
      return;
    }
    setValidating(false);

    // ── Step 2: Run full AI analysis ────────────────────────────────────
    setLoading(true);
    setLoadingStep(0);

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        website: formData.website,
        recaptcha_token: formData.recaptchaToken
      };

      const data = await processSingleLead(payload);
      const processed = data.output_row || data;
      setResult(processed);
    } catch (err) {
      console.error("Analysis failed:", err);
      const detail = err.response?.data?.detail || err.message || "An unexpected error occurred during the analysis.";
      setError(detail);
    } finally {
      setLoading(false);
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
          <div className="portal-navbar">
            <Link to="/" className="portal-logo-container">
              <Logo />
            </Link>
            <div className="portal-nav-badge" style={{ cursor: 'default' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-orange)' }} />
              AI Intelligence Report
            </div>
          </div>

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
        <div className="portal-navbar">
          <Link to="/" className="portal-logo-container">
            <Logo />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={handleReset} 
              className="portal-nav-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                background: 'transparent'
              }}
            >
              <ArrowLeft size={14} />
              New Analysis
            </button>
          </div>
        </div>

        <div className="portal-container" style={{ padding: '0 2rem 4rem', maxWidth: '1400px' }}>
          
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
                Presence Score: <strong style={{ color: '#fff' }}>{result.first_impression_score || 0}/10</strong>
              </span>
            </div>
            <div className="exec-actions-right">
              <button className="action-btn" onClick={() => window.location.reload()}>
                <RefreshCw size={14} /> Recalculate
              </button>
              <button className="action-btn primary" onClick={() => {
                const filename = `executive_report_${cleanDomain.replace(/[/.]/g, '_')}.xlsx`;
                exportToExcel([result], filename, true);
              }}>
                <Download size={14} /> Download Report
              </button>
            </div>
          </div>

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
        <div className="portal-navbar">
          <Link to="/" className="portal-logo-container">
            <Logo />
          </Link>
          <div className="portal-nav-badge" style={{ cursor: 'default' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-orange)' }} />
            Lead Engine Portal
          </div>
        </div>

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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff', lineHeight: 1.4 }}>
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
        <div className="portal-navbar">
          <Link to="/" className="portal-logo-container">
            <Logo />
          </Link>
          <div className="portal-nav-badge" style={{ cursor: 'default' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-orange)' }} />
            Lead Engine Portal
          </div>
        </div>

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
      <nav className="portal-navbar">
        <Link to="/" className="portal-logo-container">
          <Logo />
        </Link>
        <div className="portal-nav-badge" style={{ cursor: 'default' }}>
          <ShieldCheck size={14} style={{ marginRight: '6px' }} />
          Lead Engine Portal
        </div>
      </nav>

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
                AI-Powered Website Intelligence for <span className="highlight-orange">Scalable Growth</span>
              </h1>
              <p className="hero-subtitle">
                Built for modern growth teams and business leaders, our AI-powered audit platform delivers strategic website intelligence designed to improve conversions, strengthen digital trust, and accelerate inbound revenue performance.
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
                  <p className="benefit-desc">Get your audit report in under 60 seconds</p>
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
            
            <div className="section-header">
              <h2 className="section-title">See a Sample Audit Report</h2>
              <p className="section-subtitle">Here’s a preview of the insights you’ll receive after analyzing your page.</p>
            </div>

            {/* Dashboard Mockup Frame */}
            <div className="mock-dashboard-frame">
              
              {/* Sidebar */}
              <aside className="mock-sidebar">
                <div>
                  <div className="mock-sidebar-brand">
                    <div className="mock-brand-title">SOFTREE</div>
                    <div className="mock-brand-sub">TECHNOLOGY</div>
                  </div>

                  <div className="mock-audit-meta">
                    <div className="mock-meta-label">Audit Report</div>
                    <div className="mock-meta-value" title="https://example.com/landing">https://example.com/landing</div>
                  </div>

                  <nav className="mock-sidebar-nav">
                    <div className="mock-nav-item active">
                      <LayoutGrid size={15} />
                      <span>Overview</span>
                    </div>
                    <div className="mock-nav-item">
                      <AlertTriangle size={15} />
                      <span>Top Issues</span>
                    </div>
                    <div className="mock-nav-item">
                      <TrendingUp size={15} />
                      <span>Opportunities</span>
                    </div>
                    <div className="mock-nav-item">
                      <FileText size={15} />
                      <span>Detailed Analysis</span>
                    </div>
                    <div className="mock-nav-item">
                      <Sparkles size={15} />
                      <span>Recommendations</span>
                    </div>
                    <div className="mock-nav-item">
                      <Code size={15} />
                      <span>Technical Insights</span>
                    </div>
                  </nav>
                </div>
              </aside>

              {/* Main Panel Content */}
              <main className="mock-main-content">
                
                {/* Top Row Grid */}
                <div className="mock-cards-grid-3">
                  
                  {/* Card 1: Conversion Score */}
                  <div className="mock-report-card">
                    <div className="mock-report-card-title-row">
                      <span className="mock-report-card-title">Conversion Score</span>
                    </div>
                    <div className="mock-score-content">
                      <div className="mock-score-number-group">
                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                          <span className="mock-score-big">72</span>
                          <span className="mock-score-total">/100</span>
                        </div>
                        <span className="mock-score-status">Good</span>
                      </div>
                      <div className="mock-score-ring">
                        <svg className="mock-score-circle-svg">
                          <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255, 122, 0, 0.08)" strokeWidth="5" />
                          <circle cx="35" cy="35" r="28" fill="none" stroke="#FF7A00" strokeWidth="5" strokeDasharray="175.9" strokeDashoffset="49.25" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Top Issues Found */}
                  <div className="mock-report-card">
                    <div className="mock-report-card-title-row">
                      <span className="mock-report-card-title">Top Issues Found</span>
                      <span className="mock-critical-badge">3 Critical</span>
                    </div>
                    <div className="mock-issues-list">
                      <div className="mock-issue-item">
                        <AlertTriangle size={12} />
                        <span>Missing customer testimonials</span>
                      </div>
                      <div className="mock-issue-item">
                        <AlertTriangle size={12} />
                        <span>Weak CTA placement</span>
                      </div>
                      <div className="mock-issue-item">
                        <AlertTriangle size={12} />
                        <span>Form has too many fields</span>
                      </div>
                    </div>
                    <div className="mock-card-action-link">
                      <span>View all issues</span>
                      <span>→</span>
                    </div>
                  </div>

                  {/* Card 3: Estimated Impact */}
                  <div className="mock-report-card">
                    <div className="mock-report-card-title-row">
                      <span className="mock-report-card-title">Estimated Impact</span>
                    </div>
                    <div>
                      <div className="mock-impact-value">+28%</div>
                      <div className="mock-impact-sub">Potential conversion improvement</div>
                    </div>
                    <div className="mock-impact-graph-container">
                      <svg width="100%" height="100%" viewBox="0 0 240 50" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#FF7A00" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M10 40 L40 43 L70 32 L100 36 L130 18 L160 26 L190 22 L220 8 L220 50 L10 50 Z" fill="url(#chart-glow)" />
                        <path d="M10 40 L40 43 L70 32 L100 36 L130 18 L160 26 L190 22 L220 8" fill="none" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="10" cy="40" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="40" cy="43" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="70" cy="32" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="100" cy="36" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="130" cy="18" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="160" cy="26" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="190" cy="22" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                        <circle cx="220" cy="8" r="3" fill="#FF7A00" stroke="#050505" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>

                </div>

                {/* Bottom Row Grid */}
                <div className="mock-cards-grid-3">
                  
                  {/* Card 4: Key Opportunity Areas */}
                  <div className="mock-report-card">
                    <div className="mock-report-card-title-row">
                      <span className="mock-report-card-title">Key Opportunity Areas</span>
                    </div>
                    <div className="mock-check-list">
                      <div className="mock-check-item">
                        <Check size={13} />
                        <span>Add social proof above the fold</span>
                      </div>
                      <div className="mock-check-item">
                        <Check size={13} />
                        <span>Improve CTA visibility and contrast</span>
                      </div>
                      <div className="mock-check-item">
                        <Check size={13} />
                        <span>Shorten and simplify the form</span>
                      </div>
                      <div className="mock-check-item">
                        <Check size={13} />
                        <span>Clarify value proposition in headline</span>
                      </div>
                    </div>
                    <div className="mock-card-action-link">
                      <span>View all opportunities</span>
                      <span>→</span>
                    </div>
                  </div>

                  {/* Card 5: AI Recommendations */}
                  <div className="mock-report-card">
                    <div className="mock-report-card-title-row">
                      <span className="mock-report-card-title">AI Recommendations</span>
                    </div>
                    <div className="mock-check-list">
                      <div className="mock-recommend-item">
                        <Sparkles size={13} />
                        <span>Add customer testimonials to build trust</span>
                      </div>
                      <div className="mock-recommend-item">
                        <Sparkles size={13} />
                        <span>Move primary CTA above the fold</span>
                      </div>
                      <div className="mock-recommend-item">
                        <Sparkles size={13} />
                        <span>Reduce form fields from 7 to 3</span>
                      </div>
                      <div className="mock-recommend-item">
                        <Sparkles size={13} />
                        <span>Add a sticky CTA for better conversions</span>
                      </div>
                    </div>
                    <div className="mock-card-action-link">
                      <span>View all recommendations</span>
                      <span>→</span>
                    </div>
                  </div>

                  {/* Card 6: Get Full Report Promo */}
                  <div className="mock-report-card promo-card">
                    <div className="mock-promo-icon-wrapper">
                      <FileText size={28} />
                    </div>
                    <div className="mock-promo-title">Get the Full Report</div>
                    <p className="mock-promo-text">
                      Our detailed PDF report includes in-depth analysis, screenshots, and step-by-step recommendations.
                    </p>
                    <div className="mock-promo-btn">
                      <Download size={14} />
                      <span>Download Sample PDF</span>
                    </div>
                    <span className="mock-promo-footer">No email required</span>
                  </div>

                </div>

              </main>

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
      <footer className="portal-footer">
        <div>
          © 2025 Softree Technology. All rights reserved.
        </div>
        <div className="portal-footer-links">
          <a href="#" className="portal-footer-link" onClick={e => e.preventDefault()}>Privacy Policy</a>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <a href="#" className="portal-footer-link" onClick={e => e.preventDefault()}>Terms of Service</a>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <a href="#" className="portal-footer-link" onClick={e => e.preventDefault()}>Contact Us</a>
        </div>
      </footer>

    </div>
  );
}
