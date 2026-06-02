import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Sparkles, Loader2 } from 'lucide-react';

export default function LeadCaptureForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    website: ''
  });

  const [touched, setTouched] = useState({
    fullName: false,
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
      if (widgetIdRef.current !== null) return;
      if (!recaptchaRef.current) return;
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

  // Automatically derive website from email domain if not manually edited
  useEffect(() => {
    if (isWebsiteManuallyEdited) return;

    const email = formData.email.trim();

    if (email && email.includes('@')) {
      const domain = email.split('@')[1];
      const publicProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'zoho.com', 'mail.com', 'protonmail.com', 'icloud.com'];
      
      if (domain && !publicProviders.includes(domain.toLowerCase())) {
        setFormData(prev => ({ ...prev, website: `https://${domain}` }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, website: '' }));
  }, [formData.email, isWebsiteManuallyEdited]);

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
    if (!formData.fullName || !formData.email || !formData.website) {
      return;
    }

    if (!recaptchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    onSubmit({ ...formData, recaptchaToken });
  };

  return (
    <div className="glass-card animate-fade-in" style={{
      padding: '3rem 2.5rem',
      maxWidth: '550px',
      width: '100%',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'rgba(255, 122, 0, 0.08)', 
          border: '1px solid rgba(255, 122, 0, 0.25)',
          marginBottom: '1.25rem',
          color: '#FF7A00',
          boxShadow: '0 0 20px rgba(255, 122, 0, 0.1)'
        }}>
          <Sparkles size={26} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Generate Your AI Performance Audit
        </h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.925rem', lineHeight: 1.6 }}>
          Designed for growth-focused businesses, this AI-powered audit delivers strategic insights into your website’s conversion performance, digital credibility, and customer acquisition readiness.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="premium-input-wrapper">
          <label className="premium-input-label" htmlFor="fullName">Full Name</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', display: 'flex', alignItems: 'center' }}>
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
              className="premium-input-field"
              placeholder="e.g. Sarah Jenkins"
            />
          </div>
        </div>

        <div className="premium-input-wrapper">
          <label className="premium-input-label" htmlFor="email">Business Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', display: 'flex', alignItems: 'center' }}>
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
              className="premium-input-field"
              placeholder="e.g. sarah@company.com"
            />
          </div>
        </div>

        <div className="premium-input-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="premium-input-label" htmlFor="website">Website URL to Analyze</label>
            {!isWebsiteManuallyEdited && formData.email && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Auto-derived
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)', display: 'flex', alignItems: 'center' }}>
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
              className="premium-input-field"
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
          <div ref={recaptchaRef}></div>
        </div>

        {error && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '0.85rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.25)', 
            padding: '12px 16px', 
            borderRadius: '10px',
            lineHeight: 1.5
          }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="premium-btn-orange" 
          disabled={loading || !recaptchaToken} 
          style={{ 
            width: '100%',
            marginTop: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <Loader2 className="spinning" size={18} />
              Generating Audit...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Your Audit
            </>
          )}
        </button>
      </form>
    </div>
  );
}
