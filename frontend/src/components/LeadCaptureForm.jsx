import React, { useState, useEffect } from 'react';
import { User, Briefcase, Building2, Mail, Globe, Sparkles, Loader2 } from 'lucide-react';

export default function LeadCaptureForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    companyName: '',
    email: '',
    website: ''
  });

  const [touched, setTouched] = useState({
    fullName: false,
    title: false,
    companyName: false,
    email: false,
    website: false
  });

  const [isWebsiteManuallyEdited, setIsWebsiteManuallyEdited] = useState(false);
  const recaptchaRef = React.useRef(null);
  const widgetIdRef = React.useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    const renderWidget = () => {
      // Guard: only render once — prevents StrictMode double-mount crash
      if (widgetIdRef.current !== null) return;
      if (!recaptchaRef.current) return;
      // Additional guard: if the container already has an iframe (already rendered by a prior mount cycle)
      if (recaptchaRef.current.childNodes.length > 0) {
        recaptchaRef.current.innerHTML = '';
      }

      try {
        widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          callback: (token) => setRecaptchaToken(token),
          'expired-callback': () => setRecaptchaToken(null),
          'error-callback': () => setRecaptchaToken(null)
        });
      } catch (err) {
        // If render fails (e.g. already rendered), silently ignore
        console.warn("reCAPTCHA render skipped:", err.message);
      }
    };

    // Poll until grecaptcha.render is available, then render once
    const interval = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        clearInterval(interval);
        renderWidget();
      }
    }, 300);

    return () => {
      clearInterval(interval);
      // On unmount, reset the widget so re-mount can render fresh
      if (widgetIdRef.current !== null) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch (_) {}
        widgetIdRef.current = null;
      }
      if (recaptchaRef.current) {
        recaptchaRef.current.innerHTML = '';
      }
      setRecaptchaToken(null);
    };
  }, []);

  // Automatically derive website from email domain or company name if not manually edited
  useEffect(() => {
    if (isWebsiteManuallyEdited) return;

    const email = formData.email.trim();
    const company = formData.companyName.trim();

    if (email && email.includes('@')) {
      const domain = email.split('@')[1];
      const publicProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'zoho.com', 'mail.com', 'protonmail.com', 'icloud.com'];
      
      if (domain && !publicProviders.includes(domain.toLowerCase())) {
        setFormData(prev => ({ ...prev, website: `https://${domain}` }));
        return;
      }
    }

    if (company) {
      const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanCompany) {
        setFormData(prev => ({ ...prev, website: `https://${cleanCompany}.com` }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, website: '' }));
  }, [formData.email, formData.companyName, isWebsiteManuallyEdited]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWebsiteChange = (e) => {
    setIsWebsiteManuallyEdited(true);
    setFormData(prev => ({ ...prev, website: e.target.value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.fullName || !formData.title || !formData.companyName || !formData.email || !formData.website) {
      return;
    }

    if (!recaptchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    onSubmit({ ...formData, recaptchaToken });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '2.5rem',
      maxWidth: '550px',
      width: '100%',
      margin: '0 auto',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(15, 23, 42, 0.65)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.2)',
          marginBottom: '1rem',
          color: 'var(--accent-color)'
        }}>
          <Sparkles size={24} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Analyze Your Lead Magnet
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
          Enter your details below to get an instant AI-powered marketing audit of your website's lead conversion metrics.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label className="input-label" htmlFor="fullName">Full Name</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <User size={18} />
            </span>
            <input
              required
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              className="input-field"
              placeholder="John Doe"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="title">Job Title</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <Briefcase size={18} />
            </span>
            <input
              required
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              className="input-field"
              placeholder="Marketing Director"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div>
            <label className="input-label" htmlFor="companyName">Company Name</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <Building2 size={18} />
              </span>
              <input
                required
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={() => handleBlur('companyName')}
                className="input-field"
                placeholder="Acme Corp"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="email">Business Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} />
            </span>
            <input
              required
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className="input-field"
              placeholder="john@acme.com"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" htmlFor="website">Website URL to Analyze</label>
            {!isWebsiteManuallyEdited && (formData.email || formData.companyName) && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 500 }}>
                Auto-derived
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <Globe size={18} />
            </span>
            <input
              required
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleWebsiteChange}
              onBlur={() => handleBlur('website')}
              className="input-field"
              placeholder="https://acme.com"
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
          <div ref={recaptchaRef}></div>
        </div>

        {error && (
          <div style={{ 
            color: 'var(--error-color)', 
            fontSize: '0.85rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            padding: '10px 14px', 
            borderRadius: '8px',
            marginTop: '0.5rem'
          }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="primary-btn" 
          disabled={loading || !recaptchaToken} 
          style={{ 
            opacity: (loading || !recaptchaToken) ? 0.6 : 1, 
            padding: '12px',
            fontSize: '1rem',
            width: '100%',
            marginTop: '0.5rem',
            cursor: (loading || !recaptchaToken) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <>
              <Loader2 className="spinning" size={18} />
              Analyzing Website...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Website
            </>
          )}
        </button>
      </form>
    </div>
  );
}
