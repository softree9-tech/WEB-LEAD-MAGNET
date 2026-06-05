import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

const faqs = [
  {
    q: 'What is GEO?',
    a: 'GEO (Generative Engine Optimization) is the practice of optimizing your digital presence to be discoverable, understood, and cited by AI-powered search engines like ChatGPT, Google Gemini, and Perplexity. It goes beyond traditional SEO by focusing on entity recognition, structured data, and content authority.'
  },
  {
    q: 'How is GEO different from SEO?',
    a: 'While SEO focuses on ranking in traditional search engine results pages, GEO optimizes for AI-generated answers and citations. GEO analyzes entity structures, schema markup, content clarity, and authority signals that AI engines use to generate responses about your business.'
  },
  {
    q: 'What platforms do you analyze?',
    a: 'Our AI Visibility Assessment covers the three major generative AI platforms: ChatGPT (OpenAI), Google Gemini, and Perplexity AI. We analyze how each platform understands, cites, and references your business content.'
  },
  {
    q: 'Is the GEO audit free?',
    a: 'Yes, the initial AI Visibility Assessment is completely free. You receive a comprehensive GEO score, entity analysis, schema audit, and actionable recommendations at no cost. No credit card is required.'
  },
  {
    q: 'How long does the analysis take?',
    a: 'Our multi-agent AI engine typically completes a full GEO analysis in under 60 seconds. The system simultaneously scans content structure, schema markup, entity recognition, and authority signals to generate your report.'
  },
  {
    q: 'What will the report include?',
    a: 'Your GEO report includes an AI Visibility Score, individual platform scores (ChatGPT, Gemini, Perplexity), entity recognition analysis, schema markup audit, content authority assessment, citation readiness score, and prioritized recommendations for improvement.'
  },
];

export function GeoFAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="faqs" className="relative py-28 px-6" style={{ background: 'linear-gradient(180deg, #F8F9FC, #F3F0EE)' }}>
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">Support</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Frequently Asked Questions</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-text-secondary max-w-xl mx-auto text-base">Everything you need to know about GEO and AI visibility optimization.</motion.p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              className={`geo-glass overflow-hidden transition-all duration-300 ${openIdx === i ? 'border-orange-500/20' : ''}`}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-transparent border-none cursor-pointer group"
              >
                <span className={`font-semibold text-sm transition-colors ${openIdx === i ? 'text-orange-500' : 'text-text-primary group-hover:text-orange-600'}`}>
                  {faq.q}
                </span>
                <ChevronDown size={18} className={`text-text-muted transition-transform duration-300 flex-shrink-0 ml-4 ${openIdx === i ? 'rotate-180 text-orange-500' : ''}`} />
              </button>
              <div className={`geo-faq-answer ${openIdx === i ? 'open' : ''}`}>
                <p className="text-text-secondary text-sm leading-relaxed pb-1">{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Section ─────────────────────────────────────────────── */
export function GeoCTA({ onScrollToHero }) {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Ambient glows */}
      <div className="geo-ambient-glow w-[500px] h-[500px] bg-orange-500/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute" />
      <div className="geo-ambient-glow w-72 h-72 bg-orange-500/2 bottom-0 left-20 absolute" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Get Started</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-5 leading-tight">
            Get Your Free AI Visibility Assessment
          </h2>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Enter your website and email to receive your detailed GEO audit report with actionable recommendations.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onScrollToHero}
            className="geo-cta-btn px-10 py-4 text-lg font-bold inline-flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse" />
            Start Free GEO Audit
          </motion.button>
          <p className="text-text-muted text-xs mt-5">No credit card required • Results in under 60 seconds</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────── */
export function GeoFooter() {
  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Why GEO', href: '#why-geo' },
    { label: 'FAQs', href: '#faqs' },
  ];

  return (
    <footer className="border-t border-border-glass py-12 px-6" style={{ background: '#F8F9FC' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand logo removed */}

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-text-muted text-xs hover:text-text-primary transition-colors no-underline">
                {l.label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {['X', 'in', 'G'].map((s) => (
              <div key={s} className="w-8 h-8 rounded-lg bg-black/[0.02] border border-border-glass flex items-center justify-center text-text-muted text-xs font-medium hover:border-orange-500/20 hover:text-orange-500 transition-all cursor-pointer">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-glass text-center">
          <p className="text-text-muted text-xs">© {new Date().getFullYear()} Softree Technology. All rights reserved. AI Growth Intelligence Platform.</p>
        </div>
      </div>
    </footer>
  );
}
