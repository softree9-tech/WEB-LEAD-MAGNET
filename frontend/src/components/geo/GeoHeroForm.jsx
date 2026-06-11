import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Mail, Clock, CreditCard, FileText, AlertTriangle, User } from 'lucide-react';

export default function GeoHeroForm({ onSubmit, loading }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [domainWarning, setDomainWarning] = useState('');
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
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
          callback: (token) => {
            setRecaptchaToken(token);
            setErrors(p => ({ ...p, recaptcha: '' }));
          },
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

  const validateName = (v) => {
    if (!v) return 'Full Name is required';
    return '';
  };

  const validateUrl = (v) => {
    if (!v) return 'Website URL is required';
    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
    if (!pattern.test(v)) return 'Please enter a valid website URL';
    return '';
  };

  const validateEmail = (v) => {
    if (!v) return 'Business email is required';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(v)) return 'Please enter a valid email';
    return '';
  };

  const checkDomainMatch = (urlVal, emailVal) => {
    try {
      const urlDomain = urlVal.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
      const emailDomain = emailVal.split('@')[1]?.toLowerCase();
      if (emailDomain && urlDomain && !urlDomain.includes(emailDomain) && !emailDomain.includes(urlDomain.split('.')[0])) {
        setDomainWarning('Email domain does not match website domain');
      } else {
        setDomainWarning('');
      }
    } catch { setDomainWarning(''); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    const nameErr = validateName(name);
    const urlErr = validateUrl(url);
    const emailErr = validateEmail(email);
    const recaptchaErr = !recaptchaToken ? 'Please verify that you are not a robot.' : '';
    if (nameErr || urlErr || emailErr || recaptchaErr) {
      setErrors({ name: nameErr, url: urlErr, email: emailErr, recaptcha: recaptchaErr });
      return;
    }
    setErrors({});
    if (onSubmit) onSubmit({ name, website: url, email, recaptchaToken });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="geo-glass p-7 relative overflow-hidden"
      style={{ borderColor: 'rgba(255,88,18,0.12)', animation: 'geo-border-glow 4s ease-in-out infinite' }}
    >
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent rounded-full" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Field */}
        <div>
          <label className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-2">
            <User size={14} className="text-orange-500" />
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
            placeholder="e.g. Sarah Jenkins"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-xl bg-geo-bg-deep border text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-muted focus:border-orange-500/40 focus:shadow-[0_0_0_3px_rgba(255,88,18,0.06)] disabled:opacity-50 ${errors.name ? 'border-red-500/50' : 'border-border-glass'}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11} />{errors.name}</p>}
        </div>

        {/* URL Field */}
        <div>
          <label className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-2">
            <Globe size={14} className="text-orange-500" />
            Website URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setErrors(p => ({ ...p, url: '' })); checkDomainMatch(e.target.value, email); }}
            placeholder="https://yourwebsite.com"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-xl bg-geo-bg-deep border text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-muted focus:border-orange-500/40 focus:shadow-[0_0_0_3px_rgba(255,88,18,0.06)] disabled:opacity-50 ${errors.url ? 'border-red-500/50' : 'border-border-glass'}`}
          />
          {errors.url && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11} />{errors.url}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-2">
            <Mail size={14} className="text-orange-500" />
            Business Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); checkDomainMatch(url, e.target.value); }}
            placeholder="you@company.com"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-xl bg-geo-bg-deep border text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-muted focus:border-orange-500/40 focus:shadow-[0_0_0_3px_rgba(255,88,18,0.06)] disabled:opacity-50 ${errors.email ? 'border-red-500/50' : 'border-border-glass'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11} />{errors.email}</p>}
          {domainWarning && !errors.email && (
            <p className="text-yellow-600 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle size={11} />{domainWarning}</p>
          )}
        </div>

        {/* reCAPTCHA widget container */}
        <div className="flex justify-center my-2">
          <div ref={recaptchaRef}></div>
        </div>
        {errors.recaptcha && (
          <p className="text-red-500 text-xs text-center flex justify-center items-center gap-1 mt-1">
            <AlertTriangle size={11} />{errors.recaptcha}
          </p>
        )}

        {/* CTA */}
        <motion.button
          type="submit"
          whileHover={loading || !recaptchaToken ? {} : { scale: 1.02 }}
          whileTap={loading || !recaptchaToken ? {} : { scale: 0.98 }}
          disabled={loading || !recaptchaToken}
          className="geo-cta-btn w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              Generate Free GEO Audit
            </>
          )}
        </motion.button>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-5 pt-2">
          {[
            { icon: Clock, text: 'Under 60 seconds' },
            { icon: CreditCard, text: 'No credit card' },
            { icon: FileText, text: 'Detailed report' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-text-muted text-[11px]">
              <Icon size={12} className="text-orange-500/50" />
              {text}
            </div>
          ))}
        </div>
      </form>
    </motion.div>
  );
}
