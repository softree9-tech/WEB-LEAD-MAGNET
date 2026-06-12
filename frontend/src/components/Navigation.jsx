import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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

const menu = [
  { label: "About", url: "/about-us", icon: Info },
  {
    label: "Services",
    url: "/services",
    icon: Settings,
    mega: true,
    children: [
      {
        title: "Business Applications Delivery Support",
        description: "Scalable Power Platform solutions built for enterprise delivery.",
        links: [
          { label: "Power Apps", url: "/services/offshore-power-platform-development", icon: LayoutDashboard, description: "Low-code app development" },
          { label: "Power Automate", url: "/services/offshore-power-platform-development", icon: Workflow, description: "Workflow automation" },
          { label: "Dataverse", url: "/services/offshore-power-platform-development", icon: Server, description: "Unified data platform" },
          { label: "MVP Development", url: "/services/mvp", icon: Rocket, description: "Build and launch your product" },
        ],
      },
      {
        title: "Data & Analytics Execution",
        description: "Turn raw data into strategic intelligence at any scale.",
        links: [
          { label: "Power BI", url: "/services/offshore-data-analytics", icon: LineChart, description: "Business dashboards" },
          { label: "Microsoft Fabric", url: "/services/offshore-microsoft-fabric", icon: Boxes, description: "Unified analytics platform" },
          { label: "Databricks", url: "/services/offshore-data-analytics", icon: Cpu, description: "Big data & ML pipelines" },
          { label: "Snowflake", url: "/services/offshore-data-analytics", icon: CloudSnow, description: "Cloud data warehousing" },
        ],
      },
      {
        title: "AI & Intelligent Automation",
        description: "Embed intelligence into every process and workflow.",
        links: [
          { label: "AI Powered Test Automation", url: "/services/ai-powered-test-automation", icon: BrainCircuit, description: "Enterprise AI platform" },
          { label: "AI Agents", url: "/services/offshore-ai-development", icon: Bot, description: "Autonomous task execution" },
          { label: "Generative AI", url: "/services/offshore-generative-ai-development", icon: WandSparkles, description: "Retrieval-augmented generation" },
        ],
      },
      {
        title: "Digital Workspace & App Engineering",
        description: "Modern digital experiences for connected, productive teams.",
        links: [
          { label: "Legacy Modernization", url: "/services/legacy-application-modernization", icon: Sparkles, description: "Transform outdated systems with modern architecture." },
          { label: "SharePoint Online", url: "/services/offshore-sharepoint-development", icon: Building2, description: "Intranet & collaboration" },
          { label: "SPFx Development", url: "/services/offshore-spfx-development", icon: Code2, description: "Custom SharePoint Framework solutions" },
          { label: "Web Applications", url: "/services/offshore-web-app-development", icon: Globe2, description: "Custom web portals & apps" },
          { label: "Mobile Applications", url: "/services/offshore-mobile-app-development", icon: Smartphone, description: "Cross-platform mobile apps" },
        ],
      },
    ],
  },
  { label: "Case Studies", url: "/case-studies", icon: Layers, mega: true, children: [] },
  { label: "Blog", url: "/blog", icon: BookOpen, mega: true, children: [] },
  { label: "Careers", url: "/careers", icon: Briefcase },
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
        url: `/blog/${post.slug.current}`,
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
        url: `/case-studies/${study.slug.current}`,
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
  Services: { label: "Explore all services", href: "/services" },
  "Case Studies": { label: "View all case studies", href: "/case-studies" },
  Blog: { label: "View all articles", href: "/blog" },
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
                <Link
                  key={item.label}
                  to={item.url || "#"}
                  className="group relative px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-gray-900 hover:bg-gray-100/50"
                >
                  {item.label}
                </Link>
              );
            }

            const columnCount = Math.min(item.children?.length || 1, 4);

            return (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => openMenu(item.label)}
                onMouseLeave={scheduleCloseMenu}
              >
                <Link
                  to={item.url || "#"}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 rounded-lg transition-all duration-200 hover:text-orange-600 hover:bg-orange-50/50"
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${open === item.label ? "rotate-180 text-orange-600" : "text-gray-400 group-hover:text-orange-500"}`}
                  />
                </Link>

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
                      className="fixed top-[84px] left-1/2 -translate-x-1/2 w-[1100px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl border border-gray-100 shadow-[0_24px_80px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                    >
                      {/* Header */}
                      <div className="px-8 pt-5 pb-4 border-b border-gray-100">
                        <Link
                          to={item.url || "#"}
                          className="group/drawer-title flex items-center gap-x-2"
                        >
                          <span className="text-xl font-semibold text-gray-900">
                            {item.label}
                          </span>
                          <ArrowRight
                            size={18}
                            className="text-gray-400 transition-transform group-hover/drawer-title:translate-x-1"
                          />
                        </Link>
                      </div>

                      <div className={`grid gap-0 ${GRID_COLS[columnCount] ?? "grid-cols-4"}`}>
                        {item.children?.map((group, idx) => {
                          const cfg = colConfig[idx] ?? {
                            accent: null,
                            bg: null,
                            label: group.title,
                          };

                          return (
                            <div
                              key={group.title}
                              className={`px-5 py-5 ${idx < item.children.length - 1
                                ? "border-r border-gray-100"
                                : ""
                                }`}
                            >
                              {/* Service Visual - Image at top */}
                              <div className="relative h-[110px] overflow-hidden rounded-xl border border-gray-200 bg-gray-900 mb-4 group/image">
                                <img
                                  alt={cfg.label}
                                  className="h-full w-full object-cover object-center opacity-95 transition-all duration-500 group-hover/image:scale-105"
                                  src={group.image || dropdownImages[idx]}
                                  onError={(e) => {
                                    // Fallback: hide image and show gradient background
                                    e.target.style.display = "none";
                                    e.target.parentElement.style.background =
                                      `linear-gradient(135deg, ${cfg.bg} 0%, ${cfg.accent}20 100%)`;
                                  }}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <span className="absolute bottom-2.5 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-900 shadow-sm">
                                  {cfg.label}
                                </span>
                              </div>

                              {/* links */}
                              <div className="flex flex-col gap-0.5">
                                {group.links.map((link) => {
                                  const Icon = link.icon;
                                  return (
                                    <Link
                                      key={link.label}
                                      to={link.url}
                                      className="group/link flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-all duration-150"
                                    >
                                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 group-hover/link:bg-orange-500 transition-all duration-200">
                                        {Icon && (
                                          <Icon
                                            size={17}
                                            className="text-gray-600 group-hover/link:text-white transition-colors"
                                          />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-gray-900 leading-snug">
                                          {link.label}
                                        </p>
                                        {link.description && (
                                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                            {link.description}
                                          </p>
                                        )}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* footer */}
                      <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-4 flex items-center justify-between">
                        <p className="text-[13px] text-gray-500">
                          Need guidance?{" "}
                          <Link
                            to="/book-meeting"
                            className="text-gray-900 font-semibold hover:text-orange-600 transition-colors"
                          >
                            Book a discovery call →
                          </Link>
                        </p>
                        <div className="flex items-center gap-6">
                          {MEGA_FOOTER[item.label] && (
                            <Link
                              to={MEGA_FOOTER[item.label].href}
                              className="text-[13px] font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors group/f"
                            >
                              {MEGA_FOOTER[item.label].label}
                              <ArrowRight
                                size={14}
                                className="group-hover/f:translate-x-0.5 transition-transform"
                              />
                            </Link>
                          )}
                          <Link
                            to="/contact"
                            className="text-[13px] font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors group/f"
                          >
                            Get a quote
                            <ArrowRight
                              size={14}
                              className="group-hover/f:translate-x-0.5 transition-transform"
                            />
                          </Link>
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
          <Link
            to="/book-meeting"
            className="inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-semibold text-white transition-all duration-300 rounded-full hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF7A2F 0%, #E85A1F 100%)",
            }}
          >
            Book a Call
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-semibold text-gray-900 bg-white border border-gray-200 transition-all duration-300 rounded-full hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95"
          >
            Get Started
          </Link>
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
                      <Link
                        to={item.url || "#"}
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center justify-between py-4 border-b border-gray-200 text-left"
                      >
                        <span className="text-lg font-semibold text-gray-900">
                          {item.label}
                        </span>
                      </Link>
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
                                <Link
                                  key={link.label}
                                  to={link.url}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-1 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <Link
                  to="/book-meeting"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: "linear-gradient(135deg, #FF7A2F 0%, #E85A1F 100%)",
                  }}
                  className="group mt-6 flex items-center justify-center gap-1.5 px-6 py-3.5 text-white rounded-full font-semibold hover:shadow-md transition"
                >
                  Book a Call
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="group mt-2 flex items-center justify-center gap-1.5 px-6 py-3.5 border border-gray-200 text-gray-900 bg-white rounded-full font-semibold hover:bg-gray-50 transition"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
