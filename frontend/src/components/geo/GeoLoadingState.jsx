import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Search, Brain, Globe, Sparkles, Shield } from 'lucide-react';

const steps = [
  { icon: Search, text: 'Analyzing AI visibility...' },
  { icon: Cpu, text: 'Scanning structured data...' },
  { icon: Brain, text: 'Evaluating entity recognition...' },
  { icon: Globe, text: 'Checking AI discoverability...' },
  { icon: Shield, text: 'Measuring citation readiness...' },
  { icon: Sparkles, text: 'Generating GEO intelligence...' },
];

export default function GeoLoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const progress = ((step + 1) / steps.length) * 100;
  const CurrentIcon = steps[step].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto py-20 px-6"
    >
      <div className="geo-glass p-10 relative overflow-hidden text-center"
        style={{ borderColor: 'rgba(255,107,0,0.15)' }}>

        {/* Scanning beam */}
        <div className="absolute top-0 left-0 w-full h-[3px] overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent"
          />
        </div>

        {/* Animated ring */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          {/* Outer pulse */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border-2 border-orange-500/30"
          />
          {/* Spinning ring */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(255,107,0,0.08)" strokeWidth="4" />
            <motion.circle
              cx="56" cy="56" r="50" fill="none" stroke="url(#loadGrad)" strokeWidth="4"
              strokeDasharray="314" strokeDashoffset="220" strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: 'center' }}
            />
            <defs>
              <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FFB15C" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon size={32} className="text-orange-400" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          Generating Your GEO Intelligence Report
        </h3>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden mb-5 mt-6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Current step message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-text-secondary text-sm min-h-[2rem]"
          >
            {steps[step].text}
          </motion.p>
        </AnimatePresence>

        {/* Bottom indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/[0.04]">
          {[
            { icon: Brain, label: 'Entity Analysis' },
            { icon: Search, label: 'Schema Audit' },
            { icon: Shield, label: 'Trust Signals' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-text-muted">
              <Icon size={14} className="text-orange-500/50" />
              <span className="text-[10px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
