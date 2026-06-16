import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Globe, Sparkles, Loader2, Clock, CreditCard, FileText, Lock, AlertCircle } from 'lucide-react';

export default function GeoHeroForm({ onSubmit, loading, error }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  
  const [touched, setTouched] = useState({
    name: false,
    url: false,
    email: false
  });

  const [isWebsiteManuallyEdited, setIsWebsiteManuallyEdited] = useState(false);
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [domainError, setDomainError] = useState(null);

  // Domain validation helper
  const extractRootDomain = (input) => {
    try {
      let hostname = input.trim().toLowerCase();
      hostname = hostname.replace(/^https?:\/\//i, '');
      hostname = hostname.split('/')[0].split('?')[0].split('#')[0];
      hostname = hostname.split(':')[0];
      hostname = hostname.replace(/^www\./, '');
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch {
      return '';
    }
  };

  const PUBLIC_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'zoho.com', 'mail.com', 'protonmail.com', 'icloud.com', 'yandex.com',
    'live.com', 'msn.com', 'me.com', 'inbox.com', 'fastmail.com',
    'tutanota.com', 'gmx.com', 'gmx.net'
  ];

  const validateDomainMatch = () => {
    const emailStr = email.trim();
    const websiteStr = url.trim();
    if (!emailStr || !websiteStr || !emailStr.includes('@')) return null;

    const emailDomain = emailStr.split('@')[1]?.toLowerCase() || '';
    if (PUBLIC_PROVIDERS.includes(emailDomain)) {
      return 'Please use your company business email address. Public email providers (Gmail, Yahoo, etc.) are not accepted.';
    }

    const emailRoot = extractRootDomain(emailDomain);
    const websiteRoot = extractRootDomain(websiteStr);

    if (emailRoot && websiteRoot && emailRoot !== websiteRoot) {
      return 'Business email domain must match the submitted website domain.';
    }
    return null;
  };

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

    const emailStr = email.trim();

    if (emailStr && emailStr.includes('@')) {
      const domain = emailStr.split('@')[1];
      if (domain && !PUBLIC_PROVIDERS.includes(domain.toLowerCase())) {
        setUrl(`https://${domain}`);
        return;
      }
    }

    setUrl('');
  }, [email, isWebsiteManuallyEdited]);

  const handleWebsiteChange = (e) => {
    setIsWebsiteManuallyEdited(true);
    setUrl(e.target.value);
    setDomainError(null);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (!name || !email || !url) return;

    const domainValidationError = validateDomainMatch();
    if (domainValidationError) {
      setDomainError(domainValidationError);
      return;
    }
    setDomainError(null);

    if (!recaptchaToken) {
      alert("Please verify that you are not a robot.");
      return;
    }

    if (onSubmit) onSubmit({ name, website: url, email, recaptchaToken });
  };

  return (
    <div className="form-card-glass animate-fade-in">
      <div className="form-header">
        <div className="form-header-badge">
          <Sparkles size={24} />
        </div>
        <h2 className="form-title">
          Generate Your GEO Audit
        </h2>
        <p className="form-description">
          Designed for growth-focused businesses, this AI-powered audit delivers strategic insights into your website's visibility across ChatGPT, Gemini, and Perplexity.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-inputs-group">
          {/* Full Name Field */}
          <div className="input-field-container">
            <label className="input-label-text" htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <User size={18} />
              </span>
              <input
                required
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                className="input-field-custom"
                placeholder="e.g. Sarah Jenkins"
                disabled={loading}
              />
            </div>
          </div>

          {/* Website URL Field */}
          <div className="input-field-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label-text" htmlFor="url">Website URL to Analyze</label>
              {!isWebsiteManuallyEdited && email && (
                <span className="auto-derived-indicator">
                  Auto-derived
                </span>
              )}
            </div>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Globe size={18} />
              </span>
              <input
                required
                id="url"
                name="url"
                type="url"
                value={url}
                onChange={handleWebsiteChange}
                onBlur={() => handleBlur('url')}
                className="input-field-custom"
                placeholder="https://yourwebsite.com/landing-page"
                disabled={loading}
              />
            </div>
          </div>

          {/* Business Email Field */}
          <div className="input-field-container">
            <label className="input-label-text" htmlFor="email">Business Email</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Mail size={18} />
              </span>
              <input
                required
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setDomainError(null); }}
                onBlur={() => handleBlur('email')}
                className="input-field-custom"
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* reCAPTCHA widget container */}
        <div className="recaptcha-center">
          <div ref={recaptchaRef}></div>
        </div>

        {(error || domainError) && (
          <div className="form-error-banner">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px', color: '#ef4444' }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                  {domainError ? 'Domain Validation Failed' : 'Validation Error'}
                </div>
                <div style={{ opacity: 0.9 }}>{domainError || error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Inline Benefits Row */}
        <div className="form-inline-benefits">
          <div className="form-inline-benefit-item">
            <Clock size={14} color="#FF7A00" />
            <span>Under 60 seconds</span>
          </div>
          <div className="form-inline-benefit-item">
            <CreditCard size={14} color="#FF7A00" />
            <span>No credit card</span>
          </div>
          <div className="form-inline-benefit-item">
            <FileText size={14} color="#FF7A00" />
            <span>Detailed report</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          type="submit" 
          className="btn-premium-cta" 
          disabled={loading || !recaptchaToken}
        >
          {loading ? (
            <>
              <Loader2 className="spinning" size={18} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={18} className="btn-premium-cta-icon" />
              Generate Free GEO Audit
            </>
          )}
        </button>

        {/* Privacy Note */}
        <div className="form-privacy-text">
          <Lock size={12} />
          <span>We respect your privacy. No spam, ever.</span>
        </div>
      </form>
    </div>
  );
}
