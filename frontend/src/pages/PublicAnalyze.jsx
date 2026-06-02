import React, { useState, useEffect } from 'react';
import LeadCaptureForm from '../components/LeadCaptureForm';
import LeadResults from '../components/LeadResults';
import { processSingleLead, validateWebsite } from '../api/api';
import { Sparkles, ArrowLeft, ShieldCheck, Cpu, Zap, BarChart2 } from 'lucide-react';
import '../PublicPortal.css';

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
    if (!started) {
      return (
        <div className="public-portal-theme">
          <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
            <div className="glass-card animate-fade-in" style={{
              padding: '3.5rem 2.5rem',
              maxWidth: '550px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(255, 122, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF7A00',
                border: '1px solid rgba(255, 122, 0, 0.25)',
                boxShadow: '0 0 20px rgba(255, 122, 0, 0.1)'
              }}>
                <ShieldCheck size={36} />
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                  Analysis Complete!
                </h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Our AI agents successfully scanned <strong style={{ color: '#fff' }}>{result.website.replace(/^https?:\/\/(www\.)?/, '')}</strong>.<br />
                  We identified critical conversion opportunities, SEO visibility gaps, and trust decay metrics.
                </p>
              </div>

              <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#FF7A00' }}>✓</span>
                  <span style={{ color: 'var(--text-gray)' }}>Domain verified & parsed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#FF7A00' }}>✓</span>
                  <span style={{ color: 'var(--text-gray)' }}>AI Conversion Strategy compiled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#FF7A00' }}>✓</span>
                  <span style={{ color: 'var(--text-gray)' }}>Search Visibility report prepared</span>
                </div>
              </div>

              <button 
                onClick={() => setStarted(true)} 
                className="premium-btn-orange" 
                style={{ 
                  width: '100%',
                  fontSize: '1.1rem'
                }}
              >
                <Sparkles size={18} />
                Get Started
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="public-portal-theme" style={{ display: 'block', minHeight: '100vh', backgroundAttachment: 'fixed' }}>
        <div className="app-container" style={{ padding: '2rem 1rem', maxWidth: '1400px' }}>
          <header className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge-orange" style={{ marginBottom: '6px' }}>
                <ShieldCheck size={14} />
                Analysis Completed
              </div>
              <h1 style={{ 
                fontSize: '2.25rem', 
                background: 'linear-gradient(135deg, #fff, #94a3b8)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                fontWeight: 800 
              }}>
                Audit for {result.website.replace(/^https?:\/\/(www\.)?/, '')}
              </h1>
            </div>
            <button 
              onClick={handleReset} 
              className="action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} />
              Analyze Another URL
            </button>
          </header>

          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <LeadResults leads={[result]} isPublic={true} />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="public-portal-theme">
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <div className="glass-card animate-fade-in" style={{
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
            <div className="scanning-beam" />

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
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <div className="glass-card animate-fade-in" style={{
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
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <header className="header animate-fade-in" style={{ marginBottom: '3.5rem' }}>
          <div className="badge-orange" style={{ marginBottom: '1.25rem' }}>
            <Sparkles size={13} />
            AI Growth Intelligence
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.25rem', background: 'linear-gradient(135deg, #ffffff 65%, #ff7a00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
            AI-Powered Website Intelligence for Scalable Growth
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.7, fontWeight: 400 }}>
            Built for modern growth teams and business leaders, our AI-powered audit platform delivers strategic website intelligence designed to improve conversions, strengthen digital trust, and accelerate inbound revenue performance.
          </p>
        </header>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <LeadCaptureForm onSubmit={handleSubmit} loading={loading || validating} error={error} />
        </div>
      </div>
    </div>
  );
}
