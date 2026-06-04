import React from 'react';
import { motion } from 'framer-motion';

/* Animated AI dashboard preview for the hero right side */
export default function GeoDashboardPreview() {
  const scoreRingOffset = 283 - (283 * 78) / 100; // 78% score
  const chatgptScore = 82;
  const geminiScore = 71;
  const perplexityScore = 65;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="geo-float relative"
    >
      {/* Ambient glow */}
      <div className="geo-ambient-glow w-72 h-72 bg-orange-500/10 -top-20 -right-20 absolute" />

      {/* Main dashboard card */}
      <div className="geo-glass p-6 relative overflow-hidden" style={{ borderColor: 'rgba(255,107,0,0.12)' }}>
        {/* Scan line */}
        <div className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"
          style={{ animation: 'geo-scan-line 3s linear infinite' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-1">AI Visibility Dashboard</p>
            <p className="text-text-secondary text-xs">Real-time GEO Intelligence</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>

        {/* Score Ring + Side Scores */}
        <div className="flex items-center gap-6 mb-6">
          {/* Main Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,107,0,0.08)" strokeWidth="8" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
                strokeDasharray="283" strokeDashoffset={scoreRingOffset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                className="geo-score-ring-circle" style={{ animation: 'geo-score-fill 2s ease-out forwards' }} />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FFB15C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">78</span>
              <span className="text-text-muted text-[10px] font-semibold uppercase tracking-wider">AI Score</span>
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border border-orange-500/20" style={{ animation: 'geo-pulse-ring 3s ease-in-out infinite' }} />
          </div>

          {/* Individual AI Scores */}
          <div className="flex-1 space-y-3">
            {[
              { name: 'ChatGPT', score: chatgptScore, color: '#10B981' },
              { name: 'Gemini', score: geminiScore, color: '#3B82F6' },
              { name: 'Perplexity', score: perplexityScore, color: '#A855F7' },
            ].map((ai) => (
              <div key={ai.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary text-xs font-medium">{ai.name}</span>
                  <span className="text-white text-xs font-bold">{ai.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${ai.score}%`,
                    background: `linear-gradient(90deg, ${ai.color}, ${ai.color}88)`,
                    animation: 'geo-bar-fill 1.8s ease-out forwards'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Entity Match', value: '94%', trend: '+12%' },
            { label: 'Schema Score', value: '67%', trend: '+8%' },
            { label: 'Citations', value: '23', trend: '+5' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
              <p className="text-white text-base font-bold">{m.value}</p>
              <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider mt-0.5">{m.label}</p>
              <p className="text-green-400 text-[10px] font-semibold mt-1">{m.trend}</p>
            </div>
          ))}
        </div>

        {/* Floating recommendation card */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-4 top-16 geo-glass px-3 py-2 rounded-xl shadow-lg"
          style={{ borderColor: 'rgba(255,107,0,0.15)', fontSize: '11px', maxWidth: '160px' }}
        >
          <p className="text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">Recommendation</p>
          <p className="text-text-secondary text-[10px] leading-tight">Add FAQ schema to improve AI citations by 40%</p>
        </motion.div>

        {/* Floating analytics mini chart */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -left-4 bottom-20 geo-glass px-3 py-2 rounded-xl shadow-lg"
          style={{ borderColor: 'rgba(255,107,0,0.1)' }}
        >
          <p className="text-text-muted text-[10px] font-semibold mb-1">Weekly Trend</p>
          <svg width="80" height="28" viewBox="0 0 80 28">
            <defs>
              <linearGradient id="tinyChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 24 L13 20 L26 22 L39 14 L52 16 L65 8 L80 4 L80 28 L0 28Z" fill="url(#tinyChart)" />
            <path d="M0 24 L13 20 L26 22 L39 14 L52 16 L65 8 L80 4" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
