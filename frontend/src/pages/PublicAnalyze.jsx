import React, { useState, useEffect } from 'react';
import LeadCaptureForm from '../components/LeadCaptureForm';
import LeadResults from '../components/LeadResults';
import { processSingleLead } from '../api/api';
import { Sparkles, ArrowLeft, ShieldCheck, Cpu, Zap, BarChart2 } from 'lucide-react';

export default function PublicAnalyze() {
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        company: formData.companyName,
        role: formData.title,
        website: formData.website,
        recaptcha_token: formData.recaptchaToken
      };

      const data = await processSingleLead(payload);
      const processed = data.output_row || data;
      setResult(processed);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.response?.data?.detail || err.message || "An unexpected error occurred during the analysis.");
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
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <div className="glass-panel animate-fade-in" style={{
            padding: '3.5rem 2.5rem',
            maxWidth: '550px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={36} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                Analysis Complete!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Our AI agents successfully scanned <strong style={{ color: '#fff' }}>{result.website.replace(/^https?:\/\/(www\.)?/, '')}</strong>.<br />
                We identified critical conversion opportunities, SEO visibility gaps, and trust decay metrics.
              </p>
            </div>

            <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>Domain verified & parsed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>AI Conversion Strategy compiled</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>Search Visibility report prepared</span>
              </div>
            </div>

            <button 
              onClick={() => setStarted(true)} 
              className="primary-btn" 
              style={{ 
                padding: '14px 28px',
                fontSize: '1.1rem',
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={18} />
              Get Started
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-container" style={{ padding: '2rem 1rem', maxWidth: '1400px' }}>
        <header className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              Analysis Completed
            </div>
            <h1 style={{ 
              fontSize: '2rem', 
              background: 'linear-gradient(135deg, #fff, #94a3b8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: 700 
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
              padding: '8px 16px',
              fontSize: '0.875rem',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
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
    );
  }

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{
          padding: '3.5rem 2.5rem',
          maxWidth: '500px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Animated Scanning Circle */}
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <div className="spinning" style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '3px solid rgba(59, 130, 246, 0.1)',
              borderTopColor: 'var(--accent-color)',
              position: 'absolute',
              top: 0,
              left: 0
            }} />
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.9)',
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-color)'
            }}>
              <Cpu size={32} className="animate-pulse" />
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>
              Analyzing Website Conversion Potential
            </h3>
            
            {/* Custom progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{
                height: '100%',
                width: `${((loadingStep + 1) / loadingSteps.length) * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                transition: 'width 0.5s ease',
                borderRadius: '3px'
              }} />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loadingSteps[loadingStep]}
            </p>
          </div>

          {/* Micro-features showing analysis parameters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Zap size={14} color="#eab308" />
              <span>Performance</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <BarChart2 size={14} color="#10b981" />
              <span>SEO Audit</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#3b82f6" />
              <span>Trust signals</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '90vh', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <header className="header animate-fade-in" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          <Sparkles size={13} />
          Lead Engine Portal
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Scan & Optimize Your Conversion Rates
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Run your company website through our multi-agent AI scanning system. Discover missing call-to-actions, SEO bottlenecks, and trust decay issues instantly.
        </p>
      </header>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <LeadCaptureForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
}
