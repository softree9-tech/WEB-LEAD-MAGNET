import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Mail, Clock, CreditCard, FileText, AlertTriangle } from 'lucide-react';

export default function GeoHeroForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [domainWarning, setDomainWarning] = useState('');

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
    const urlErr = validateUrl(url);
    const emailErr = validateEmail(email);
    if (urlErr || emailErr) {
      setErrors({ url: urlErr, email: emailErr });
      return;
    }
    setErrors({});
    if (onSubmit) onSubmit({ website: url, email });
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

        {/* CTA */}
        <motion.button
          type="submit"
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          disabled={loading}
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
