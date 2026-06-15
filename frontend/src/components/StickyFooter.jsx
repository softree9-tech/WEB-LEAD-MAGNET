import React, { useState } from "react";
import { Link } from "react-router-dom";
const Linkedin = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const Twitter = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Facebook = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Instagram = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
import { motion } from "framer-motion";
import Logo from "./Logo"; // Fallback if image fails

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Fallback for Grainient if it doesn't exist in the project
function Grainient({ color1, color2, color3 }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
        opacity: 0.9,
      }}
    />
  );
}

const CREAM = "#F6F1E6";
const LOGO_LIGHT = "/logo/Softree-Technology-Final-Logo.png";
const LOGO_LIGHT_BG = "/logo/Softree-Technology-Final-Logo-Light-BG.png";

const footerColumns = [
  {
    label: "Company",
    links: [
      { title: "Home", href: "https://www.softreetechnology.com" },
      { title: "About Us", href: "https://www.softreetechnology.com/about-us" },
      { title: "Case Studies", href: "https://www.softreetechnology.com/case-studies" },
      { title: "Careers", href: "https://www.softreetechnology.com/careers" },
      { title: "Contact", href: "https://www.softreetechnology.com/contact" },
      { title: "Book a Call 🤝", href: "https://www.softreetechnology.com/book-meeting" },
    ],
  },
  {
    label: "Connect",
    links: [
      { title: "LinkedIn", href: "https://www.linkedin.com/company/softree-technology-pvt-ltd/", external: true },
      { title: "Twitter", href: "https://x.com/softreetechnology", external: true },
      { title: "Facebook", href: "https://www.facebook.com/softreetechnology", external: true },
      { title: "Instagram", href: "https://www.instagram.com/softreetechnology/", external: true },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Blog", href: "https://www.softreetechnology.com/blog" },
      { title: "Services", href: "https://www.softreetechnology.com/services" },
      { title: "Privacy Policy", href: "https://www.softreetechnology.com/privacy-policy" },
      { title: "Terms of Service", href: "https://www.softreetechnology.com/terms" },
    ],
  },
];

const SOCIAL_PILLS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/softree-technology-pvt-ltd/",
    icon: Linkedin,
    gradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
  },
  {
    id: "twitter",
    label: "Twitter",
    href: "https://x.com/softreetechnology",
    icon: Twitter,
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/softreetechnology",
    icon: Facebook,
    gradient: "linear-gradient(135deg, #1877F2 0%, #0a4dbb 100%)",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/softreetechnology/",
    icon: Instagram,
    gradient: "linear-gradient(135deg, #F58529 0%, #DD2A7B 45%, #8134AF 75%, #515BD4 100%)",
  },
];

/* Social pills row — exact same flex-expand mechanic as mission/vision cards */
function SocialPillRow() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="mt-8 flex h-11 items-center gap-2">
      {SOCIAL_PILLS.map((pill) => {
        const Icon = pill.icon;
        const isHovered = hovered === pill.id;
        return (
          <motion.div
            key={pill.id}
            animate={{ width: isHovered ? "auto" : 44 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-11 overflow-hidden rounded-full"
            style={{ background: pill.gradient, minWidth: 44 }}
            onMouseEnter={() => setHovered(pill.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <a
              href={pill.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={pill.label}
              className="flex h-full items-center text-white"
              style={{ width: "max-content", textDecoration: "none" }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <motion.span
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, delay: isHovered ? 0.18 : 0 }}
                className="whitespace-nowrap pr-4 text-[13px] font-semibold"
              >
                {pill.label}
              </motion.span>
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}

/* Tiny external-link arrow */
function Arrow() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="ml-0.5 inline-block opacity-50">
      <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StickyFooter({ className, ...props }) {
  return (
    <footer className={cn("w-full bg-black", className)} {...props}>
      {/* FULL-WIDTH CARD — fills entire viewport height */}
      <div className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: 560 }}>
        {/* Layer 1 — Purple Grainient full-bleed */}
        <div className="absolute inset-0 z-0">
          <Grainient
            color1="#ff7a2f"
            color2="#b84500"
            color3="#0d0500"
            grainAmount={0.22}
            grainAnimated
            warpStrength={1.5}
            warpFrequency={4.5}
            warpSpeed={1.0}
            warpAmplitude={32}
            contrast={1.7}
            saturation={1.4}
            zoom={0.9}
          />
        </div>

        {/* Layer 2 — Cream shape with stepped diagonal */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: CREAM,
            clipPath: "polygon(0 0, 100% 0, 100% 65%, 40% 65%, 32% 57%, 0 57%)",
          }}
        />

        {/* Layer 3 — Purple zone: wordmark + metadata stacked at bottom-left, logo at bottom-right */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-start justify-end pb-5 px-8 md:px-12 lg:px-16"
          style={{ height: "43%" }}
        >
          {/* Giant white SOFTREE. wordmark */}
          <div aria-hidden className="w-full overflow-hidden leading-none mb-3">
            <span
              className="select-none font-black leading-none tracking-[-0.045em] text-white whitespace-nowrap block"
              style={{
                fontSize: "clamp(72px, 12vw, 190px)",
                opacity: 1,
                lineHeight: 0.88,
                transform: "translateX(-0.02em)",
              }}
            >
              SOFTREE.
            </span>
          </div>
          {/* Metadata row below wordmark */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a
              href="https://www.softreetechnology.com/privacy-policy"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white transition-colors no-underline"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.softreetechnology.com/terms"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white transition-colors no-underline"
            >
              Terms of Service
            </a>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              © {new Date().getFullYear()} Softree Technology
            </p>
          </div>
        </div>

        {/* Logo — bottom-right of purple zone */}
        <a href="https://www.softreetechnology.com" className="absolute bottom-5 right-8 z-20 md:right-12 lg:right-16 text-white/70 hover:text-white transition-opacity">
          <img
            src={LOGO_LIGHT_BG}
            alt="Softree Technology"
            className="h-7 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </a>

        {/* Layer 4 — All content */}
        <div className="relative z-30 flex h-full flex-col px-8 pt-7 pb-6 md:px-12 md:pt-8 lg:px-16">
          {/* TOP BAR — real logo + CTAs */}
          <div className="flex items-center justify-between">
            <a href="https://www.softreetechnology.com" aria-label="Softree home" className="flex items-center gap-2">
              <img
                src={LOGO_LIGHT}
                alt="Softree Technology"
                className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }}><Logo size={32} /></div>
            </a>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.softreetechnology.com/services"
                className="flex h-9 items-center rounded-full border border-black/25 px-4 text-[12px] font-semibold text-black transition-all hover:border-black/60 hover:bg-black/5 no-underline"
              >
                Our Services
              </a>
              <a
                href="https://www.softreetechnology.com/book-meeting"
                className="flex h-9 items-center rounded-full border border-black/25 px-4 text-[12px] font-semibold text-black transition-all hover:border-black/60 hover:bg-black/5 no-underline"
              >
                Book a Call
              </a>
              <a
                href="https://www.softreetechnology.com/contact"
                className="flex h-9 items-center rounded-full px-5 text-[12px] font-bold text-white transition-all hover:opacity-90 no-underline"
                style={{ background: "linear-gradient(135deg, rgba(255,122,47,0.97) 0%, rgba(200,80,20,0.92) 100%)" }}
              >
                Get in Touch
              </a>
            </div>
          </div>

          {/* 3-COLUMN NAV */}
          <div className="mt-12 grid flex-1 grid-cols-3 gap-x-12 gap-y-6 md:mt-14">
            {footerColumns.map((col) => (
              <div key={col.label} className="flex flex-col">
                <p className="mb-5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-black">
                  {col.label}
                </p>
                <ul className="space-y-[18px] list-none p-0 m-0">
                  {col.links.map((link) => (
                    <li key={link.title}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[16px] font-medium text-black transition-colors hover:text-black/70 no-underline"
                        >
                          {link.title}
                          <Arrow />
                        </a>
                      ) : link.href.startsWith("http") ? (
                        <a
                          href={link.href}
                          className="inline-flex items-center text-[16px] font-medium text-black transition-colors hover:text-black/70 no-underline"
                        >
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="inline-flex items-center text-[16px] font-medium text-black transition-colors hover:text-black/70 no-underline"
                        >
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                {/* SOCIAL CTAs — flex row, hover expands like mission/vision cards */}
                {col.label === "Resources" && <SocialPillRow />}
              </div>
            ))}
          </div>

          {/* CREAM-ZONE BOTTOM — spacer so content ends above diagonal */}
          <div className="pt-3 pb-1" />
        </div>
      </div>
    </footer>
  );
}
