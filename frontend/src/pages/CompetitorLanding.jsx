import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle,
  CheckCircle2,
  Building,
  Target,
  Globe,
  ShieldCheck,
  TrendingUp,
  Download,
  BarChart2,
  Lock,
  Clock,
  FileText,
  CreditCard,
  ChevronDown,
  User,
  Mail,
  Zap,
  Activity,
  Award,
  Search,
  Loader2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import StickyFooter from '../components/StickyFooter';
import LightContactSection from '../components/LightContactSection';
import CompetitorDashboard from '../components/competitor/CompetitorDashboard';
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
import '../geo.css'; // Reuse existing styles
import '../PublicPortal.css';

// ── CUSTOM COMPONENTS ───────────────────────────────────────

function CompetitorForm({ onSubmit, loading, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [localError, setLocalError] = useState(null);

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
        try { window.grecaptcha.reset(widgetIdRef.current); } catch (_) { }
        widgetIdRef.current = null;
      }
      setRecaptchaToken(null);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    if (loading) return;
    if (!name || !email || !url || !competitorUrl) return;

    if (!recaptchaToken) {
      setLocalError("Please verify that you are not a robot.");
      return;
    }

    try {
      const emailDomain = email.split('@')[1].toLowerCase();
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      let urlDomain = urlObj.hostname.toLowerCase();
      if (urlDomain.startsWith('www.')) {
        urlDomain = urlDomain.substring(4);
      }

      if (emailDomain !== urlDomain) {
        setLocalError("Business email domain must match your website domain.");
        return;
      }
    } catch (err) {
      setLocalError("Please enter a valid website URL.");
      return;
    }

    if (onSubmit) onSubmit({ name, websiteUrl: url, competitorUrl, email, recaptchaToken });
  };

  const inputStyle = {
    height: '35px',
    borderRadius: '18px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8EAF0',
    color: '#0A0F3C',
    fontSize: '1rem',
    paddingLeft: '3.5rem',
    width: '100%',
    boxShadow: '0 4px 14px rgba(255, 107, 0, 0.04)',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const iconStyle = {
    position: 'absolute',
    left: '1.25rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#5F6475'
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>

        {/* Row 1: Full Name, Business Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} style={iconStyle} />
            <input required id="comp-name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Full Name" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
          </div>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={iconStyle} />
            <input required id="comp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="Business Email" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
          </div>
        </div>

        {/* Row 2: Your Website */}
        <div style={{ position: 'relative' }}>
          <Globe size={20} style={iconStyle} />
          <input required id="comp-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} placeholder="Your Website (https://yourwebsite.com)" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
        </div>

        {/* Row 3: Centered divider with VS badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8EAF0' }}></div>
          <div style={{ margin: '0 1rem', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F8F9FC', border: '1px solid #E8EAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0F3C', fontWeight: 800, fontSize: '0.85rem' }}>
            VS
          </div>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E8EAF0' }}></div>
        </div>

        {/* Row 4: Competitor Website */}
        <div style={{ position: 'relative' }}>
          <Target size={20} style={iconStyle} />
          <input required id="comp-competitor-url" type="url" value={competitorUrl} onChange={(e) => setCompetitorUrl(e.target.value)} style={inputStyle} placeholder="Competitor Website (https://competitor.com)" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
        </div>

        {(error || localError) && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Analysis Error</div>
              <div style={{ fontSize: '0.85rem' }}>{error || localError}</div>
            </div>
          </div>
        )}

        {/* RECAPTCHA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
          <div ref={recaptchaRef}></div>
        </div>

        {/* BUTTON */}
        <button type="submit" disabled={loading || !recaptchaToken} style={{ height: '50px', width: '100%', borderRadius: '12px', background: 'linear-gradient(135deg, #FF8A3D 0%, #FF6B00 100%)', color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: (loading || !recaptchaToken) ? 'not-allowed' : 'pointer', opacity: (loading || !recaptchaToken) ? 0.7 : 1, transition: 'all 0.3s ease', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.2)' }} className="hover:shadow-lg hover:-translate-y-0.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Analyzing...' : 'Generate AI Gap Report'}
        </button>
      </form>

      {/* INLINE BENEFITS ROW */}
      <div style={{ width: '100%', marginTop: '0.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderTop: '1px solid #E8EAF0', borderBottom: '1px solid #E8EAF0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="#FF6B00" />
          <span style={{ fontSize: '0.9rem', color: '#5F6475', fontWeight: 500 }}>Get report within minutes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} color="#FF6B00" />
          <span style={{ fontSize: '0.9rem', color: '#5F6475', fontWeight: 500 }}>No credit card</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="#FF6B00" />
          <span style={{ fontSize: '0.9rem', color: '#5F6475', fontWeight: 500 }}>Email full report</span>
        </div>
      </div>
    </div>
  );
}

function ReportCarousel() {
  const slides = [
    { name: 'Executive Summary', image: '/reports/executive-summary.png' },
    { name: 'Website Experience', image: '/reports/website-experience.png' },
    { name: 'Service Portfolio', image: '/reports/service-portfolio.png' },
    { name: 'Trust & Credibility', image: '/reports/trust-credibility.png' },
    { name: 'SEO & GEO Analysis', image: '/reports/seo-geo-analysis.png' },
    { name: 'Content & Engagement', image: '/reports/content-engagement.png' },
    { name: 'Lead Generation', image: '/reports/lead-generation.png' },
    { name: 'AI Recommendations', image: '/reports/ai-recommendations.png' }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '16px', boxShadow: '0 12px 40px rgba(10, 15, 60, 0.08)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid #E9EDF5', background: '#F8F9FC' }}>
        <div style={{ fontWeight: 800, color: '#0A0F3C' }}>COMPETITIVE INTELLIGENCE</div>
        <div style={{ fontWeight: 600, color: '#FF6B00', fontSize: '0.9rem' }}>
          {slides[currentSlide].name} <span style={{ color: '#5F6475' }}>({currentSlide + 1}/{slides.length})</span>
        </div>
      </div>
      <div style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', padding: '2rem' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide].image}
            alt={slides[currentSlide].name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', minHeight: '400px', height: 'auto', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', border: '1px solid #E9EDF5', backgroundColor: '#FFFFFF' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{ display: 'none', width: '100%', height: '500px', border: '2px dashed #E9EDF5', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: '#5F6475', fontSize: '1.2rem', fontWeight: 600, backgroundColor: '#FFFFFF' }}>
            Missing Image: {slides[currentSlide].image}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SimpleStatCard({ value, description }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E9EDF5',
      borderRadius: '16px',
      padding: '3.5rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '1.25rem',
      transition: 'all 0.3s ease',
    }}
      className="hover:-translate-y-1 hover:shadow-lg"
    >
      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#FF6B00', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <p style={{ color: '#5F6475', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

// ─── FULL-SCREEN LOADER ───────────────────────────────────────────────────────
function CompetitorLoader({ primaryUrl, competitorUrl, progress }) {
  const steps = [
    { label: "Validating websites", threshold: 10 },
    { label: "Discovering company profile", threshold: 20 },
    { label: "Comparing service portfolio", threshold: 30 },
    { label: "Mapping industry focus", threshold: 40 },
    { label: "Evaluating trust signals", threshold: 50 },
    { label: "Measuring SEO performance", threshold: 60 },
    { label: "Measuring AI Visibility", threshold: 70 },
    { label: "Comparing lead generation", threshold: 80 },
    { label: "Reviewing content strategy", threshold: 85 },
    { label: "Generating executive recommendations", threshold: 95 },
    { label: "Preparing executive report", threshold: 100 }
  ];

  const aiThoughts = [
    "Identifying Microsoft ecosystem services...",
    "Detecting trust indicators...",
    "Comparing enterprise positioning...",
    "Evaluating AI search readiness...",
    "Analyzing historical content footprints...",
    "Generating strategic recommendations..."
  ];

  const modules = [
    "Website Experience", "Service Portfolio", "Trust Signals", "SEO", "AI Visibility", "Content Strategy", "Lead Generation"
  ];

  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [moduleIndex, setModuleIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setThoughtIndex(prev => (prev + 1) % aiThoughts.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setModuleIndex(prev => (prev + 1) % modules.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const timeRemaining = Math.max(0, Math.ceil(((100 - progress) / 100) * 18));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>

      {/* Subtle Background Grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(#0A0F3C 1px, transparent 1px), linear-gradient(90deg, #0A0F3C 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.03) 0%, rgba(255,255,255,0) 60%)', zIndex: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', maxWidth: '1400px', width: '100%', margin: '0 auto', zIndex: 1, padding: '4rem 2rem 6rem', gap: '4rem' }}>

        {/* LEFT PANEL (65%) */}
        <div style={{ flex: '1 1 60%', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {progress >= 100 ? "Analysis Complete" : "Generating Your AI Competitor Gap Report"}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#667085', maxWidth: '600px', lineHeight: 1.6, marginBottom: '3rem' }}>
              {progress >= 100 ? "Preparing Executive Dashboard..." : "Our AI Competitive Intelligence Engine is performing a comprehensive business comparison across multiple strategic dimensions."}
            </p>
          </motion.div>

          {/* Company Battle Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '3.5rem', position: 'relative' }}>
            {/* Primary Card */}
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '24px', padding: '2rem', textAlign: 'center', boxShadow: '0 12px 40px rgba(10,15,60,0.04)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Your Company</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', wordBreak: 'break-word' }}>{primaryUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>
            </motion.div>

            {/* VS Badge */}
            <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0px rgba(255,107,0,0)', '0 0 25px rgba(255,107,0,0.3)', '0 0 0px rgba(255,107,0,0)'] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#FF6B00', position: 'absolute', zIndex: 10, boxShadow: '0 4px 12px rgba(10,15,60,0.05)' }}>
              VS
            </motion.div>

            {/* Competitor Card */}
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '24px', padding: '2rem', textAlign: 'center', boxShadow: '0 12px 40px rgba(10,15,60,0.04)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Competitor</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', wordBreak: 'break-word' }}>{competitorUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>
            </motion.div>
          </div>

          {/* Progress Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Overall Progress</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', lineHeight: 1 }}>{progress}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Estimated Time Remaining</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A0F3C' }}>{progress >= 100 ? "0 seconds" : `${timeRemaining} seconds`}</div>
              </div>
            </div>
            <div style={{ height: '8px', background: '#F8F9FC', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ height: '100%', background: 'linear-gradient(90deg, #FF6B00, #FF8F3D)' }} />
            </div>
          </div>

          {/* Analysis Timeline */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {steps.map((step, idx) => {
              const isComplete = progress >= step.threshold;
              const isActive = progress < step.threshold && (idx === 0 || progress >= steps[idx - 1].threshold);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isComplete ? (
                      <CheckCircle2 size={22} color="#10B981" />
                    ) : isActive ? (
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF6B00', boxShadow: '0 0 12px rgba(255,107,0,0.4)' }} />
                    ) : (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E9EDF5' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: isComplete || isActive ? 600 : 500, color: isComplete ? '#0A0F3C' : isActive ? '#FF6B00' : '#A0A4B0', transition: 'color 0.3s' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL (35%) */}
        <div style={{ flex: '1 1 30%', minWidth: '320px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(10,15,60,0.06)', display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 12px rgba(16,185,129,0.6)' }} className="animate-pulse" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Live Intelligence</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Current Module</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A0F3C', background: '#F8F9FC', padding: '1rem', borderRadius: '12px', border: '1px solid #E9EDF5', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.span key={moduleIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.3 }} style={{ display: 'block' }}>
                    {modules[moduleIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { label: "Pages Crawled", val: Math.min(148, Math.floor((progress / 100) * 148)) },
                { label: "Business Signals", val: Math.min(37, Math.floor((progress / 100) * 37)) },
                { label: "Tech Detected", val: Math.min(12, Math.floor((progress / 100) * 12)) },
                { label: "Services Found", val: Math.min(18, Math.floor((progress / 100) * 18)) },
                { label: "Industries", val: Math.min(6, Math.floor((progress / 100) * 6)) },
                { label: "Confidence", val: progress >= 95 ? "94%" : `${Math.min(94, progress)}%` },
              ].map((kpi, i) => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1rem', border: '1px solid #E9EDF5', boxShadow: '0 2px 8px rgba(10,15,60,0.02)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A0F3C' }}>
                    {kpi.val}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Reasoning Panel */}
            <div style={{ flex: 1, background: '#0A0F3C', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={16} color="#FF6B00" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Insight Engine</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.p key={thoughtIndex} initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.5 }} style={{ color: '#E9EDF5', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, fontFamily: 'monospace' }}>
                    &gt; {aiThoughts[thoughtIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid #E9EDF5', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#667085', fontWeight: 600 }}>
          Powered by <span style={{ color: '#0A0F3C', fontWeight: 800 }}>Softree AI Competitive Intelligence Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#667085' }}>
          <span>Analyzing:</span>
          <span style={{ fontWeight: 700, color: '#FF6B00', width: '150px', textAlign: 'right' }}>
            <AnimatePresence mode="wait">
              <motion.span key={moduleIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {modules[moduleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>
    </div>
  );
}


function FeatureCard({ title, icon: Icon }) {
  return (
    <div style={{ background: '#F8F9FC', border: '1px solid #E9EDF5', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s ease' }} className="hover:-translate-y-1 hover:shadow-md">
      <div style={{ color: '#FF6B00' }}><Icon size={24} /></div>
      <div style={{ fontWeight: 600, color: '#0A0F3C' }}>{title}</div>
    </div>
  );
}

function AccordionItem({ question, answer, isOpen, onClick }) {
  return (
    <div style={{ borderBottom: '1px solid #E9EDF5' }}>
      <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0A0F3C' }}>{question}</span>
        <ChevronDown size={20} style={{ color: '#FF6B00', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <p style={{ paddingBottom: '1.5rem', color: '#5F6475', lineHeight: 1.6 }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CompetitorLanding() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisUrls, setAnalysisUrls] = useState({ primary: '', competitor: '' });
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [openFaq, setOpenFaq] = useState(0);

  // Simulate progress when analyzing
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setAnalysisProgress(5);
      interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 98) return 98; // Hold at 98 until actual completion
          const increment = prev < 50 ? 5 : prev < 80 ? 3 : 1;
          return prev + increment;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFormSubmit = async (data) => {
    setAnalysisError(null);
    setAnalysisUrls({ primary: data.websiteUrl, competitor: data.competitorUrl });
    setUserData({ name: data.name, email: data.email });
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const response = await fetch(`${API_BASE_URL}/api/process/competitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_website: data.websiteUrl,
          competitor_website: data.competitorUrl,
          name: data.name,
          email: data.email,
          recaptcha: data.recaptchaToken
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to generate gap report');
      }

      const result = await response.json();
      setReportData(result);
      setAnalysisProgress(100);

      // Short delay for user to see 100% completion before swap
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowDashboard(true);
      }, 800);

    } catch (err) {
      console.error(err);
      setAnalysisError(err.message);
      setIsAnalyzing(false);
      alert(`Analysis failed: ${err.message}`);
    }
  };

  const features = [
    { title: 'Company Overview', icon: Building },
    { title: 'Service Portfolio', icon: FileText },
    { title: 'Industry Focus', icon: Target },
    { title: 'Website Comparison', icon: Globe },
    { title: 'Trust & Credibility', icon: ShieldCheck },
    { title: 'Case Studies', icon: Award },
    { title: 'SEO & AI Visibility', icon: Search },
    { title: 'Lead Generation', icon: TrendingUp },
    { title: 'Technology Stack', icon: Zap },
    { title: 'Business Differentiators', icon: Activity },
    { title: 'AI Recommendations', icon: Sparkles }
  ];

  const faqs = [
    { q: "How accurate is the AI competitor analysis?", a: "Our AI engine analyzes hundreds of data points across your website and your competitor's, including structure, content, SEO metadata, and technical performance to generate highly accurate, data-driven insights." },
    { q: "Is the gap report completely free?", a: "Yes, the initial executive gap report is completely free and provides actionable insights you can use immediately." },
    { q: "How long does it take to generate?", a: "The analysis typically takes a few minutes to complete, delivering a comprehensive executive report straight to your email." },
    { q: "Can I analyze more than one competitor?", a: "The free report allows for a 1-to-1 comparison. For multi-competitor analysis, you can speak with our team about our enterprise intelligence solutions." }
  ];

  if (showDashboard && reportData) {
    return <CompetitorDashboard data={reportData} userName={userData.name} userEmail={userData.email} onReset={() => setShowDashboard(false)} />;
  }

  if (isAnalyzing) {
    return <CompetitorLoader primaryUrl={analysisUrls.primary} competitorUrl={analysisUrls.competitor} progress={analysisProgress} />;
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <Navigation />

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 70px)', paddingTop: 'clamp(5rem, 6vh, 6rem)', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#FFFFFF', overflow: 'hidden' }}>
        {/* Soft orange radial glow background */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '850px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
            {/* Centered AI badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: '#FFF5EE', border: '1px solid #FFE4D6', borderRadius: '999px', marginBottom: '1rem' }}>
              <Sparkles size={14} color="#FF6B00" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI COMPETITIVE INTELLIGENCE</span>
            </div>

            {/* Large bold heading */}
            <h1 style={{
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              <span style={{ color: '#0A0F3C' }}>AI</span>{' '}
              <span style={{ color: '#FF8A3D' }}>Gap</span>{' '}
              <span style={{ color: '#FF6B00' }}>Report</span>
            </h1>

            {/* Centered subtitle */}
            <p style={{ fontSize: '1.1rem', color: '#5F6475', lineHeight: 1.5, maxWidth: '600px', margin: '0 auto' }}>
              Compare your business against any competitor and get actionable AI-powered insights.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ width: '100%' }}>
            <CompetitorForm onSubmit={handleFormSubmit} loading={isAnalyzing} error={analysisError} />
          </motion.div>
        </div>
      </section>

      {/* ── SECOND SCROLL: SAMPLE REPORT ──────────────────────── */}
      <section style={{ padding: '6rem 1.5rem', background: '#F8F9FC' }}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1rem' }}>See a Sample AI Competitor Gap Report</h2>
          <p style={{ fontSize: '1.1rem', color: '#5F6475', marginBottom: '4rem' }}>Preview the executive report before generating your own.</p>
          <ReportCarousel />
        </div>
      </section>

      {/* ── THIRD SECTION: WHAT YOU'LL GET ──────────────────────── */}
      <section style={{ padding: '6rem 1.5rem', background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1rem' }}>What You'll Get</h2>
            <p style={{ fontSize: '1.1rem', color: '#5F6475' }}>A comprehensive breakdown of your competitive standing.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => <FeatureCard key={i} title={f.title} icon={f.icon} />)}
          </div>
        </div>
      </section>

      {/* ── FOURTH SECTION: HOW IT WORKS ──────────────────────── */}
      <section style={{ padding: '6rem 1.5rem', background: '#F8F9FC', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ fontSize: '1.1rem', color: '#5F6475' }}>Four simple steps to actionable intelligence.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', position: 'relative' }}>
            {/* Connecting line - visible only on larger screens */}
            <div className="hidden lg:block" style={{ position: 'absolute', top: '0', left: '12%', right: '12%', height: '2px', background: 'linear-gradient(90deg, rgba(255,107,0,0) 0%, rgba(255,107,0,0.2) 50%, rgba(255,107,0,0) 100%)', zIndex: 0 }}></div>

            {[
              { step: 1, title: 'Enter Both Websites', desc: 'Provide your domain and your top competitor.' },
              { step: 2, title: 'AI Crawls & Compares', desc: 'Our agents analyze hundreds of data points.' },
              { step: 3, title: 'Competitive Intelligence Analysis', desc: 'We identify strategic gaps and opportunities.' },
              { step: 4, title: 'Email Full Report', desc: 'Receive a comprehensive executive report delivered straight to your inbox.' }
            ].map((s) => (
              <div key={s.step} style={{ position: 'relative', zIndex: 1, background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '20px', padding: '0 1.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 4px 20px rgba(10,15,60,0.03)', transition: 'all 0.3s ease' }} className="hover:-translate-y-2 hover:shadow-xl">
                <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', transform: 'translateY(-50%)', padding: '8px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00 0%, #FF8F3D 100%)', color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(255,107,0,0.25)' }}>
                    {s.step}
                  </div>
                </div>
                <div style={{ marginTop: '-1.5rem' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A0F3C', marginBottom: '0.75rem' }}>{s.title}</h4>
                  <p style={{ color: '#5F6475', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIFTH SECTION: STATISTICS ──────────────────────── */}
      <section style={{ padding: '6rem 1.5rem', background: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>THE ADVANTAGE</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1.25rem' }}>Why Competitive Intelligence Matters</h2>
            <p style={{ fontSize: '1.1rem', color: '#5F6475', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
              Operating blindly is no longer an option. In an increasingly crowded digital landscape, understanding exactly where you stand against your top competitors is the fastest way to identify gaps, optimize your strategy, and capture more market share.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <SimpleStatCard value="73%" description="higher win rates in competitive deals for companies utilizing intelligence" />
            <SimpleStatCard value="90%" description="of Fortune 500 companies use competitive data for market advantage" />
            <SimpleStatCard value="2x" description="faster strategic decisions when armed with real-time competitor insights" />
            <SimpleStatCard value="+33%" description="average revenue impact when directly addressing identified market gaps" />
          </div>
        </div>
      </section>

      {/* ── FAQ & DISCLOSURE ──────────────────────────────────────────── */}
      <section style={{ padding: '6rem 1.5rem', background: '#F8F9FC' }}>
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C' }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '16px', padding: '1rem 2rem' }}>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#FFF7F2', borderLeft: '4px solid #FF6B00', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={20} color="#FF6B00" />
            <div style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0A0F3C' }}>Important Disclosure</div>
          </div>
          <div style={{ margin: 0, color: '#5F6475', fontSize: '0.95rem', lineHeight: 1.6 }}>
            This AI Gap Report is generated using publicly available information from your website and the competitor's website. The analysis is intended to provide high-level competitive insights, website observations, AI visibility indicators, and strategic improvement opportunities. It is not a comprehensive business, financial, legal, cybersecurity, compliance, or technical audit. Recommendations are generated using AI-assisted analysis and should be reviewed before making business decisions.
          </div>
        </div>
      </section>

      {/* ── FINAL CTA & FOOTER ──────────────────────────────────────── */}
      <LightContactSection />
      <StickyFooter />
    </div>
  );
}
