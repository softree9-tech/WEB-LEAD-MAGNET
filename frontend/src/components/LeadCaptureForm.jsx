import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Sparkles, Loader2, Clock, CreditCard, FileText, Lock, AlertCircle } from 'lucide-react';

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
  const [domainError, setDomainError] = useState(null);

  // ── Domain validation helper ──────────────────────────────────────────
  const extractRootDomain = (input) => {
    try {
      let hostname = input.trim().toLowerCase();
      // Remove protocol
      hostname = hostname.replace(/^https?:\/\//i, '');
      // Remove path, query, hash
      hostname = hostname.split('/')[0].split('?')[0].split('#')[0];
      // Remove port
      hostname = hostname.split(':')[0];
      // Remove www prefix
      hostname = hostname.replace(/^www\./, '');
      // Extract root domain (last two parts, e.g. "softreetechnology.com")
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
    const email = formData.email.trim();
    const website = formData.website.trim();
    if (!email || !website || !email.includes('@')) return null;

    const emailDomain = email.split('@')[1]?.toLowerCase() || '';
    if (PUBLIC_PROVIDERS.includes(emailDomain)) {
      return 'Please use your company business email address. Public email providers (Gmail, Yahoo, etc.) are not accepted.';
    }

    const emailRoot = extractRootDomain(emailDomain);
    const websiteRoot = extractRootDomain(website);

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
    if (name === 'email') setDomainError(null);
  };

  const handleWebsiteChange = (e) => {
    setIsWebsiteManuallyEdited(true);
    setFormData(prev => ({ ...prev, website: e.target.value }));
    setDomainError(null);
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

    // ── Domain match validation ──────────────────────────────────────
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

    onSubmit({ ...formData, recaptchaToken });
  };

  return (
    <div className="form-card-glass animate-fade-in">
      <div className="form-header">
        <div className="form-header-badge">
          <Sparkles size={24} />
        </div>
        <h2 className="form-title">
          Generate Your AI Performance Audit
        </h2>
        <p className="form-description">
          Designed for growth-focused businesses, this AI-powered audit delivers strategic insights into your website’s conversion performance, digital credibility, and customer acquisition readiness.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-inputs-group">
          {/* Full Name Field */}
          <div className="input-field-container">
            <label className="input-label-text" htmlFor="fullName">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
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
                className="input-field-custom"
                placeholder="e.g. Sarah Jenkins"
              />
            </div>
          </div>

          {/* Website URL Field */}
          <div className="input-field-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label-text" htmlFor="website">Website URL to Analyze</label>
              {!isWebsiteManuallyEdited && formData.email && (
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
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleWebsiteChange}
                onBlur={() => handleBlur('website')}
                className="input-field-custom"
                placeholder="https://yourwebsite.com/landing-page"
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
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className="input-field-custom"
                placeholder="name@company.com"
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
            <Clock size={14} />
            <span>Get report within minutes</span>
          </div>
          <div className="form-inline-benefit-item">
            <CreditCard size={14} />
            <span>No credit card</span>
          </div>
          <div className="form-inline-benefit-item">
            <FileText size={14} />
            <span>PDF delivered instantly</span>
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
              Generating Audit...
            </>
          ) : (
            <>
              <Sparkles size={18} className="btn-premium-cta-icon" />
              Generate My Audit
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
