import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CreditCard,
  FileText,
  User,
  Mail,
  Building,
  Users,
  Briefcase,
  Activity,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  LayoutDashboard,
  BrainCircuit,
  FileSearch,
  Send,
  Info
} from 'lucide-react';
import Navigation from '../components/Navigation';
import StickyFooter from '../components/StickyFooter';
import LightContactSection from '../components/LightContactSection';
import HealthcareDashboard from '../components/healthcare/HealthcareDashboard';
import '../geo.css'; 
import '../PublicPortal.css';

function HealthcareForm({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    numDoctors: '',
    numStaff: '',
    hospitalType: '',
    emrSystem: '',
    techEcosystem: '',
    aiUsage: '',
    challenge: [],
    businessGoal: ''
  });
  const [localError, setLocalError] = useState(null);

  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [showChallengeDropdown, setShowChallengeDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const challengeOptions = [
    "Patient Scheduling",
    "Long Waiting Times",
    "Clinical Documentation",
    "Billing & Claims",
    "Revenue Cycle Management",
    "Staff Shortage",
    "Administrative Workload",
    "Manual Data Entry",
    "Patient Communication",
    "Regulatory Compliance",
    "Inventory Management",
    "Reporting & Analytics",
    "Other"
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowChallengeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleChange = (e) => {
    if (e.target.name === 'challenge') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({ ...formData, challenge: selectedOptions });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    if (loading) return;

    if (!formData.hospitalName || !formData.email || !formData.numDoctors || !formData.numStaff || !formData.hospitalType || !formData.emrSystem || !formData.techEcosystem || !formData.aiUsage || formData.challenge.length === 0 || !formData.businessGoal) {
      setLocalError("Please fill out all required fields.");
      return;
    }

    if (!recaptchaToken) {
      setLocalError("Please verify that you are not a robot.");
      return;
    }

    if (onSubmit) onSubmit({ ...formData, recaptchaToken });
  };

  const inputStyle = {
    height: '38px',
    borderRadius: '18px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8EAF0',
    color: '#0A0F3C',
    fontSize: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    width: '100%',
    boxShadow: '0 4px 14px rgba(255, 107, 0, 0.04)',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: '"Inter", sans-serif'
  };

  const textareaStyle = {
    ...inputStyle,
    height: '70px',
    paddingTop: '0.75rem',
    resize: 'none'
  };
  
  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer'
  };

  const selectWrapperStyle = {
    position: 'relative',
    width: '100%'
  };

  const selectIconStyle = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#5F6475'
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input required name="hospitalName" type="text" value={formData.hospitalName} onChange={handleChange} style={inputStyle} placeholder="Hospital / Organization Name" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
          <input required name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="Business Email" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input required name="numDoctors" type="number" value={formData.numDoctors} onChange={handleChange} style={inputStyle} placeholder="Number of Doctors" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
          <input required name="numStaff" type="number" value={formData.numStaff} onChange={handleChange} style={inputStyle} placeholder="Number of Staff" disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={selectWrapperStyle}>
            <select required name="hospitalType" value={formData.hospitalType} onChange={handleChange} style={selectStyle} disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]">
              <option value="" disabled>Hospital Type</option>
              <option value="Multi-Specialty Hospital">Multi-Specialty Hospital</option>
              <option value="General Hospital">General Hospital</option>
              <option value="Specialty Hospital">Specialty Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="Diagnostic Center">Diagnostic Center</option>
              <option value="Medical Center">Medical Center</option>
              <option value="Government Hospital">Government Hospital</option>
              <option value="Private Hospital">Private Hospital</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown size={18} style={selectIconStyle} />
          </div>

          <div style={selectWrapperStyle}>
            <select required name="emrSystem" value={formData.emrSystem} onChange={handleChange} style={selectStyle} disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]">
              <option value="" disabled>EMR / EHR System</option>
              <option value="Epic">Epic</option>
              <option value="Oracle Cerner">Oracle Cerner</option>
              <option value="MEDITECH Expanse">MEDITECH Expanse</option>
              <option value="Veradigm (Allscripts)">Veradigm (Allscripts)</option>
              <option value="athenahealth">athenahealth</option>
              <option value="eClinicalWorks">eClinicalWorks</option>
              <option value="NextGen Healthcare">NextGen Healthcare</option>
              <option value="Practice Fusion">Practice Fusion</option>
              <option value="OpenEMR">OpenEMR</option>
              <option value="Custom / In-House EMR">Custom / In-House EMR</option>
              <option value="No EMR / Paper-Based">No EMR / Paper-Based</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown size={18} style={selectIconStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={selectWrapperStyle}>
            <select required name="techEcosystem" value={formData.techEcosystem} onChange={handleChange} style={selectStyle} disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]">
              <option value="" disabled>Current Technology Ecosystem</option>
              <option value="No Major Digital Platform">No Major Digital Platform</option>
              <option value="Microsoft Ecosystem">Microsoft Ecosystem</option>
              <option value="Google Cloud Ecosystem">Google Cloud Ecosystem</option>
              <option value="AWS Ecosystem">AWS Ecosystem</option>
              <option value="Oracle Ecosystem">Oracle Ecosystem</option>
              <option value="Salesforce Ecosystem">Salesforce Ecosystem</option>
              <option value="SAP Ecosystem">SAP Ecosystem</option>
              <option value="Custom / In-House Systems">Custom / In-House Systems</option>
              <option value="Multiple Technology Platforms">Multiple Technology Platforms</option>
              <option value="Not Sure">Not Sure</option>
            </select>
            <ChevronDown size={18} style={selectIconStyle} />
          </div>

          <div style={selectWrapperStyle}>
            <select required name="aiUsage" value={formData.aiUsage} onChange={handleChange} style={selectStyle} disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]">
              <option value="" disabled>Current AI Usage</option>
              <option value="No AI Adoption">No AI Adoption</option>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Microsoft Copilot">Microsoft Copilot</option>
              <option value="Azure OpenAI">Azure OpenAI</option>
              <option value="Google Gemini">Google Gemini</option>
              <option value="Claude AI">Claude AI</option>
              <option value="AI Chatbot">AI Chatbot</option>
              <option value="Medical Transcription AI">Medical Transcription AI</option>
              <option value="Custom AI Solution">Custom AI Solution</option>
              <option value="Multiple AI Solutions">Multiple AI Solutions</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown size={18} style={selectIconStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={selectWrapperStyle} ref={dropdownRef}>
            <div 
              onClick={() => { if (!loading) setShowChallengeDropdown(!showChallengeDropdown); }}
              style={{...inputStyle, display: 'flex', alignItems: 'center', cursor: loading ? 'not-allowed' : 'pointer', color: formData.challenge.length ? '#0A0F3C' : '#5F6475'}}
              className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
            >
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '90%' }}>
                {formData.challenge.length > 0 ? formData.challenge.join(', ') : "Primary Operational Challenge (Select Multiple)"}
              </div>
              <ChevronDown size={18} style={selectIconStyle} />
            </div>
            {showChallengeDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#FFFFFF', border: '1px solid #E8EAF0', borderRadius: '12px', marginTop: '4px', zIndex: 10, boxShadow: '0 10px 25px rgba(10,15,60,0.1)', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem 0' }}>
                {challengeOptions.map((opt, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', cursor: 'pointer', gap: '0.5rem', margin: 0 }} className="hover:bg-[#F7F8FC]">
                    <input 
                      type="checkbox" 
                      checked={formData.challenge.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, challenge: [...formData.challenge, opt] });
                        } else {
                          setFormData({ ...formData, challenge: formData.challenge.filter(c => c !== opt) });
                        }
                      }}
                      style={{ accentColor: '#FF6B00', width: '16px', height: '16px', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#0A0F3C' }}>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={selectWrapperStyle}>
            <select required name="businessGoal" value={formData.businessGoal} onChange={handleChange} style={selectStyle} disabled={loading} className="focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]">
              <option value="" disabled>Primary Business Goal</option>
              <option value="Reduce Operational Costs">Reduce Operational Costs</option>
              <option value="Improve Patient Experience">Improve Patient Experience</option>
              <option value="Increase Staff Productivity">Increase Staff Productivity</option>
              <option value="Improve Clinical Documentation">Improve Clinical Documentation</option>
              <option value="Reduce Administrative Work">Reduce Administrative Work</option>
              <option value="Improve Compliance">Improve Compliance</option>
              <option value="Increase Revenue">Increase Revenue</option>
              <option value="Digital Transformation">Digital Transformation</option>
              <option value="AI Adoption Strategy">AI Adoption Strategy</option>
            </select>
            <ChevronDown size={18} style={selectIconStyle} />
          </div>
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

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
          <div ref={recaptchaRef}></div>
        </div>

        <button type="submit" disabled={loading || !recaptchaToken} style={{ height: '45px', width: '100%', borderRadius: '12px', background: 'linear-gradient(135deg, #FF8A3D 0%, #FF6B00 100%)', color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: (loading || !recaptchaToken) ? 'not-allowed' : 'pointer', opacity: (loading || !recaptchaToken) ? 0.7 : 1, transition: 'all 0.3s ease', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.2)' }} className="hover:shadow-lg hover:-translate-y-0.5">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Generating...' : 'Generate AI Opportunity Assessment'}
        </button>
      </form>

      {/* INLINE BENEFITS ROW */}
      <div style={{ width: '100%', marginTop: '0.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderTop: '1px solid #E8EAF0', borderBottom: '1px solid #E8EAF0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} color="#FF6B00" />
          <span style={{ fontSize: '0.9rem', color: '#5F6475', fontWeight: 500 }}>Email Full Report</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="#FF6B00" />
          <span style={{ fontSize: '0.9rem', color: '#5F6475', fontWeight: 500 }}>Delivered within minutes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="#FF6B00" />
          <span style={{ fontSize: '0.9rem', color: '#5F6475', fontWeight: 500 }}>No Credit Card Required</span>
        </div>
      </div>
    </div>
  );
}

// ─── HEALTHCARE LOADER ────────────────────────────────────────────────────────
function HealthcareLoader({ progress }) {
  const steps = [
    { label: "Initializing healthcare context", threshold: 10 },
    { label: "Analyzing medical specialty", threshold: 20 },
    { label: "Evaluating EMR/EHR integration", threshold: 40 },
    { label: "Assessing current AI maturity", threshold: 60 },
    { label: "Identifying operational bottlenecks", threshold: 75 },
    { label: "Calculating estimated ROI & savings", threshold: 85 },
    { label: "Generating executive action plan", threshold: 95 },
    { label: "Preparing final dashboard", threshold: 100 }
  ];

  const aiThoughts = [
    "Evaluating clinical workflows...",
    "Analyzing compliance requirements...",
    "Identifying automation opportunities...",
    "Calculating potential cost savings...",
    "Generating strategic recommendations..."
  ];

  const modules = [
    "Workflow Analysis", "EMR Integration", "Compliance Check", "ROI Calculation", "Action Plan Generation"
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

  const timeRemaining = Math.max(0, Math.ceil(((100 - progress) / 100) * 15));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(#0A0F3C 1px, transparent 1px), linear-gradient(90deg, #0A0F3C 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.03) 0%, rgba(255,255,255,0) 60%)', zIndex: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', maxWidth: '1400px', width: '100%', margin: '0 auto', zIndex: 1, padding: '4rem 2rem 6rem', gap: '4rem' }}>
        <div style={{ flex: '1 1 60%', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {progress >= 100 ? "Analysis Complete" : "Generating Your Healthcare AI Assessment"}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#5F6475', maxWidth: '600px', lineHeight: 1.6, marginBottom: '3rem' }}>
              {progress >= 100 ? "Preparing Executive Dashboard..." : "Our AI Healthcare Intelligence Engine is performing a comprehensive operational analysis to identify automation opportunities."}
            </p>
          </motion.div>

          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5F6475', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Overall Progress</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0A0F3C', lineHeight: 1 }}>{progress}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5F6475', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Estimated Time Remaining</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A0F3C' }}>{progress >= 100 ? "0 seconds" : `${timeRemaining} seconds`}</div>
              </div>
            </div>
            <div style={{ height: '8px', background: '#F8F9FC', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ height: '100%', background: 'linear-gradient(90deg, #FF6B00, #FF8F3D)' }} />
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {steps.map((step, idx) => {
              const isComplete = progress >= step.threshold;
              const isActive = progress < step.threshold && (idx === 0 || progress >= steps[idx - 1].threshold);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isComplete ? (
                      <CheckCircle size={22} color="#10B981" />
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

        <div style={{ flex: '1 1 30%', minWidth: '320px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: '#FFFFFF', border: '1px solid #E9EDF5', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(10,15,60,0.06)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 12px rgba(16,185,129,0.6)' }} className="animate-pulse" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Live Intelligence</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#5F6475', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Current Module</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A0F3C', background: '#F8F9FC', padding: '1rem', borderRadius: '12px', border: '1px solid #E9EDF5', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.span key={moduleIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.3 }} style={{ display: 'block' }}>
                    {modules[moduleIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { label: "Data Points", val: Math.min(148, Math.floor((progress / 100) * 148)) },
                { label: "Opportunities", val: Math.min(7, Math.floor((progress / 100) * 7)) },
                { label: "Workflows", val: Math.min(12, Math.floor((progress / 100) * 12)) },
                { label: "Confidence", val: progress >= 95 ? "94%" : `${Math.min(94, progress)}%` },
              ].map((kpi, i) => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '1rem', border: '1px solid #E9EDF5', boxShadow: '0 2px 8px rgba(10,15,60,0.02)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#5F6475', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A0F3C' }}>
                    {kpi.val}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, background: '#0A0F3C', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={16} color="#FF6B1A" />
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
    </div>
  );
}

function SampleReportPreview() {
  const slides = [
    { name: "Executive KPIs", image: "/reports/healthcare/executive-kpis.png" },
    { name: "AI Analytics", image: "/reports/healthcare/ai-analytics.png" },
    { name: "Strategic Roadmap", image: "/reports/healthcare/strategic-roadmap.png" },
    { name: "Executive Summary", image: "/reports/healthcare/executive-summary.png" }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  ]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section style={{ padding: '6rem 1.5rem', background: '#FAFBFC', borderTop: '1px solid #E8EDF5', borderBottom: '1px solid #E8EDF5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: '#FFF5EE', border: '1px solid #FFE4D6', borderRadius: '999px', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXECUTIVE AI HEALTHCARE REPORT</span>
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0A0F3C', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          See a Sample Healthcare AI Opportunity Assessment
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#5F6475', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          Preview the executive assessment before generating your own.
        </p>

        {/* Carousel Container */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto 2rem', background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: '18px', boxShadow: '0 12px 40px rgba(10, 15, 60, 0.08)', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderBottom: '1px solid #E8EDF5', background: '#F8F9FC' }}>
            <div style={{ fontWeight: 800, color: '#0A0F3C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={18} color="#FF6B00" />
              HEALTHCARE AI DASHBOARD
            </div>
            <div style={{ fontWeight: 600, color: '#FF6B00', fontSize: '0.9rem' }}>
              {slides[selectedIndex]?.name} <span style={{ color: '#5F6475' }}>({selectedIndex + 1}/{slides.length})</span>
            </div>
          </div>

          {/* Embla Viewport */}
          <div className="embla" style={{ position: 'relative', background: '#FAFAFA' }}>
            <div className="embla__viewport" ref={emblaRef} style={{ overflow: 'hidden', padding: '2rem' }}>
              <div className="embla__container" style={{ display: 'flex', backfaceVisibility: 'hidden', touchAction: 'pan-y' }}>
                {slides.map((slide, idx) => (
                  <div className="embla__slide" key={idx} style={{ flex: '0 0 100%', minWidth: 0, paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <div style={{
                       position: 'relative',
                       width: '100%',
                       minHeight: '400px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       background: '#FFFFFF',
                       borderRadius: '12px',
                       border: '1px solid #E9EDF5',
                       boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                       overflow: 'hidden'
                    }}>
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: selectedIndex === idx ? 1 : 0.4 }}
                        transition={{ duration: 0.5 }}
                        src={slide.image} 
                        alt={slide.name} 
                        style={{ width: '100%', height: '100%', maxHeight: '550px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ display: 'none', flexDirection: 'column', width: '100%', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#A0A4B0', fontSize: '1.2rem', fontWeight: 600, backgroundColor: '#FFFFFF' }}>
                        <LayoutDashboard size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <div>{slide.name} Preview</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 400, marginTop: '0.5rem' }}>Interactive visualization of {slide.name.toLowerCase()}.</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav Arrows */}
            <button onClick={scrollPrev} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E8EDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(10,15,60,0.1)', color: '#0A0F3C', zIndex: 10 }} className="hover:bg-gray-50 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={scrollNext} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E8EDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(10,15,60,0.1)', color: '#0A0F3C', zIndex: 10 }} className="hover:bg-gray-50 transition-colors">
              <ChevronRight size={20} />
            </button>

            {/* Pagination Dots */}
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 10 }}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  style={{
                    width: selectedIndex === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: selectedIndex === idx ? '#FF6B00' : '#D1D5DB',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <FileText size={24} color="#FF6B00" />,
      title: "Complete Assessment",
      desc: "Fill in your healthcare organization details."
    },
    {
      num: "02",
      icon: <BrainCircuit size={24} color="#FF6B00" />,
      title: "AI Analysis",
      desc: "Our AI engine evaluates your workflows, technology landscape, operational maturity, and AI readiness."
    },
    {
      num: "03",
      icon: <FileSearch size={24} color="#FF6B00" />,
      title: "Healthcare Opportunity Assessment",
      desc: "AI identifies high-impact automation opportunities, recommended AI agents, estimated ROI, and implementation priorities."
    },
    {
      num: "04",
      icon: <Send size={24} color="#FF6B00" />,
      title: "Receive Executive Report",
      desc: "Download or receive your Healthcare AI Opportunity Assessment Report directly via email."
    }
  ];

  return (
    <section style={{ padding: '6rem 1.5rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0A0F3C', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            How It Works
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#5F6475', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Four simple steps from assessment to executive AI transformation roadmap.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: '18px', padding: '2rem', position: 'relative', boxShadow: '0 4px 20px rgba(10,15,60,0.03)', transition: 'transform 0.3s' }} className="hover:-translate-y-1 hover:shadow-lg">
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '3rem', fontWeight: 900, color: '#F3F4F6', lineHeight: 1 }}>
                {step.num}
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                {step.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A0F3C', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>{step.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#5F6475', lineHeight: 1.6, margin: 0, position: 'relative', zIndex: 1 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyHealthcareAiMatters() {
  const stats = [
    { value: "65%", text: "Administrative workload can be automated." },
    { value: "40%", text: "Reduction in repetitive manual tasks." },
    { value: "3X", text: "Faster patient response using AI assistants." },
    { value: "30%", text: "Potential operational cost savings." }
  ];

  return (
    <section style={{ padding: '6rem 1.5rem', background: '#0A0F3C', color: '#FFFFFF' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>THE ADVANTAGE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Why Healthcare Organizations Are Investing in AI
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '2rem' }}>
            Healthcare organizations face increasing operational demands, workforce shortages, rising administrative costs, and growing patient expectations. AI Agents help automate repetitive processes, improve clinical and administrative efficiency, enhance patient engagement, and accelerate digital transformation.
          </p>
        </div>
        <div style={{ flex: '1 1 400px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#FF6B00', marginBottom: '0.5rem', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.95rem', color: '#CBD5E1', lineHeight: 1.5 }}>{stat.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    { q: "How is the Healthcare AI Opportunity Assessment generated?", a: "Our proprietary AI engine analyzes the specific data points you provide about your healthcare organization, including size, EMR systems, and current pain points. It then cross-references this against industry benchmarks and proven AI automation frameworks to generate a customized strategic report." },
    { q: "Is the assessment completely free?", a: "Yes. The initial executive assessment is provided completely free of charge as part of Softree's commitment to advancing healthcare AI transformation." },
    { q: "How long does the assessment take?", a: "Generating the report takes less than 60 seconds after you submit the form. The AI processes your data in real-time to build your custom dashboard." },
    { q: "How accurate are the AI recommendations?", a: "The recommendations are highly accurate and based on real-world enterprise AI deployments in healthcare. However, they are intended for executive planning and should be followed up with a detailed technical discovery phase." },
    { q: "Can hospitals and clinics of all sizes use this assessment?", a: "Absolutely. The AI adjusts its recommendations based on the scale of your organization, ensuring that a small clinic receives differently scoped insights than a 500-bed hospital." },
    { q: "Will I receive the report by email?", a: "Yes. Once the dashboard is generated, you will have the option to receive a PDF copy of the full Executive Assessment directly to your professional email." }
  ];

  return (
    <section style={{ padding: '6rem 1.5rem', background: '#FAFBFC' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0A0F3C', marginBottom: '3rem', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s' }}>
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0A0F3C' }}>{faq.q}</span>
                  <div style={{ color: isOpen ? '#FF6B00' : '#A0A4B0', transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 1.5rem 1.5rem', fontSize: '1rem', color: '#5F6475', lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ImportantDisclosure() {
  return (
    <section style={{ padding: '4rem 1.5rem 6rem', background: '#FAFBFC' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF5', borderLeft: '4px solid #FF6B00', borderRadius: '18px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(10,15,60,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,107,0,0.02)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={24} color="#FF6B00" />
              </div>
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '0.75rem' }}>Important Disclosure</h3>
              <p style={{ fontSize: '0.95rem', color: '#5F6475', lineHeight: 1.6, margin: 0 }}>
                This Healthcare AI Opportunity Assessment is generated using the information you provide together with AI-assisted analysis and industry best practices. The assessment is intended to provide high-level AI readiness insights, operational improvement opportunities, automation recommendations, and strategic guidance. It is not a clinical, medical, financial, legal, cybersecurity, compliance, regulatory, or technical audit. Recommendations are AI-generated and should be reviewed by your organization's leadership before making operational, technology, or investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HealthcareLanding() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [assessmentData, setAssessmentData] = useState(null);
  const [submittedUser, setSubmittedUser] = useState(null);

  const handleFormSubmit = async (data) => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisError(null);
    setSubmittedUser({ email: data.email, hospitalName: data.hospitalName });

    // Simulate progress bar moving up to 90% while waiting for API
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 2; 
      });
    }, 600); 

    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/process/healthcare-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_name: data.hospitalName,
          business_email: data.email,
          number_of_doctors: parseInt(data.numDoctors, 10),
          number_of_staff: parseInt(data.numStaff, 10),
          hospital_type: data.hospitalType,
          ehr_system: data.emrSystem,
          current_technology_ecosystem: data.techEcosystem,
          current_ai_usage: data.aiUsage,
          primary_operational_challenge: data.challenge,
          primary_business_goal: data.businessGoal,
          recaptcha_token: data.recaptchaToken
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to generate assessment");
      }

      const resultData = await response.json();
      setAssessmentData(resultData);

      // Finish progress bar
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
          setIsAnalyzing(false);
          setShowDashboard(true);
      }, 1000);

    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setAnalysisError(err.message);
    }
  };

  if (showDashboard && assessmentData) {
    return <HealthcareDashboard 
      data={assessmentData} 
      userEmail={submittedUser?.email}
      userName={submittedUser?.name}
      hospitalName={submittedUser?.hospitalName}
      onReset={() => {
        setShowDashboard(false);
        setAssessmentData(null);
        setSubmittedUser(null);
    }} />;
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <Navigation />

      {isAnalyzing ? (
        <HealthcareLoader progress={progress} />
      ) : (
        <>
          {/* ── HERO SECTION ──────────────────────────────────────── */}
          <section style={{ position: 'relative', minHeight: 'calc(100vh - 70px)', paddingTop: 'clamp(2rem, 4vh, 4rem)', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: '#FFFFFF', overflow: 'hidden' }}>
            {/* Soft orange radial glow background */}
            <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '850px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: '#FFF5EE', border: '1px solid #FFE4D6', borderRadius: '999px', marginBottom: '0.75rem' }}>
                  <Sparkles size={14} color="#FF6B00" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI HEALTHCARE INTELLIGENCE</span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                  color: '#0A0F3C'
                }}>
                  Discover Your Healthcare<br/>
                  <span style={{ color: '#FF6B00' }}>AI Opportunities</span>
                </h1>

                <p style={{ fontSize: '1rem', color: '#5F6475', lineHeight: 1.5, maxWidth: '650px', margin: '0 auto' }}>
                  Receive an executive AI assessment that identifies automation opportunities, AI agent recommendations, implementation priorities, and estimated ROI for your hospital or clinic.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ width: '100%', maxWidth: '650px' }}>
                <HealthcareForm onSubmit={handleFormSubmit} loading={isAnalyzing} error={analysisError} />
              </motion.div>
            </div>
          </section>

          <SampleReportPreview />
          <HowItWorks />
          <WhyHealthcareAiMatters />
          <FaqSection />
          <ImportantDisclosure />

          <LightContactSection />
          <StickyFooter />
        </>
      )}
    </div>
  );
}
