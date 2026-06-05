import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GeoNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'GEO Report', href: '#geo-report' },
    { label: 'Features', href: '#features' },
    { label: 'Why GEO Matters', href: '#why-geo' },
    { label: 'FAQs', href: '#faqs' },
  ];

  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`geo-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        {/* Softree Logo */}
        <a href="/geo" className="flex items-center gap-2 no-underline">
          <img
            src="/softree_logo.png"
            alt="Softree Technology"
            style={{ height: '115px', width: 'auto', display: 'block' }}
          />
        </a>

        {/* Center Links */}
        <div className="geo-navbar-links hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}
              className="text-text-secondary text-sm font-medium hover:text-text-primary transition-colors duration-200 no-underline">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <motion.a href="#hero" onClick={(e) => scrollTo(e, '#hero')}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
          className="geo-cta-btn px-5 py-2.5 text-sm no-underline hidden sm:inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
          AI Growth Intelligence
        </motion.a>
      </div>
    </nav>
  );
}
