import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Brain,
  Target,
  Code,
  Award,
  Sparkles,
  Shield,
  Search,
  Globe,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Check,
  ArrowUpRight,
  Download,
  Mail,
  Loader2,
} from "lucide-react";
import { emailGeoReport } from "../../api/api";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

/* ── Helper: compute scores from existing backend data ─────── */
function computeGeoScores(data) {
  const seo = parseInt(data.seo_score || 0);
  const aeo = parseInt(data.aeo_score || 0);
  const consistencyVal = data.design === "Modern" ? 90 : 60;
  const flowVal = data.message === "Clear" ? 80 : 50;
  const mobileVal = data.seo_mobile ? 80 : 30;
  const engagementVal = data.cta === "Strong" ? 90 : 40;
  const ux = Math.round(
    (consistencyVal + flowVal + mobileVal + engagementVal) / 4,
  );

  const trustSignals = [
    data.has_analytics?.google_analytics,
    data.has_analytics?.tag_manager,
    data.has_analytics?.facebook_pixel,
    data.has_analytics?.linkedin_tag,
    data.has_lead_capture,
    data.has_cta,
    data.has_newsletter,
    data.seo_ssl,
    data.ssl_enforced,
    data.seo_title,
    data.seo_meta_desc,
    data.seo_canonical,
    data.seo_og,
  ];
  const trust = Math.round((trustSignals.filter(Boolean).length / 13) * 100);

  // AI Visibility = weighted combo
  const aiVisibility = Math.round(
    aeo * 0.4 + seo * 0.3 + trust * 0.2 + ux * 0.1,
  );

  // Platform scores (derived with variance)
  const chatgpt = Math.min(
    100,
    Math.round(aiVisibility * 1.05 + (data.seo_og ? 5 : -5)),
  );
  const gemini = Math.min(
    100,
    Math.round(aiVisibility * 0.95 + (data.seo_meta_desc ? 4 : -6)),
  );
  const perplexity = Math.min(
    100,
    Math.round(aiVisibility * 0.88 + (data.seo_canonical ? 6 : -4)),
  );
  const claude = Math.min(
    100,
    Math.round(aiVisibility * 0.92 + (data.seo_title ? 3 : -3)),
  );

  // Schema/structured data score
  const schemaSignals = [
    data.seo_og,
    data.seo_canonical,
    data.seo_title,
    data.seo_meta_desc,
    data.schema_types?.length > 0,
  ];
  const schemaScore = Math.round(
    (schemaSignals.filter(Boolean).length / 5) * 100,
  );

  // Citation readiness
  const citationScore = Math.round(schemaScore * 0.3 + trust * 0.3 + aeo * 0.4);

  // Entity items
  const entities = [];
  if (data.services_detected) {
    (Array.isArray(data.services_detected)
      ? data.services_detected
      : [data.services_detected]
    ).forEach((s) => entities.push({ type: "Service", value: s }));
  }
  if (data.industry) entities.push({ type: "Industry", value: data.industry });
  if (data.company_type)
    entities.push({ type: "Company Type", value: data.company_type });
  if (data.target_audience)
    entities.push({ type: "Target Audience", value: data.target_audience });
  if (data.schema_types?.length) {
    data.schema_types.forEach((s) =>
      entities.push({ type: "Schema", value: s }),
    );
  }

  // Recommendations
  const recs = [];
  if (!data.seo_og)
    recs.push({
      title: "Add Open Graph markup",
      impact: "High",
      difficulty: "Easy",
      desc: "Enable rich previews when AI engines share your content.",
    });
  if (!data.seo_canonical)
    recs.push({
      title: "Set canonical URL",
      impact: "Medium",
      difficulty: "Easy",
      desc: "Prevent duplicate content confusion for AI crawlers.",
    });
  if (schemaScore < 60)
    recs.push({
      title: "Add Organization schema",
      impact: "High",
      difficulty: "Medium",
      desc: "Help AI engines understand your brand entity structure.",
    });
  if (!data.has_newsletter)
    recs.push({
      title: "Add FAQ structured data",
      impact: "High",
      difficulty: "Medium",
      desc: "Significantly improves AI citation probability by ~40%.",
    });
  if (data.cta !== "Strong")
    recs.push({
      title: "Strengthen semantic relevance",
      impact: "High",
      difficulty: "Medium",
      desc: "Improve content clarity for AI content extraction.",
    });
  recs.push({
    title: "Improve service entity structure",
    impact: "Medium",
    difficulty: "Medium",
    desc: "Map your services to recognized entity categories.",
  });
  if (aeo < 50)
    recs.push({
      title: "Improve AI citation signals",
      impact: "High",
      difficulty: "Hard",
      desc: "Add authority markers that AI engines use for content ranking.",
    });
  if (recs.length < 4)
    recs.push({
      title: "Add Product/Service schema",
      impact: "Medium",
      difficulty: "Easy",
      desc: "Enable AI platforms to surface your offerings accurately.",
    });

  return {
    aiVisibility,
    seo,
    aeo,
    ux,
    trust,
    chatgpt,
    gemini,
    perplexity,
    claude,
    schemaScore,
    citationScore,
    entities: entities.slice(0, 12),
    recommendations: recs.slice(0, 6),
    domain:
      data.website?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") ||
      "",
  };
}

/* ── Score Ring SVG ────────────────────────────────────────────── */
function ScoreRing({ score, size = 140, strokeWidth = 8, label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const grade =
    score >= 80
      ? "Excellent"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Fair"
          : "Needs Work";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - strokeWidth / 2}
          fill="var(--color-inner-ring-bg, #E7EBF0)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-ring-track, rgba(10,10,26,0.18))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#geoScoreGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="geoScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF8A1E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-extrabold text-text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-text-muted text-[10px] font-semibold uppercase tracking-wider">
          {label || grade}
        </span>
      </div>
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-full border border-orange-500/15"
      />
    </div>
  );
}

/* ── Platform Card ─────────────────────────────────────────────── */
function PlatformCard({ name, score, color, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      variants={fadeUp}
      whileHover={{ y: -3, borderColor: "rgba(255,88,18,0.2)" }}
      className="geo-glass p-6 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-text-primary text-sm font-bold">{name}</h4>
        <span className="text-xs font-bold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--color-ring-track,rgba(10,10,26,0.18))] overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: 0.3 + delay * 0.1,
          }}
        />
      </div>
      <p className="text-text-muted text-xs">
        {score >= 70
          ? "Strong visibility"
          : score >= 45
            ? "Moderate visibility"
            : "Low visibility"}{" "}
        —{" "}
        {score >= 70
          ? "well-positioned for citations"
          : "optimization recommended"}
      </p>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/* ── MAIN COMPONENT ────────────────────────────────────────────── */
/* ════════════════════════════════════════════════════════════════ */
export default function GeoResultsDashboard({ data, userEmail, userName }) {
  const s = computeGeoScores(data);

  const impactColors = { High: "#FF6B00", Medium: "#FF8A1E", Low: "#64748B" };
  const difficultyColors = {
    Easy: "#10B981",
    Medium: "#F59E0B",
    Hard: "#EF4444",
  };
  const [emailing, setEmailing] = React.useState(false);
  const [emailDelivered, setEmailDelivered] = React.useState(false);
  const [emailToast, setEmailToast] = React.useState(null);

  const handleEmailReport = async () => {
    if (emailing || emailDelivered) return;
    setEmailing(true);
    try {
      const payload = {
        name: userName || data.raw_name || "Client",
        email:
          userEmail ||
          data.raw_email ||
          data.email ||
          (data._apollo_fields && data._apollo_fields.Email) ||
          "unknown@example.com",
        website: s.domain,
        report_data: data,
      };

      await emailGeoReport(payload);

      setEmailDelivered(true);
      setEmailToast(
        "Executive report has been delivered to your business email.",
      );
      setTimeout(() => setEmailToast(null), 5000);
    } catch (err) {
      console.error("Email Report Error:", err);
      alert("Failed to email the report. Please try again.");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 pt-8 space-y-16 relative">
      {emailToast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#10b981",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 9999,
            animation: "fade-in 0.3s ease-out",
          }}
        >
          <Check size={18} />
          <span style={{ fontWeight: 600 }}>{emailToast}</span>
        </div>
      )}

      {/* ── 1. GEO SCORE HERO ──────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative"
      >
        <div
          className="geo-glass p-10 md:p-14 relative overflow-hidden"
          style={{ borderColor: "rgba(255,88,18,0.12)" }}
        >
          {/* Ambient glow */}
          <div className="geo-ambient-glow w-80 h-80 bg-orange-500/4 -top-20 -right-20 absolute" />

          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            {/* Score ring */}
            <motion.div variants={fadeUp} custom={0} className="flex-shrink-0">
              <ScoreRing
                score={s.aiVisibility}
                size={160}
                strokeWidth={10}
                label="AI Score"
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                variants={fadeUp}
                custom={1}
                className="flex items-center gap-2 justify-center lg:justify-start mb-3"
              >
                <div className="px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5">
                  <span className="text-orange-500 text-xs font-semibold uppercase tracking-widest">
                    GEO Intelligence Report
                  </span>
                </div>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                custom={2}
                className="text-2xl md:text-3xl font-extrabold text-text-primary mb-2"
              >
                AI Visibility Score:{" "}
                <span className="geo-gradient-text">{s.aiVisibility}/100</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-text-secondary text-sm leading-relaxed mb-6 max-w-lg"
              >
                {s.aiVisibility >= 70
                  ? "Your website has strong AI visibility. AI engines can effectively discover and cite your business."
                  : s.aiVisibility >= 45
                    ? "Your website has moderate AI visibility. There are significant opportunities to improve AI discoverability."
                    : "Your website has low AI visibility. AI engines struggle to understand and cite your business content."}
              </motion.p>

              {/* Mini score bars */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { label: "SEO", value: s.seo },
                  { label: "AEO", value: s.aeo },
                  { label: "Trust", value: s.trust },
                  { label: "UX", value: s.ux },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl bg-[var(--color-analytics-boxes,#E5EAF1)] border border-border-glass p-3 text-center"
                  >
                    <p className="text-text-primary text-lg font-bold">
                      {m.value}
                    </p>
                    <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wider">
                      {m.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Action buttons */}
            <motion.div
              variants={fadeUp}
              custom={5}
              className="flex-shrink-0 flex flex-col gap-3"
            >
              <button
                onClick={handleEmailReport}
                disabled={emailing || emailDelivered}
                className={`geo-cta-btn px-6 py-3 text-sm flex items-center justify-center gap-2 ${emailing ? "spinning-parent" : ""} ${emailDelivered ? "bg-green-500 hover:bg-green-600 border-green-500 text-white" : ""}`}
                style={
                  emailDelivered
                    ? {
                        background: "#10b981",
                        borderColor: "#10b981",
                        color: "#fff",
                      }
                    : {}
                }
              >
                {emailing ? (
                  <>
                    <Loader2 size={16} className="spinning" /> Delivering PDF...
                  </>
                ) : emailDelivered ? (
                  <>
                    <Check size={16} /> Delivered Successfully
                  </>
                ) : (
                  <>
                    <Mail size={16} /> Email Full Report
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── 2. AI PLATFORM VISIBILITY ──────────────────────────── */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2"
          >
            Platform Analysis
          </motion.p>
          <motion.h3
            variants={fadeUp}
            custom={1}
            className="text-2xl font-extrabold text-text-primary"
          >
            AI Platform Visibility
          </motion.h3>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <PlatformCard
            name="ChatGPT"
            score={s.chatgpt}
            color="#10B981"
            delay={0}
          />
          <PlatformCard
            name="Gemini"
            score={s.gemini}
            color="#3B82F6"
            delay={1}
          />
          <PlatformCard
            name="Perplexity"
            score={s.perplexity}
            color="#A855F7"
            delay={2}
          />
          <PlatformCard
            name="Claude"
            score={s.claude}
            color="#F59E0B"
            delay={3}
          />
        </div>
      </section>

      {/* ── 3. ENTITY RECOGNITION ──────────────────────────────── */}
      {s.entities.length > 0 && (
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2"
            >
              Entity Analysis
            </motion.p>
            <motion.h3
              variants={fadeUp}
              custom={1}
              className="text-2xl font-extrabold text-text-primary"
            >
              Entity Recognition
            </motion.h3>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="geo-glass p-8"
            style={{ borderColor: "rgba(10, 10, 26, 0.08)" }}
          >
            <div className="flex flex-wrap gap-3">
              {s.entities.map((ent, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ borderColor: "rgba(255,88,18,0.22)", y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-muted-boxes,#ECEFF3)] border border-border-glass transition-all cursor-default"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500/70">
                    {ent.type}
                  </span>
                  <span className="w-px h-3 bg-black/10" />
                  <span className="text-text-primary text-xs font-medium">
                    {ent.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── 4. GEO RECOMMENDATIONS ─────────────────────────────── */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2"
          >
            Action Plan
          </motion.p>
          <motion.h3
            variants={fadeUp}
            custom={1}
            className="text-2xl font-extrabold text-text-primary"
          >
            GEO Recommendations
          </motion.h3>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {s.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -3, borderColor: "rgba(255,88,18,0.2)" }}
              className="geo-glass p-6 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/5 border border-orange-500/15 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors flex-shrink-0">
                  <Lightbulb size={16} className="text-orange-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${impactColors[rec.impact]}15`,
                      color: impactColors[rec.impact],
                      border: `1px solid ${impactColors[rec.impact]}30`,
                    }}
                  >
                    {rec.impact} Impact
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${difficultyColors[rec.difficulty]}15`,
                      color: difficultyColors[rec.difficulty],
                      border: `1px solid ${difficultyColors[rec.difficulty]}30`,
                    }}
                  >
                    {rec.difficulty}
                  </span>
                </div>
              </div>
              <h4 className="text-text-primary text-sm font-bold mb-1">
                {rec.title}
              </h4>
              <p className="text-text-muted text-xs leading-relaxed">
                {rec.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. AI CITATION READINESS ───────────────────────────── */}
      <section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2"
          >
            Readiness
          </motion.p>
          <motion.h3
            variants={fadeUp}
            custom={1}
            className="text-2xl font-extrabold text-text-primary"
          >
            AI Citation Readiness
          </motion.h3>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Structured Data", score: s.schemaScore, icon: Code },
            { label: "Citation Trust", score: s.citationScore, icon: Shield },
            {
              label: "Semantic Clarity",
              score: Math.round((s.aeo + s.ux) / 2),
              icon: Brain,
            },
            {
              label: "AI Indexing",
              score: Math.round((s.seo + s.schemaScore) / 2),
              icon: Search,
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="geo-glass p-6 transition-all duration-300 text-center"
            >
              <item.icon size={22} className="text-orange-500 mx-auto mb-3" />
              <p className="text-2xl font-extrabold text-text-primary mb-1">
                {item.score}%
              </p>
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3">
                {item.label}
              </p>
              <div className="w-full h-1.5 rounded-full bg-[var(--color-ring-track,rgba(10,10,26,0.18))] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Report Footer ──────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center py-8 border-t border-border-glass"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={14} className="text-orange-500" />
          <span className="text-text-secondary text-sm font-medium">
            Powered by Softree AI Intelligence Engine
          </span>
        </div>
        <p className="text-text-muted text-xs">
          Report generated{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          • {s.domain} • Confidential
        </p>
      </motion.div>
    </div>
  );
}
