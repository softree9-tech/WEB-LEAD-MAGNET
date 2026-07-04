import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import {
  Menu,
  X,
  Settings,
  LayoutDashboard,
  Workflow,
  Server,
  Rocket,
  LineChart,
  Boxes,
  Cpu,
  CloudSnow,
  BrainCircuit,
  Sparkles,
  Bot,
  WandSparkles,
  Building2,
  Code2,
  Globe2,
  Smartphone,
  Layers,
  Info,
  ArrowRight,
  ChevronDown,
  BookOpen,
  Briefcase,
  FileText,
} from "lucide-react";

// Images for dropdown columns
const dropdownImages = [
  "/images/case-study/power-apps/automated.jpg", // Business Apps
  "/images/ai/analytics.jpg", // Data & Analytics
  "/images/ai/ai-agent.jpg", // AI & Automation
  "/images/case-study/mobile/education.png", // Digital Workspace
];

const colConfig = [
  { accent: "#FF7A2F", bg: "#E6F1FB", label: "Business Apps" },
  { accent: "#FF7A2F", bg: "#EAF3DE", label: "Data & Analytics" },
  { accent: "#FF7A2F", bg: "#FAEEDA", label: "AI & Automation" },
  { accent: "#FF7A2F", bg: "#FAEEDA", label: "Digital Workspace" },
];

const SOFTREE_BASE = "https://www.softreetechnology.com";

const menu = [
  { label: "About", url: `${SOFTREE_BASE}/about-us`, icon: Info },
  {
    label: "Services",
    url: `${SOFTREE_BASE}/services`,
    icon: Settings,
    mega: true,
    children: [
      {
        title: "BUSINESS APPLICATIONS",
        description: "Power Platform at enterprise scale.",
        links: [
          { label: "Power Apps", url: `${SOFTREE_BASE}/services/offshore-power-platform-development`, icon: LayoutDashboard, description: "Low-code delivery" },
          { label: "Power Automate", url: `${SOFTREE_BASE}/services/offshore-power-platform-development`, icon: Workflow, description: "Workflow automation" },
          { label: "Dataverse", url: `${SOFTREE_BASE}/services/offshore-power-platform-development`, icon: Server, description: "Unified data layer" },
          { label: "MVP Development", url: `${SOFTREE_BASE}/services/mvp`, icon: Rocket, description: "Launch faster" },
        ],
      },
      {
        title: "DATA & ANALYTICS",
        description: "Intelligence from raw data.",
        links: [
          { label: "Power BI", url: `${SOFTREE_BASE}/services/offshore-data-analytics`, icon: LineChart, description: "Executive dashboards" },
          { label: "Microsoft Fabric", url: `${SOFTREE_BASE}/services/offshore-microsoft-fabric`, icon: Boxes, description: "Unified analytics" },
          { label: "Databricks", url: `${SOFTREE_BASE}/services/offshore-data-analytics`, icon: Cpu, description: "ML pipelines" },
          { label: "Snowflake", url: `${SOFTREE_BASE}/services/offshore-data-analytics`, icon: CloudSnow, description: "Cloud warehouse" },
        ],
      },
      {
        title: "AI & AUTOMATION",
        description: "Intelligence in every workflow.",
        links: [
          { label: "AI Test Automation", url: `${SOFTREE_BASE}/services/ai-powered-test-automation`, icon: BrainCircuit, description: "Quality at speed" },
          { label: "AI Agents", url: `${SOFTREE_BASE}/services/offshore-ai-development`, icon: Bot, description: "Autonomous tasks" },
          { label: "Generative AI", url: `${SOFTREE_BASE}/services/offshore-generative-ai-development`, icon: WandSparkles, description: "RAG & copilots" },
        ],
      },
      {
        title: "DIGITAL WORKSPACE",
        description: "Modern apps for connected teams.",
        links: [
          { label: "Legacy Modernization", url: `${SOFTREE_BASE}/services/legacy-application-modernization`, icon: Sparkles, description: "Architecture refresh" },
          { label: "SharePoint Online", url: `${SOFTREE_BASE}/services/offshore-sharepoint-development`, icon: Building2, description: "Intranets" },
          { label: "SPFx Development", url: `${SOFTREE_BASE}/services/offshore-spfx-development`, icon: Code2, description: "Custom SPFx" },
          { label: "Web Applications", url: `${SOFTREE_BASE}/services/offshore-web-app-development`, icon: Globe2, description: "Portals & apps" },
          { label: "Mobile Applications", url: `${SOFTREE_BASE}/services/offshore-mobile-app-development`, icon: Smartphone, description: "iOS & Android" },
        ],
      },
    ],
  },
  {
    label: "Case Studies",
    url: `${SOFTREE_BASE}/case-studies`,
    icon: Layers,
    mega: true,
    children: [
      {
        title: "MICROSOFT & DATA",
        description: "Power Platform, SharePoint, and analytics delivery.",
        links: [
          { label: "Power Platform", url: `${SOFTREE_BASE}/case-studies`, icon: Layers, description: "Power Apps • Power Automate • Dataverse" },
        ],
      },
      {
        title: "AI & AUTOMATION",
        description: "Intelligent systems with measurable outcomes.",
        links: [
          { label: "AI", url: `${SOFTREE_BASE}/case-studies`, icon: Layers, description: "Artificial Intelligence • Machine Learning" },
        ],
      },
    ],
  },
  {
    label: "Blog",
    url: `${SOFTREE_BASE}/blog`,
    icon: BookOpen,
    mega: true,
    children: [
      {
        title: "MICROSOFT 365",
        description: "Latest in microsoft 365",
        links: [
          { label: "10 Best Power Platform Development Services", url: `${SOFTREE_BASE}/blog`, icon: FileText, description: "Modern businesses face increasing pressure to automate processes and create custom applications without heavy IT investment. Between citizen development initiat" },
          { label: "10 Best SharePoint Development Services", url: `${SOFTREE_BASE}/blog`, icon: FileText, description: "Modern enterprises face increasing pressure to create collaborative digital workplaces that streamline operations and enhance productivity. Between managing doc" },
        ],
      },
      {
        title: "MOBILE DEVELOPMENT",
        description: "Latest in mobile development",
        links: [
          { label: "10 Best Mobile App Development Services", url: `${SOFTREE_BASE}/blog`, icon: FileText, description: "Modern businesses face increasing pressure to deliver mobile applications that engage users and drive business value. Between platform fragmentation, performanc" },
        ],
      },
      {
        title: "WEB DEVELOPMENT",
        description: "Latest in web development",
        links: [
          { label: "10 Best React Development Services", url: `${SOFTREE_BASE}/blog`, icon: FileText, description: "Modern businesses face increasing pressure to build fast, responsive web applications with exceptional user experiences. Between component complexity, state man" },
        ],
      },
    ],
  },
  { label: "Careers", url: `${SOFTREE_BASE}/careers`, icon: Briefcase },
];

function buildBlogChildren(blogCategories) {
  return blogCategories
    .filter((cat) => cat.posts && cat.posts.length > 0)
    .slice(0, 4)
    .map((cat) => ({
      title: cat.title,
      description: `Latest ${cat.title.toLowerCase()} articles`,
      links: cat.posts.map((post) => ({
        label: post.title,
        url: `${SOFTREE_BASE}/blog/${post.slug.current}`,
        icon: FileText,
        description: post.excerpt || "",
      })),
    }));
}

function buildCaseStudyChildren(caseStudyCategories) {
  return caseStudyCategories
    .filter((cat) => cat.caseStudies && cat.caseStudies.length > 0)
    .slice(0, 4)
    .map((cat) => ({
      title: cat.title,
      description: cat.description,
      image: cat.image,
      links: cat.caseStudies.map((study) => ({
        label: study.title,
        url: `${SOFTREE_BASE}/case-studies/${study.slug.current}`,
        icon: Layers,
        description: study.excerpt || study.client || "",
      })),
    }));
}

const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const MEGA_FOOTER = {
  Services: { label: "Explore all services", href: `${SOFTREE_BASE}/services` },
  "Case Studies": { label: "View all case studies", href: `${SOFTREE_BASE}/case-studies` },
  Blog: { label: "View all articles", href: `${SOFTREE_BASE}/blog` },
};

export default function Navigation({ blogCategories = [], caseStudyCategories = [] }) {
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const lastScrollY = useRef(0);
  const closeTimer = useRef(null);

  const openMenu = (label) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(label);
  };

  const scheduleCloseMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  const dynamicMenu = useMemo(() => {
    const blogChildren = buildBlogChildren(blogCategories);
    const caseStudyChildren = buildCaseStudyChildren(caseStudyCategories);

    return menu.map((item) => {
      if (item.label === "Blog" && blogChildren.length > 0) {
        return { ...item, children: blogChildren };
      }
      if (item.label === "Case Studies" && caseStudyChildren.length > 0) {
        return { ...item, children: caseStudyChildren };
      }
      return item;
    });
  }, [blogCategories, caseStudyCategories]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 20 || currentScrollY < lastScrollY.current) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showNav ? "translate-y-0" : "-translate-y-full"}`}
    >
      <style>{`nav.st-nav a, nav.st-nav a:hover, nav.st-nav a:visited { text-decoration: none !important; }`}</style>
      <nav className="st-nav relative w-full max-w-7xl mx-6 lg:mx-12 mt-2 px-6 lg:px-12 h-[72px] flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <a href="https://www.softreetechnology.com" className="inline-block shrink-0 flex items-center gap-2">
          <Logo size={32} />
        </a>

        {/* ── DESKTOP ── */}
        <div className="hidden lg:flex items-center gap-1">
          {dynamicMenu.map((item) => {
            if (!item.mega) {
              return (
                <a
                  key={item.label}
                  href={item.url || "#"}
                  className="group relative px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-gray-900 hover:bg-gray-100/50"
                >
                  {item.label}
                </a>
              );
            }

            const columnCount = Math.min(item.children?.length || 1, 4);

            return (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => openMenu(item.label)}
                onMouseLeave={scheduleCloseMenu}
                onFocus={() => openMenu(item.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    scheduleCloseMenu();
                  }
                }}
              >
                <a
                  href={item.url || "#"}
                  aria-haspopup="true"
                  aria-expanded={open === item.label}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-orange-600 hover:bg-orange-50/50"
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${open === item.label ? "rotate-180 text-orange-600" : "text-gray-400 group-hover:text-orange-500"}`}
                  />
                </a>

                {/* ── MEGA MENU ── */}
                <AnimatePresence>
                  {open === item.label && item.children && item.children.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      onMouseEnter={() => openMenu(item.label)}
                      onMouseLeave={scheduleCloseMenu}
                      className="fixed top-[84px] left-1/2 -translate-x-1/2 w-[1200px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl border border-gray-100 shadow-[0_24px_80px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                    >
                        <div className="flex">
                          {/* Left Sidebar */}
                          <div className="w-[280px] shrink-0 p-8 flex flex-col justify-between" style={{ background: item.label === "Case Studies" ? 'linear-gradient(135deg, #74a0c8 0%, #355877 100%)' : item.label === "Blog" ? 'linear-gradient(135deg, #a66cf0 0%, #683fb5 100%)' : 'linear-gradient(135deg, #e39668 0%, #b85e23 100%)' }}>
                            <div className="relative z-10">
                              <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider mb-6">
                                ● {item.label === "Case Studies" ? "PROOF" : item.label === "Blog" ? "INSIGHTS" : "CAPABILITIES"}
                              </div>
                              <h3 className="text-[28px] font-bold text-white mb-3">{item.label}</h3>
                              <p className="text-white/80 text-[14px] leading-relaxed pr-2">
                                {item.label === "Case Studies" ? "Customer stories organized by solution area." : item.label === "Blog" ? "Practical notes on platforms, AI, and software delivery." : "Microsoft, data, AI, and product engineering — one delivery standard."}
                              </p>
                            </div>
                            <a href={item.url} className="relative z-10 text-white font-medium text-[14px] hover:text-white/80 flex items-center gap-1.5 transition-colors mt-8">
                              {item.label === "Case Studies" ? "All case studies" : item.label === "Blog" ? "All articles" : "All services"} <ArrowRight size={16} className="-rotate-45" />
                            </a>
                          </div>

                          {/* Right Content */}
                          <div className="flex-1 flex flex-col bg-white">
                            <div className="flex-1 p-8 overflow-y-auto">
                              <div className={`grid gap-6 ${GRID_COLS[columnCount] ?? "grid-cols-4"}`}>
                                {item.children?.map((group, idx) => {
                                  const bulletColor = idx % 2 === 0 ? "text-orange-500" : "text-blue-500";
                                  return (
                                    <div key={group.title}>
                                      <div className="mb-5">
                                        <h4 className="text-[12px] font-bold tracking-widest text-gray-900 uppercase flex items-center gap-2 mb-1.5">
                                          <span className={bulletColor}>●</span> {group.title}
                                        </h4>
                                        {group.description && <p className="text-[12px] text-gray-500 leading-snug">{group.description}</p>}
                                      </div>
                                      <div className="flex flex-col gap-4">
                                        {group.links.map((link) => {
                                          const Icon = link.icon;
                                          return (
                                            <a key={link.label} href={link.url} className="group/link flex gap-3 transition-colors">
                                              <div className="shrink-0 mt-0.5 text-gray-400 group-hover/link:text-gray-900 transition-colors">
                                                {Icon && <Icon size={16} strokeWidth={1.5} />}
                                              </div>
                                              <div>
                                                <div className="text-[13px] font-semibold text-gray-900 leading-snug group-hover/link:text-orange-600 transition-colors">{link.label}</div>
                                                {link.description && <div className="text-[12px] text-gray-500 mt-1 leading-relaxed">{link.description}</div>}
                                              </div>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Footer for Right Side */}
                            <div className="border-t border-gray-100 bg-white px-8 py-4 flex items-center justify-between">
                              <p className="text-[13px] text-gray-600">
                                Book a discovery call
                              </p>
                              <a href="https://www.softreetechnology.com/contact" className="text-[13px] text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors group/f">
                                Get a quote <ArrowRight size={14} className="group-hover/f:translate-x-0.5 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── CTA ── */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="https://www.softreetechnology.com/book-meeting"
            className="inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-semibold text-white transition-all duration-300 rounded-full hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF7A2F 0%, #E85A1F 100%)",
            }}
          >
            Book a Call
          </a>
          <a
            href="https://www.softreetechnology.com/contact"
            className="inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-semibold text-gray-900 bg-white border border-gray-200 transition-all duration-300 rounded-full hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95"
          >
            Get Started
          </a>
        </div>

        {/* ── MOBILE TOGGLE ── */}
        <button
          className="lg:hidden relative z-[60] text-gray-700 shrink-0 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <motion.div
            initial={false}
            animate={{ rotate: mobileOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </button>

        {/* ── MOBILE PANEL ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 w-full h-screen bg-white z-40 px-6 pt-24 pb-10 overflow-y-auto lg:hidden"
            >
              <div className="flex flex-col gap-4">
                {dynamicMenu.map((item) => (
                  <div key={item.label}>
                    {item.mega ? (
                      <button
                        onClick={() => {
                          setMobileDropdown(
                            mobileDropdown === item.label ? null : item.label,
                          );
                        }}
                        className="w-full flex items-center justify-between py-4 border-b border-gray-200 text-left"
                      >
                        <span className="text-lg font-semibold text-gray-900">
                          {item.label}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-900 transition-transform ${mobileDropdown === item.label ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                    ) : (
                      <a
                        href={item.url || "#"}
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center justify-between py-4 border-b border-gray-200 text-left"
                      >
                        <span className="text-lg font-semibold text-gray-900">
                          {item.label}
                        </span>
                      </a>
                    )}

                    {item.mega && mobileDropdown === item.label && (
                      <div className="pl-4 mt-3 space-y-6 pb-2">
                        {item.children?.map((group, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
                              {group.title}
                            </h4>
                            <div className="flex flex-col gap-3 pl-2 border-l-2 border-gray-100">
                              {group.links.map((link) => (
                                <a
                                  key={link.label}
                                  href={link.url}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-1 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <a
                  href="https://www.softreetechnology.com/book-meeting"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: "linear-gradient(135deg, #FF7A2F 0%, #E85A1F 100%)",
                  }}
                  className="group mt-6 flex items-center justify-center gap-1.5 px-6 py-3.5 text-white rounded-full font-semibold hover:shadow-md transition"
                >
                  Book a Call
                </a>

                <a
                  href="https://www.softreetechnology.com/contact"
                  onClick={() => setMobileOpen(false)}
                  className="group mt-2 flex items-center justify-center gap-1.5 px-6 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-full font-semibold hover:bg-gray-50 transition"
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
