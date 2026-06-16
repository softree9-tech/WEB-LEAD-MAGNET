import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Search, Brain, Globe, Sparkles, Shield, Zap, BarChart2, ShieldCheck } from 'lucide-react';

const steps = [
  { icon: Search, text: 'Initializing GEO analysis engine...' },
  { icon: Cpu, text: 'Crawling website structure...' },
  { icon: Brain, text: 'Analyzing entity recognition...' },
  { icon: Globe, text: 'Evaluating schema markup...' },
  { icon: Shield, text: 'Measuring AI visibility...' },
  { icon: Sparkles, text: 'Generating GEO report...' },
];

export default function GeoLoadingState({ validating }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (validating) return;
    const interval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, [validating]);

  if (validating) {
    return (
      <div className="form-card-glass animate-fade-in" style={{
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'black', marginBottom: '0.5rem', textAlign: 'center' }}>
            Verifying Website Accessibility
          </h3>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', lineHeight: 1.5, textAlign: 'center' }}>
            Checking DNS resolution, server response, and domain availability...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card-glass animate-fade-in" style={{
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
      <div className="scanning-beam" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(90deg, transparent, var(--accent-orange), transparent)',
        animation: 'scan 2.8s ease-in-out infinite',
        opacity: 0.6
      }} />

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
          <Brain size={32} className="animate-pulse" style={{ color: '#FF7A00' }} />
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'black', lineHeight: 1.4, textAlign: 'center' }}>
          Generating Your GEO Intelligence Report
        </h3>

        {/* Custom progress bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{
            height: '100%',
            width: `${((step + 1) / steps.length) * 100}%`,
            background: 'linear-gradient(90deg, #FF9E43, #FF7A00)',
            transition: 'width 0.5s ease',
            borderRadius: '3px'
          }} />
        </div>

        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.5, textAlign: 'center' }}>
          {steps[step].text}
        </p>
      </div>

      {/* Micro-features showing analysis parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-gray)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <Brain size={14} color="#FF7A00" />
          <span>Entity Analysis</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <Search size={14} color="#FF7A00" />
          <span>Schema Audit</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#FF7A00" />
          <span>Trust Signals</span>
        </div>
      </div>
    </div>
  );
}
