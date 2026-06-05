import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, Lightbulb, Target, Code, Award, Search, Sparkles, Globe } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

/* ── Section: GEO Report Preview ─────────────────────────────── */
export function GeoReportSection() {
  const cards = [
    {
      icon: Eye,
      title: 'AI Visibility Score',
      desc: 'Comprehensive score measuring how well AI engines can discover, understand, and cite your business across ChatGPT, Gemini, and Perplexity.',
      scoreValue: 78,
    },
    {
      icon: Brain,
      title: 'What AI Understands',
      desc: 'Deep analysis of services, business entities, offerings, and authority signals that AI engines extract from your website content.',
      items: ['Service Categories', 'Business Entities', 'Authority Signals', 'Content Structure'],
    },
    {
      icon: Lightbulb,
      title: 'Top Recommendations',
      desc: 'Actionable GEO opportunities including schema improvements, entity optimization, and AI citation enhancement strategies.',
      items: ['Schema Markup', 'Entity Optimization', 'Citation Readiness', 'Content Gaps'],
    },
  ];

  return (
    <section id="geo-report" className="relative py-28 px-6">
      <div className="geo-ambient-glow w-96 h-96 bg-orange-500/5 top-0 left-1/2 -translate-x-1/2" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Preview</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">A Glimpse of Your GEO Report</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-text-secondary max-w-2xl mx-auto text-base leading-relaxed">See what actionable intelligence our AI agents deliver to optimize your generative engine visibility.</motion.p>
        </motion.div>

        <div className="geo-report-cards grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              variants={fadeUp} whileHover={{ y: -4, borderColor: 'rgba(255,88,18,0.22)' }}
              className="geo-glass geo-glass-hover p-7 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/5 border border-orange-500/15 flex items-center justify-center mb-5 group-hover:bg-orange-500/10 transition-colors">
                <card.icon size={22} className="text-orange-500" />
              </div>
              <h3 className="text-text-primary text-lg font-bold mb-2">{card.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">{card.desc}</p>
              {card.scoreValue && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${card.scoreValue}%` }} transition={{ duration: 1.5 }}
                      viewport={{ once: true }} className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300" />
                  </div>
                  <span className="text-orange-500 text-sm font-bold">{card.scoreValue}/100</span>
                </div>
              )}
              {card.items && (
                <div className="space-y-2">
                  {card.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-text-muted text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: How It Works ───────────────────────────────────── */
export function GeoHowItWorks() {
  const steps = [
    { num: '01', title: 'Enter Website', desc: 'Paste your website URL and business email to begin the AI visibility analysis.' },
    { num: '02', title: 'AI Analyzes Site', desc: 'Our multi-agent AI engine scans content, schema, entities, and structure.' },
    { num: '03', title: 'Generate GEO Score', desc: 'Advanced algorithms calculate your visibility across ChatGPT, Gemini, and Perplexity.' },
    { num: '04', title: 'Receive Report', desc: 'Get a comprehensive GEO audit with actionable recommendations and scores.' },
  ];

  return (
    <section id="how-it-works" className="relative py-28 px-6" style={{ background: 'linear-gradient(180deg, #F8F9FC, #F3F0EE)' }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Process</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">How It Works</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-text-secondary max-w-2xl mx-auto text-base">Four simple steps to unlock your AI visibility intelligence.</motion.p>
        </motion.div>

        <div className="geo-steps-grid grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => (
            <motion.div key={step.num} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              variants={fadeUp} className="relative text-center group">
              <motion.div whileHover={{ scale: 1.08 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/15 flex items-center justify-center mx-auto mb-5 relative z-10 group-hover:border-orange-500/35 transition-all">
                <span className="text-orange-500 text-lg font-extrabold">{step.num}</span>
              </motion.div>
              <h3 className="text-text-primary text-base font-bold mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: Features Grid ──────────────────────────────────── */
export function GeoFeaturesGrid() {
  const features = [
    { icon: Brain, title: 'AI Understanding', desc: 'Deep analysis of how AI engines interpret your content and messaging.' },
    { icon: Target, title: 'Entity Recognition', desc: 'Map how well your brand entities are structured for AI extraction.' },
    { icon: Code, title: 'Schema Markup Analysis', desc: 'Audit structured data that powers AI-generated answers and citations.' },
    { icon: Award, title: 'Authority Signals', desc: 'Evaluate trust markers that AI engines use for content ranking.' },
    { icon: Sparkles, title: 'AI Citation Readiness', desc: 'Score your content readiness for appearing in AI-generated responses.' },
    { icon: Lightbulb, title: 'GEO Recommendations', desc: 'Actionable strategies to improve visibility across generative engines.' },
    { icon: Search, title: 'Search Visibility', desc: 'Track discoverability across traditional and AI-powered search.' },
    { icon: Globe, title: 'AI Discoverability', desc: 'Measure how easily AI assistants find and reference your business.' },
    { icon: Eye, title: 'Structured Data Review', desc: 'Comprehensive review of JSON-LD, microdata, and Open Graph markup.' },
  ];

  return (
    <section id="features" className="relative py-28 px-6">
      <div className="geo-ambient-glow w-80 h-80 bg-orange-500/4 bottom-0 right-0 absolute" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Capabilities</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Comprehensive AI Visibility Analysis</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-text-secondary max-w-2xl mx-auto text-base">Every dimension of your AI search presence, analyzed and optimized.</motion.p>
        </motion.div>

        <div className="geo-features-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              variants={fadeUp} whileHover={{ y: -3, borderColor: 'rgba(255,88,18,0.2)' }}
              className="geo-glass p-6 transition-all duration-300 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-orange-500/5 border border-orange-500/15 flex items-center justify-center mb-4 group-hover:bg-orange-500/10 transition-colors">
                <f.icon size={18} className="text-orange-500" />
              </div>
              <h3 className="text-text-primary text-sm font-bold mb-1.5">{f.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section: Why GEO Matters ────────────────────────────────── */
export function GeoWhyMatters() {
  const stats = [
    { value: '40%', label: 'of searches will be AI-powered by 2026' },
    { value: '68%', label: 'of users trust AI-generated answers' },
    { value: '3x', label: 'higher engagement from AI citations' },
    { value: '80%', label: 'of brands are invisible to AI search' },
  ];

  return (
    <section id="why-geo" className="relative py-28 px-6" style={{ background: 'linear-gradient(180deg, #F3F0EE, #F8F9FC)' }}>
      <div className="geo-ambient-glow w-96 h-96 bg-orange-500/4 top-1/2 left-0 -translate-y-1/2 absolute" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">The Shift</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Why GEO Matters</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-text-secondary max-w-2xl mx-auto text-base leading-relaxed">
            Traditional SEO is no longer enough. AI-powered search engines like ChatGPT, Gemini, and Perplexity are reshaping how customers discover businesses. Generative Engine Optimization ensures your brand remains visible in this new paradigm.
          </motion.p>
        </motion.div>

        <div className="geo-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              variants={fadeUp} whileHover={{ y: -4 }}
              className="geo-glass p-7 text-center transition-all duration-300 group hover:border-orange-500/20">
              <p className="text-4xl font-extrabold geo-gradient-text mb-2">{s.value}</p>
              <p className="text-text-secondary text-sm leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
