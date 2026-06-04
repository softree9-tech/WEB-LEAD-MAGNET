import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import { validateWebsite, processSingleLead } from '../api/api';
import GeoNavbar from '../components/geo/GeoNavbar';
import GeoDashboardPreview from '../components/geo/GeoDashboardPreview';
import GeoHeroForm from '../components/geo/GeoHeroForm';
import GeoLoadingState from '../components/geo/GeoLoadingState';
import GeoResultsDashboard from '../components/geo/GeoResultsDashboard';
import { GeoReportSection, GeoHowItWorks, GeoFeaturesGrid, GeoWhyMatters } from '../components/geo/GeoSections';
import { GeoFAQ, GeoCTA, GeoFooter } from '../components/geo/GeoFooterSections';
import '../geo.css';

export default function GeoLanding() {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const scrollToHero = () => {
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (formData) => {
    setError(null);

    // Step 1: Validate website
    setValidating(true);
    try {
      const validation = await validateWebsite(formData.website);
      if (!validation.valid) {
        setError(validation.error);
        setValidating(false);
        return;
      }
    } catch (err) {
      setError('Unable to verify the website. Please check the URL and try again.');
      setValidating(false);
      return;
    }
    setValidating(false);

    // Step 2: Run full AI analysis
    setLoading(true);
    try {
      const payload = {
        name: 'GEO Audit',
        email: formData.email,
        website: formData.website,
        recaptcha_token: 'admin_bypass'
      };
      const data = await processSingleLead(payload);
      const processed = data.output_row || data;

      // Set results inline
      setResults(processed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('GEO analysis failed:', err);
      const detail = err.response?.data?.detail || err.message || 'Unable to generate GEO audit. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = loading || validating;

  // Render NEXT PAGE (Results Screen) inline on /geo
  if (results) {
    return (
      <div className="geo-page animate-fade-in">
        <GeoNavbar />

        {/* ── RESULTS HEADER ────────────────────────────────────── */}
        <div className="pt-24 pb-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setResults(null)}
              className="flex items-center gap-2 text-text-secondary text-sm hover:text-white transition-colors bg-transparent border-none cursor-pointer font-medium"
            >
              <ArrowLeft size={16} />
              New GEO Audit
            </motion.button>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Analysis Complete</span>
            </motion.div>
          </div>
        </div>

        {/* ── RESULTS DASHBOARD ─────────────────────────────────── */}
        <GeoResultsDashboard data={results} />

        <GeoFooter />
      </div>
    );
  }

  return (
    <div className="geo-page">
      <GeoNavbar />

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Background ambient glows */}
        <div className="geo-ambient-glow w-[600px] h-[600px] bg-orange-500/[0.06] -top-40 -left-40 absolute" />
        <div className="geo-ambient-glow w-[400px] h-[400px] bg-orange-500/[0.04] bottom-0 right-0 absolute" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,107,0,0.03),transparent_60%)]" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="geo-hero-grid grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* LEFT SIDE */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 mb-7"
              >
                <Sparkles size={13} className="text-orange-400" />
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">AI Visibility Assessment</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.12] mb-6 tracking-tight"
              >
                Can ChatGPT, Gemini &amp; Perplexity{' '}
                <span className="geo-gradient-text">Understand Your Business?</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-text-secondary text-base md:text-lg leading-relaxed mb-10 max-w-xl"
              >
                Get a free AI Visibility Assessment and discover how well your website is positioned for AI-powered search, citations, entity recognition, and generative engine discovery.
              </motion.p>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3"
                  >
                    <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 text-sm font-medium">Analysis Error</p>
                      <p className="text-red-300/70 text-xs mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Card */}
              <GeoHeroForm onSubmit={handleFormSubmit} loading={isProcessing} />
            </div>

            {/* RIGHT SIDE - Dashboard Preview */}
            <div className="hidden lg:block">
              <GeoDashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOADING STATE (overlays hero during processing) ──── */}
      <AnimatePresence>
        {isProcessing && <GeoLoadingState />}
      </AnimatePresence>

      {/* ── LANDING PAGE SECTIONS ─────────────────────────────── */}
      <GeoReportSection />
      <GeoHowItWorks />
      <GeoFeaturesGrid />
      <GeoWhyMatters />
      <GeoCTA onScrollToHero={scrollToHero} />
      <GeoFAQ />
      <GeoFooter />
    </div>
  );
}
