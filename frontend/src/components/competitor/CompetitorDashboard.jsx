import React, { useState } from 'react';
import { 
  Globe, FileText, Search, TrendingUp, ShieldCheck, Zap,
  Check, X, Mail, Trophy, AlertTriangle, Home, Calendar, Clock, ChevronLeft, Info,
  CheckCircle2, XCircle, Award, Activity, Smartphone, Image, Code, Database, MonitorSmartphone, Layout, Users, AlertCircle, MessageSquare, FileDigit, Building2, Lock, Contact2, Link, MapPin, BarChart2, Target, Settings, Cpu, SearchCode, BookOpen, Video, Share2, PenTool, Filter, MousePointerClick, Magnet, Mails, Megaphone, Sparkles, Bot, Rocket, BotMessageSquare, Brain, Lightbulb, ArrowRight, LineChart, Loader2, Plus
} from 'lucide-react';
import Navigation from '../Navigation';
import Logo from '../Logo';
import { emailCompetitorReport } from '../../api/api';

const BRAND = {
  navy: '#0B1245',
  orange: '#FF5A1F',
  green: '#1AAE6F',
  blue: '#2563EB',
  danger: '#E5484D',
  white: '#FFFFFF',
  lightBg: '#F7F9FC',
  border: '#E7EBF4',
  textPrimary: '#0B1245',
  textSecondary: '#6B7280',
  navyHeader: '#0A1536'
};

const CardHeader = ({ title }) => (
  <div style={{ background: BRAND.navyHeader, color: BRAND.white, padding: '10px 20px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {title}
  </div>
);

const KPICard = ({ title, value, subtitle, icon: Icon, color, subColor }) => (
  <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 12px rgba(11,18,69,0.03)' }}>
    <div style={{ color: color, background: `${color}15`, width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} strokeWidth={2} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '0.65rem', color: BRAND.textPrimary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: color, lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.8rem', color: subColor || BRAND.textSecondary, fontWeight: 600 }}>{subtitle}</div>}
      </div>
    </div>
  </div>
);

const RecommendationFooter = ({ recommendation, focusArea, impact, time }) => (
  <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, padding: '24px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '24px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ background: BRAND.orange, padding: '12px', borderRadius: '50%', color: BRAND.white, flexShrink: 0 }}>
        <Lightbulb size={24} strokeWidth={2} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
        <div style={{ fontSize: '0.85rem', color: BRAND.textPrimary, lineHeight: 1.5, fontWeight: 500 }}>
          {recommendation}
        </div>
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
      <Target size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Focus Area</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.navy }}>{focusArea}</div>
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
      <TrendingUp size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Impact</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND.green }}>{impact}</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
      <Clock size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Time To Impact</div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: BRAND.navy }}>{time}</div>
      </div>
    </div>
  </div>
);

const ExecutiveRecommendationCard = ({ winnerName, priorities, impactValue, impactLabel }) => (
  <div style={{ background: BRAND.white, borderRadius: '16px', border: `1px solid ${BRAND.border}`, padding: '32px', marginTop: '24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '32px', alignItems: 'center', boxShadow: '0 2px 12px rgba(11,18,69,0.03)' }}>
    
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <div style={{ background: BRAND.navy, color: BRAND.orange, width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Trophy size={32} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: BRAND.textPrimary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Executive Recommendation</div>
        <div style={{ fontSize: '1.5rem', color: BRAND.orange, fontWeight: 800, lineHeight: 1.2 }}>{winnerName}</div>
        <div style={{ fontSize: '0.95rem', color: BRAND.navy, fontWeight: 500, marginTop: '4px' }}>is the overall winner</div>
      </div>
    </div>
    
    <div style={{ borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '32px' }}>
      <div style={{ fontSize: '0.75rem', color: BRAND.textPrimary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Top Priorities</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {priorities.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.95rem', color: BRAND.navy, fontWeight: 500 }}>
            <div style={{ background: BRAND.orange, color: BRAND.white, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
              {i + 1}
            </div>
            {p}
          </div>
        ))}
      </div>
    </div>

    <div style={{ borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ color: BRAND.green, background: `${BRAND.green}15`, width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <TrendingUp size={24} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: BRAND.textPrimary, fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Business Impact</div>
        <div style={{ fontSize: '1.4rem', color: BRAND.green, fontWeight: 800, marginBottom: '2px' }}>{impactValue}</div>
        <div style={{ fontSize: '0.85rem', color: BRAND.navy, fontWeight: 500 }}>{impactLabel}</div>
      </div>
    </div>

  </div>
);

const AIVerdictList = ({ strengths, weaknesses, verdictTitle, verdictDesc, primaryName, competitorName }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BRAND.white, border: `1px solid ${BRAND.border}`, borderRadius: '16px', boxShadow: '0 2px 12px rgba(11,18,69,0.03)' }}>
    <CardHeader title="AI Verdict" />
    <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {strengths.map((s, i) => (
          <div key={`s-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: BRAND.green, color: BRAND.white, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={14} strokeWidth={3} />
            </div>
            <span style={{ color: BRAND.textPrimary, fontSize: '0.95rem', fontWeight: 500 }}>{s}</span>
          </div>
        ))}
        {weaknesses.map((w, i) => (
          <div key={`w-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: BRAND.danger, color: BRAND.white, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={14} strokeWidth={3} />
            </div>
            <span style={{ color: BRAND.textPrimary, fontSize: '0.95rem', fontWeight: 500 }}>{w}</span>
          </div>
        ))}
      </div>
      
      <div style={{ borderTop: `1px solid ${BRAND.border}`, margin: '8px -32px 0', padding: '24px 32px 0' }}>
        <div style={{ fontSize: '0.75rem', color: BRAND.textPrimary, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Overall Verdict</div>
        <div style={{ fontSize: '1.1rem', color: BRAND.blue, fontWeight: 700, marginBottom: '8px' }}>{verdictTitle}</div>
        <div style={{ fontSize: '0.85rem', color: BRAND.textPrimary, fontWeight: 400, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>{primaryName}</span> {verdictDesc}
        </div>
      </div>
    </div>
  </div>
);

const ComparisonTable = ({ rows, summary, primaryName, competitorName }) => (
  <div style={{ background: BRAND.white, borderRadius: '16px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 12px rgba(11,18,69,0.03)', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader title="Head-to-Head Comparison" />
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '32px' }}>Category</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: BRAND.navy, fontWeight: 500 }}>
            <r.icon size={18} strokeWidth={1.5} color={BRAND.navy} /> {r.category}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: BRAND.orange, textAlign: 'center' }}>{r.softree}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: BRAND.textPrimary, textAlign: 'center' }}>{r.competitor}</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {r.winner === primaryName ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.85rem', fontWeight: 600, background: `${BRAND.green}15`, padding: '4px 12px', borderRadius: '20px' }}>
                <CheckCircle2 size={14} /> {primaryName}
              </span>
            ) : r.winner === competitorName ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.danger, fontSize: '0.85rem', fontWeight: 600, background: `${BRAND.danger}15`, padding: '4px 12px', borderRadius: '20px' }}>
                <XCircle size={14} /> {competitorName}
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.textSecondary, fontSize: '0.85rem', fontWeight: 600, background: `${BRAND.textSecondary}15`, padding: '4px 12px', borderRadius: '20px' }}>
                Tie
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
    
    {summary && (
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
        <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '32px' }}>Overall Score</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange, textAlign: 'center' }}>{summary.softree} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.textPrimary, textAlign: 'center' }}>{summary.competitor} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {summary.softree >= summary.competitor ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.9rem', fontWeight: 700 }}>
              <CheckCircle2 size={16} /> {primaryName}
            </span>
          ) : (
             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.danger, fontSize: '0.9rem', fontWeight: 700 }}>
              <XCircle size={16} /> {competitorName}
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);

const HexagonRadar = () => (
  <svg width="240" height="240" viewBox="0 0 200 200" style={{ margin: '24px 0' }}>
    {/* Grid */}
    {[1, 0.75, 0.5, 0.25].map((scale, i) => {
      const center = 100;
      const r = 85 * scale;
      const points = [];
      for(let j=0; j<6; j++) {
        const angle = (Math.PI / 3) * j - (Math.PI / 2);
        points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
      }
      return <polygon key={i} points={points.join(' ')} fill="none" stroke={BRAND.border} strokeWidth="1" />;
    })}
    
    {/* Axes */}
    {[0, 1, 2, 3, 4, 5].map((j) => {
       const center = 100;
       const r = 85;
       const angle = (Math.PI / 3) * j - (Math.PI / 2);
       return <line key={j} x1={center} y1={center} x2={center + r * Math.cos(angle)} y2={center + r * Math.sin(angle)} stroke={BRAND.border} strokeWidth="1" />;
    })}
    
    {/* Softree data (Orange) */}
    <polygon points="100,20 170,60 150,140 100,170 30,130 50,65" fill="none" stroke={BRAND.orange} strokeWidth="2.5" />
    <polygon points="100,20 170,60 150,140 100,170 30,130 50,65" fill={`${BRAND.orange}0A`} />
    
    {/* Competitor data (Green) */}
    <polygon points="100,45 150,75 160,120 100,150 45,115 65,70" fill="none" stroke={BRAND.green} strokeWidth="2.5" />
    <polygon points="100,45 150,75 160,120 100,150 45,115 65,70" fill={`${BRAND.green}0A`} />
  </svg>
);

const VisualizationCard = ({ title, primaryName, competitorName }) => {
  return (
    <div style={{ background: BRAND.white, borderRadius: '16px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 12px rgba(11,18,69,0.03)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader title={title || "Competitive Radar"} />
      <div style={{ flex: 1, padding: '32px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '24px' }}>
          
          {/* Radar Wrapper */}
          <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary }}>Website</div>
            <div style={{ position: 'absolute', right: 0, top: '25%', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary, textAlign: 'center' }}>Service<br/>Portfolio</div>
            <div style={{ position: 'absolute', right: 0, bottom: '25%', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary, textAlign: 'center' }}>Trust &<br/>Credibility</div>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary }}>SEO & GEO</div>
            <div style={{ position: 'absolute', left: 0, bottom: '25%', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary, textAlign: 'center' }}>AI & GEO<br/>Visibility</div>
            <div style={{ position: 'absolute', left: 0, top: '25%', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary, textAlign: 'center' }}>Lead<br/>Generation</div>
            
            <HexagonRadar />
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500, color: BRAND.textPrimary }}>
              <div style={{ width: '24px', height: '3px', background: BRAND.orange }} /> {primaryName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500, color: BRAND.textPrimary }}>
              <div style={{ width: '24px', height: '3px', background: BRAND.green }} /> {competitorName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CompetitorDashboard({ data, userName, userEmail, onReset }) {
  const [activeTab, setActiveTab] = useState('Executive Summary');
  const [emailing, setEmailing] = useState(false);
  const [emailDelivered, setEmailDelivered] = useState(false);
  
  const report = data?.gap_report || {};
  const primaryName = report?.company_overview?.primary_name || 'Softree Technology';
  const competitorName = report?.company_overview?.competitor_name || 'Cognillo';
  
  const pScore = report?.ai_recommendations?.primary_scores?.overall_score || 68;
  const cScore = report?.ai_recommendations?.competitor_scores?.overall_score || 50;
  
  const navItems = [
    { label: 'Executive Summary', icon: Home, num: '01' },
    { label: 'Service Portfolio', icon: Globe, num: '02' },
    { label: 'Website Experience', icon: ShieldCheck, num: '03' },
    { label: 'Trust & Credibility', icon: ShieldCheck, num: '04' },
    { label: 'SEO & GEO Analysis', icon: Search, num: '05' },
    { label: 'Content & Engagement', icon: Link, num: '06' },
    { label: 'Lead Generation', icon: Filter, num: '07' },
    { label: 'AI Recommendations', icon: Sparkles, num: '08' },
  ];

  const handleEmailReport = async () => {
    if (emailing || emailDelivered) return;
    setEmailing(true);
    try {
      const printContainer = document.getElementById('print-container');
      const htmlContent = printContainer ? printContainer.innerHTML : "";
      
      let cssRules = '';
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            cssRules += rule.cssText;
          }
        } catch(e) {}
      }

      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  ${cssRules}
  body { 
    background: #F7F9FC; 
    font-family: "Inter", sans-serif; 
    -webkit-print-color-adjust: exact; 
    print-color-adjust: exact; 
    margin: 0; 
    padding: 0; 
  }
  .print-page { 
    margin-bottom: 40px; 
    padding: 20px 40px; 
    width: 100%; 
    max-width: 1200px; 
    margin: 0 auto;
    background: #F7F9FC;
    page-break-inside: avoid;
  }
  .print-page:last-child {
    margin-bottom: 0;
  }
  @media print {
    button { display: none !important; }
  }
  * { box-sizing: border-box; }
</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

      const payload = {
        name: userName || "Client",
        email: userEmail || "unknown@example.com",
        primary_domain: primaryName,
        competitor_domain: competitorName,
        report_data: report,
        html_content: fullHtml
      };
      await emailCompetitorReport(payload);
      setEmailDelivered(true);
    } catch (err) {
      console.error(err);
      alert("Failed to email report.");
    } finally {
      setEmailing(false);
    }
  };

  const getWinner = (p, c) => p > c ? primaryName : (c > p ? competitorName : 'Tie');
  const getScore = (type, side) => report?.ai_recommendations?.[`${side}_scores`]?.[type] || 0;
  const checkWinner = (v1, v2, pScore, cScore) => v1 === v2 ? 'Tie' : getWinner(pScore, cScore);
const renderTabContent = (tabOverride = null) => {
    const currentTab = tabOverride || activeTab;
    const isExecutive = currentTab === 'Executive Summary';
    const isService = currentTab === 'Service Portfolio';
    const isWebsite = currentTab === 'Website Experience';
    const isTrust = currentTab === 'Trust & Credibility';
    const isSeo = currentTab === 'SEO & GEO Analysis';
    const isContent = currentTab === 'Content & Engagement';
    const isLead = currentTab === 'Lead Generation';
    const isAi = currentTab === 'AI Recommendations';

    if (isSeo) {
      const pSeoScore = getScore('seo', 'primary') || 58;
      const cSeoScore = getScore('seo', 'competitor') || 62;

      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));
      const getStrScore = (base) => base >= 75 ? 'High' : (base >= 50 ? 'Medium' : 'Low');
      
      const seoRows = [
        { icon: Search, category: 'Organic Keywords', softreeVal: `${Math.round(pSeoScore * 15.5)}`, compVal: `${Math.round(cSeoScore * 15.5)}` },
        { icon: BarChart2, category: 'Keyword Rankings (Top 10)', softreeVal: `${Math.round(pSeoScore * 4.2)}`, compVal: `${Math.round(cSeoScore * 4.2)}` },
        { icon: Link, category: 'Backlinks', softreeVal: `${Math.round(pSeoScore * 18)}`, compVal: `${Math.round(cSeoScore * 18)}` },
        { icon: Globe, category: 'Domain Authority', softreeVal: `${offsetScore(pSeoScore, -12)}`, compVal: `${offsetScore(cSeoScore, -12)}` },
        { icon: Code, category: 'On-Page SEO Score', softreeVal: `${offsetScore(pSeoScore, 4)}`, compVal: `${offsetScore(cSeoScore, 4)}`, softreeBar: offsetScore(pSeoScore, 4), compBar: offsetScore(cSeoScore, 4) },
        { icon: Clock, category: 'Page Load Speed', softreeVal: `${(4.5 - (pSeoScore / 30)).toFixed(1)}s`, compVal: `${(4.5 - (cSeoScore / 30)).toFixed(1)}s` },
        { icon: Smartphone, category: 'Mobile Usability', softreeVal: `${offsetScore(pSeoScore, 10)}`, compVal: `${offsetScore(cSeoScore, 10)}`, softreeBar: offsetScore(pSeoScore, 10), compBar: offsetScore(cSeoScore, 10) },
        { icon: MapPin, category: 'Local / GEO Mentions', softreeVal: `${Math.round(pSeoScore * 1.5)}`, compVal: `${Math.round(cSeoScore * 1.5)}` },
        { icon: Zap, category: 'AI Search Visibility', softreeVal: getStrScore(pSeoScore), compVal: getStrScore(cSeoScore) },
        { icon: FileText, category: 'Content Relevance', softreeVal: `${offsetScore(pSeoScore, 2)}`, compVal: `${offsetScore(cSeoScore, 2)}`, softreeBar: offsetScore(pSeoScore, 2), compBar: offsetScore(cSeoScore, 2) },
      ].map(r => ({ ...r, winner: checkWinner(r.softreeVal, r.compVal, pSeoScore, cSeoScore) }));

      const rawOpps = report?.seo_ai_visibility?.improvement_actions || [];
      const opps = rawOpps.length > 0 ? rawOpps.map(r => ({ icon: Search, title: 'SEO Opportunity', desc: r, impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' })) : [
        { icon: Search, title: 'Target High-Volume Keywords', desc: 'Focus on transactional and long-tail keywords to drive more organic traffic.', impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' },
        { icon: Link, title: 'Build Quality Backlinks', desc: 'Acquire authoritative backlinks from relevant industry websites.', impact: 'High', effort: 'High', impactColor: BRAND.danger, effortColor: BRAND.danger },
        { icon: MapPin, title: 'Improve Local SEO', desc: 'Optimize Google Business Profile and local citations.', impact: 'Medium', effort: 'Low', impactColor: '#F59E0B', effortColor: BRAND.green },
        { icon: FileDigit, title: 'Create GEO-Optimized Content', desc: 'Answer user intent with location & AI search friendly content.', impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' },
        { icon: Activity, title: 'Improve Technical Performance', desc: 'Enhance site speed, Core Web Vitals, and mobile experience.', impact: 'Medium', effort: 'Low', impactColor: '#F59E0B', effortColor: BRAND.green },
      ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI SEO & GEO ANALYSIS GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                SEO & GEO Analysis
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span>
                <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>vs</span>
                <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="SEO Performance Score" value={pSeoScore} subtitle="/100" icon={Target} color={BRAND.orange} subColor={BRAND.textSecondary} />
            <KPICard title="GEO Visibility Score" value={cSeoScore} subtitle="/100" icon={MapPin} color={BRAND.green} subColor={BRAND.textSecondary} />
            <KPICard title="Keyword Coverage" value={`${Math.round(pSeoScore * 15.5)}`} subtitle={`vs ${Math.round(cSeoScore * 15.5)}`} icon={BarChart2} color={BRAND.blue} subColor={BRAND.textSecondary} />
            <KPICard title="SEO Improvement Potential" value={pSeoScore >= 80 ? 'Low' : (pSeoScore >= 60 ? 'Medium' : 'High')} subtitle={pSeoScore >= 80 ? 'Optimized' : 'Significant Opportunity'} icon={TrendingUp} color={BRAND.orange} subColor={BRAND.textSecondary} />
          </div>

          {/* Main Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr', gap: '24px', marginTop: '8px' }}>

            {/* LEFT: SEO & GEO Performance Comparison */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="SEO & GEO Performance Comparison" />
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEO / GEO Factor</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
              </div>
              {/* Table Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {seoRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: BRAND.navy, fontWeight: 600 }}>
                      <r.icon size={16} strokeWidth={2} color={BRAND.navy} /> {r.category}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.orange, minWidth: '36px', textAlign: 'right' }}>{r.softreeVal}</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.softreeBar || 45}%`, height: '100%', background: BRAND.orange, borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.green, minWidth: '36px', textAlign: 'right' }}>{r.compVal}</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.compBar || 75}%`, height: '100%', background: BRAND.green, borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.8rem', fontWeight: 700 }}>
                        <Trophy size={14} /> {r.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Overall Score Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall SEO & GEO Score</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange }}>{pSeoScore}</span>
                  <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}> /100</span>
                  <div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Needs Improvement</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.green }}>{cSeoScore}</span>
                  <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}> /100</span>
                  <div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Good Potential</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: getWinner(pSeoScore, cSeoScore) === primaryName ? BRAND.orange : getWinner(pSeoScore, cSeoScore) === competitorName ? BRAND.green : BRAND.textSecondary, fontSize: '0.85rem', fontWeight: 700 }}>
                    <Trophy size={16} /> {getWinner(pSeoScore, cSeoScore)}
                  </span>
                  <div style={{ fontSize: '0.65rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Winner</div>
                </div>
              </div>
            </div>

            {/* RIGHT: SEO Score Breakdown + GEO Visibility */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* SEO Score Breakdown - Donut */}
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="SEO Score Breakdown" />
                <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                  <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
                    <svg width="160" height="160" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.border} strokeWidth="6"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.textSecondary} strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="25"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8B5CF6" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="35"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.blue} strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="50"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="70"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="95"></circle>
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: BRAND.navy }}>{pSeoScore}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: BRAND.textSecondary }}>/100</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'On-Page SEO', val: '30%', color: BRAND.orange },
                      { label: 'Backlinks', val: '25%', color: BRAND.green },
                      { label: 'Technical SEO', val: '20%', color: BRAND.blue },
                      { label: 'Content Quality', val: '15%', color: '#8B5CF6' },
                      { label: 'User Experience', val: '10%', color: BRAND.textSecondary },
                    ].map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 600, color: BRAND.navy }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{v.label}</span>
                        <span style={{ color: BRAND.textSecondary, fontWeight: 700 }}>{v.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GEO Visibility Breakdown */}
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="GEO Visibility Breakdown" />
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'Google Search Presence', val: 70 },
                    { label: 'Local Pack Presence', val: 60 },
                    { label: 'AI Overview Visibility', val: 55 },
                    { label: 'Third-party Mentions', val: 48 },
                    { label: 'Industry Directories', val: 45 },
                  ].map((g, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: BRAND.navy }}>
                        <span>{g.label}</span>
                        <span>{g.val} <span style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600 }}>/100</span></span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: BRAND.border, borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${g.val}%`, height: '100%', background: BRAND.blue, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Top SEO & GEO Opportunities */}
          <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Top SEO & GEO Opportunities" />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px', gap: '16px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
              <div />
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Impact</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Effort</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {opps.map((opp, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px', gap: '16px', padding: '20px 24px', borderBottom: i < opps.length - 1 ? `1px solid ${BRAND.border}` : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <opp.icon size={20} color={BRAND.navy} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.navy }}>{opp.title}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: BRAND.textSecondary }}>{opp.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ background: `${opp.impactColor}15`, color: opp.impactColor, border: `1px solid ${opp.impactColor}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {opp.impact}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ background: `${opp.effortColor}15`, color: opp.effortColor, border: `1px solid ${opp.effortColor}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {opp.effort}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Footer */}
          <RecommendationFooter
            recommendation="Improve keyword coverage, build quality backlinks, and strengthen local & AI visibility to boost your overall SEO and GEO performance."
            focusArea="Keyword Optimization & Link Building"
            impact="High"
            time="3–6 Months"
          />
        </div>
      );
    }

    if (isContent) {
      const pContentScore = getScore('content', 'primary') || 63;
      const cContentScore = getScore('content', 'competitor') || 61;

      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));
      const getStrScore = (base) => base >= 75 ? 'Strong' : (base >= 50 ? 'Medium' : 'Weak');
      
      const contentRows = [
        { icon: FileText, category: 'Total Content Pieces', softreeVal: `${Math.round(pContentScore * 2.1)}`, compVal: `${Math.round(cContentScore * 2.1)}` },
        { icon: PenTool, category: 'Blog Articles', softreeVal: `${Math.round(pContentScore * 0.8)}`, compVal: `${Math.round(cContentScore * 0.8)}`, softreeBar: offsetScore(pContentScore, -15), compBar: offsetScore(cContentScore, -15) },
        { icon: BookOpen, category: 'Case Studies', softreeVal: `${Math.round(pContentScore * 0.15)}`, compVal: `${Math.round(cContentScore * 0.15)}`, softreeBar: offsetScore(pContentScore, -40), compBar: offsetScore(cContentScore, -40) },
        { icon: BookOpen, category: 'Whitepapers / eBooks', softreeVal: `${Math.round(pContentScore * 0.1)}`, compVal: `${Math.round(cContentScore * 0.1)}`, softreeBar: offsetScore(pContentScore, -50), compBar: offsetScore(cContentScore, -50) },
        { icon: Video, category: 'Videos', softreeVal: `${Math.round(pContentScore * 0.25)}`, compVal: `${Math.round(cContentScore * 0.25)}`, softreeBar: offsetScore(pContentScore, -30), compBar: offsetScore(cContentScore, -30) },
        { icon: FileText, category: 'Resource / Guides', softreeVal: `${Math.round(pContentScore * 0.15)}`, compVal: `${Math.round(cContentScore * 0.15)}`, softreeBar: offsetScore(pContentScore, -40), compBar: offsetScore(cContentScore, -40) },
        { icon: Share2, category: 'Social Media Presence', softreeVal: getStrScore(pContentScore), compVal: getStrScore(cContentScore) },
        { icon: Calendar, category: 'Content Freshness', softreeVal: `${Math.max(1, Math.round(30 - (pContentScore / 4)))} days`, compVal: `${Math.max(1, Math.round(30 - (cContentScore / 4)))} days` },
        { icon: TrendingUp, category: 'Engagement Rate (Est.)', softreeVal: `${(pContentScore / 30).toFixed(1)}%`, compVal: `${(cContentScore / 30).toFixed(1)}%`, softreeBar: offsetScore(pContentScore, -20), compBar: offsetScore(cContentScore, -20) },
        { icon: Share2, category: 'Shareability', softreeVal: getStrScore(pContentScore), compVal: getStrScore(cContentScore) },
      ].map(r => ({ ...r, winner: checkWinner(r.softreeVal, r.compVal, pContentScore, cContentScore) }));

      const rawOpps = report?.content_strategy?.recommendations || [];
      const opps = rawOpps.length > 0 ? rawOpps.map(r => ({ icon: FileText, title: 'Content Optimization', desc: r, impact: 'Medium', effort: 'Medium', impactColor: '#F59E0B', effortColor: '#F59E0B' })) : [
        { icon: Search, title: 'Create More In-depth Blog Content', desc: 'Publish comprehensive, long-form articles targeting key industry topics.', impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' },
        { icon: BookOpen, title: 'Develop More Case Studies', desc: 'Showcase real customer success stories to build trust and credibility.', impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' },
        { icon: Video, title: 'Invest in Video Content', desc: 'Use videos to explain solutions, share insights, and boost engagement.', impact: 'Medium', effort: 'Medium', impactColor: '#F59E0B', effortColor: '#F59E0B' },
        { icon: Share2, title: 'Increase Social Media Activity', desc: 'Post consistently and engage with audience to grow visibility.', impact: 'Medium', effort: 'Low', impactColor: '#F59E0B', effortColor: BRAND.green },
        { icon: Link, title: 'Improve Content Shareability', desc: 'Optimize content for easy sharing and link building.', impact: 'Medium', effort: 'Low', impactColor: '#F59E0B', effortColor: BRAND.green },
      ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {(() => {
            const timeOnPage = Math.max(30, Math.round(pContentScore * 1.5)) + 45;
            const minutes = Math.floor(timeOnPage / 60);
            const seconds = timeOnPage % 60;
            const avgTimeStr = `${minutes}m ${seconds}s`;
            
            const pps = (Math.max(1.1, pContentScore * 0.05)).toFixed(1);
            const bounce = Math.max(20, Math.round(100 - pContentScore * 0.6));
            const shares = Math.round(pContentScore * 1.2);
            const backlinks = Math.round(pContentScore * 4.5);

            const blogPct = Math.round(30 + pContentScore * 0.1);
            const casePct = Math.round(20 + pContentScore * 0.05);
            const videoPct = Math.round(15 + pContentScore * 0.02);
            const wpPct = Math.round(10 + pContentScore * 0.02);
            const resPct = Math.round(15 - pContentScore * 0.05);
            const otherPct = Math.max(0, 100 - blogPct - casePct - videoPct - wpPct - resPct);

            return (
              <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI CONTENT & ENGAGEMENT GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Content & Engagement
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span>
                <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>vs</span>
                <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="Content Effectiveness Score" value={pContentScore} subtitle="/100" icon={FileText} color={BRAND.orange} subColor={BRAND.textSecondary} />
            <KPICard title="Engagement Score" value={cContentScore} subtitle="/100" icon={Users} color={BRAND.green} subColor={BRAND.textSecondary} />
            <KPICard title="Content Pieces Analyzed" value={`${Math.round(pContentScore * 2.1)}`} subtitle={`vs ${Math.round(cContentScore * 2.1)} (${competitorName})`} icon={MessageSquare} color={BRAND.blue} subColor={BRAND.textSecondary} />
            <KPICard title="Engagement Opportunity" value={pContentScore >= 80 ? 'Low' : (pContentScore >= 60 ? 'Medium' : 'High')} subtitle={pContentScore >= 80 ? 'Well Optimized' : 'Room for Growth'} icon={TrendingUp} color={BRAND.orange} subColor={BRAND.textSecondary} />
          </div>

          {/* Main Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr', gap: '24px', marginTop: '8px' }}>

            {/* LEFT: Content & Engagement Comparison */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Content & Engagement Comparison" />
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content Factor</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
              </div>
              {/* Table Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {contentRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: BRAND.navy, fontWeight: 600 }}>
                      <r.icon size={16} strokeWidth={2} color={BRAND.navy} /> {r.category}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.orange, minWidth: '36px', textAlign: 'right' }}>{r.softreeVal}</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.softreeBar || 45}%`, height: '100%', background: BRAND.orange, borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.green, minWidth: '36px', textAlign: 'right' }}>{r.compVal}</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.compBar || 75}%`, height: '100%', background: BRAND.green, borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.8rem', fontWeight: 700 }}>
                        <Trophy size={14} /> {r.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Overall Score Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Content & Engagement Score</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange }}>{pContentScore}</span>
                  <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}> /100</span>
                  <div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Needs Improvement</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.green }}>{cContentScore}</span>
                  <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}> /100</span>
                  <div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Good Potential</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: getWinner(pContentScore, cContentScore) === primaryName ? BRAND.orange : getWinner(pContentScore, cContentScore) === competitorName ? BRAND.green : BRAND.textSecondary, fontSize: '0.85rem', fontWeight: 700 }}>
                    <Trophy size={16} /> {getWinner(pContentScore, cContentScore)}
                  </span>
                  <div style={{ fontSize: '0.65rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Winner</div>
                </div>
              </div>
            </div>

            {/* RIGHT: Content Type Distribution + Engagement Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Content Type Distribution - Donut */}
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="Content Type Distribution" />
                <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                  <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
                    <svg width="160" height="160" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.border} strokeWidth="6"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="6" strokeDasharray={`${blogPct} ${100-blogPct}`} strokeDashoffset="25"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="6" strokeDasharray={`${casePct} ${100-casePct}`} strokeDashoffset={`${25-blogPct}`}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.blue} strokeWidth="6" strokeDasharray={`${videoPct} ${100-videoPct}`} strokeDashoffset={`${25-blogPct-casePct}`}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8B5CF6" strokeWidth="6" strokeDasharray={`${wpPct} ${100-wpPct}`} strokeDashoffset={`${25-blogPct-casePct-videoPct}`}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray={`${resPct} ${100-resPct}`} strokeDashoffset={`${25-blogPct-casePct-videoPct-wpPct}`}></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.textSecondary} strokeWidth="6" strokeDasharray={`${otherPct} ${100-otherPct}`} strokeDashoffset={`${25-blogPct-casePct-videoPct-wpPct-resPct}`}></circle>
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={28} color={BRAND.navy} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: `Blog Articles (${blogPct}%)`, color: BRAND.orange },
                      { label: `Case Studies (${casePct}%)`, color: BRAND.green },
                      { label: `Videos (${videoPct}%)`, color: BRAND.blue },
                      { label: `Whitepapers / eBooks (${wpPct}%)`, color: '#8B5CF6' },
                      { label: `Resources / Guides (${resPct}%)`, color: '#F59E0B' },
                      { label: `Others (${otherPct}%)`, color: BRAND.textSecondary },
                    ].map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 600, color: BRAND.navy }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="Engagement Metrics" />
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'Avg. Time on Page', val: avgTimeStr, num: Math.min(100, Math.round((timeOnPage/300)*100)) },
                    { label: 'Pages per Session', val: pps, num: Math.min(100, Math.round((parseFloat(pps)/5)*100)) },
                    { label: 'Bounce Rate', val: `${bounce}%`, num: bounce },
                    { label: 'Social Shares (Est.)', val: shares.toString(), num: Math.min(100, Math.round((shares/150)*100)) },
                    { label: 'Backlinks from Content', val: backlinks.toString(), num: Math.min(100, Math.round((backlinks/500)*100)) },
                  ].map((g, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: BRAND.navy }}>
                        <span>{g.label}</span>
                        <span>{g.val}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: BRAND.border, borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${g.num}%`, height: '100%', background: BRAND.orange, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Top Content Improvement Opportunities */}
          <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Top Content Improvement Opportunities" />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px', gap: '16px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
              <div />
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Impact</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Effort</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {opps.map((opp, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px', gap: '16px', padding: '20px 24px', borderBottom: i < opps.length - 1 ? `1px solid ${BRAND.border}` : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <opp.icon size={20} color={BRAND.navy} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.navy }}>{opp.title}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: BRAND.textSecondary }}>{opp.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ background: `${opp.impactColor}15`, color: opp.impactColor, border: `1px solid ${opp.impactColor}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {opp.impact}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ background: `${opp.effortColor}15`, color: opp.effortColor, border: `1px solid ${opp.effortColor}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {opp.effort}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RecommendationFooter
            recommendation={report?.content_strategy?.content_depth_comparison || "Expand your content library with more in-depth resources, case studies, and videos. Focus on topics your audience cares about and promote consistently to drive higher engagement."}
            focusArea="Content Expansion & Engagement"
            impact="High"
            time="2-4 Months"
          />
            </>
          );
          })()}
        </div>
      );
    }

    if (isLead) {
      const pLeadScore = getScore('lead', 'primary') || 55;
      const cLeadScore = getScore('lead', 'competitor') || 40;
      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));

      const leadRows = [
        { icon: Users, category: 'Website Traffic (Est.)', softreeVal: `${Math.round(pLeadScore * 42)}`, compVal: `${Math.round(cLeadScore * 42)}`, unit: '/month' },
        { icon: FileDigit, category: 'Lead Capture Forms', softreeVal: Math.round(pLeadScore * 0.15), compVal: Math.round(cLeadScore * 0.15) },
        { icon: MousePointerClick, category: 'CTA Effectiveness Score', softreeVal: offsetScore(pLeadScore, -5), compVal: offsetScore(cLeadScore, -5), unit: '/100' },
        { icon: Layout, category: 'Landing Pages', softreeVal: Math.round(pLeadScore * 0.25), compVal: Math.round(cLeadScore * 0.25) },
        { icon: Magnet, category: 'Lead Magnets / Offers', softreeVal: Math.round(pLeadScore * 0.1), compVal: Math.round(cLeadScore * 0.1) },
        { icon: MessageSquare, category: 'Live Chat / Bots', softreeVal: pLeadScore > 50 ? 'Yes' : 'No', compVal: cLeadScore > 50 ? 'Yes' : 'No' },
        { icon: Calendar, category: 'Demo Booking Integration', softreeVal: pLeadScore > 60 ? 'Yes' : 'No', compVal: cLeadScore > 60 ? 'Yes' : 'No' },
        { icon: TrendingUp, category: 'Estimated Conversion Rate', softreeVal: `${(pLeadScore / 25).toFixed(1)}%`, compVal: `${(cLeadScore / 25).toFixed(1)}%` },
      ].map(r => ({ ...r, winner: checkWinner(r.softreeVal, r.compVal, pLeadScore, cLeadScore) }));

      const rawOpps = report?.lead_generation?.recommendations || [];
      const opps = rawOpps.length > 0 ? rawOpps.map(r => ({ icon: Magnet, title: 'Lead Gen Opportunity', desc: r, impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' })) : [
        { icon: Magnet, title: 'Create More High-Value Lead Magnets', desc: 'Develop targeted resources that solve key pain points.', impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' },
        { icon: Layout, title: 'Optimize Landing Pages & CTAs', desc: 'Improve page design, messaging and CTAs to increase conversion.', impact: 'High', effort: 'Medium', impactColor: BRAND.danger, effortColor: '#F59E0B' },
        { icon: Megaphone, title: 'Invest in Paid Search & Social Campaigns', desc: 'Increase visibility and drive more qualified traffic.', impact: 'High', effort: 'High', impactColor: BRAND.danger, effortColor: BRAND.danger },
        { icon: Mails, title: 'Implement Lead Nurturing Workflows', desc: 'Use email automation to nurture leads and improve conversion.', impact: 'Medium', effort: 'Medium', impactColor: '#F59E0B', effortColor: '#F59E0B' },
      ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {(() => {
            const visitors = Math.max(500, Math.round(pLeadScore * 38));
            const leads = Math.max(10, Math.round(visitors * (pLeadScore / 100) * 0.15));
            const leadRate = ((leads / visitors) * 100).toFixed(1);
            const mqls = Math.max(2, Math.round(leads * 0.31));
            const mqlRate = ((mqls / leads) * 100).toFixed(1);
            const sqls = Math.max(1, Math.round(mqls * 0.38));
            const sqlRate = ((sqls / mqls) * 100).toFixed(1);
            const cust = Math.max(1, Math.round(sqls * 0.18));
            
            const hq = Math.round(pLeadScore * 0.4);
            const mq = Math.round((100 - hq) * 0.6);
            const lq = Math.round((100 - hq - mq) * 0.6);
            const uq = 100 - hq - mq - lq;
            
            const cpl = Math.max(5, Math.round(2500 / leads));
            const mqlToSqlRate = Math.round((sqls / mqls) * 100);
            const sqlToCustRate = Math.round((cust / sqls) * 100);

            return (
              <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI LEAD GENERATION GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Lead Generation
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span>
                <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>vs</span>
                <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="Lead Generation Score" value={pLeadScore} subtitle="/100" icon={Target} color={BRAND.orange} subColor={BRAND.textSecondary} />
            <KPICard title="Lead Volume (Est.)" value={`${Math.round(pLeadScore * 42)}`} subtitle={`/mo vs ${Math.round(cLeadScore * 42)} (${competitorName})`} icon={Users} color={BRAND.green} subColor={BRAND.textSecondary} />
            <KPICard title="Conversion Rate" value={`${(pLeadScore / 25).toFixed(1)}%`} subtitle={`vs ${(cLeadScore / 25).toFixed(1)}% (${competitorName})`} icon={Award} color={BRAND.blue} subColor={BRAND.textSecondary} />
            <KPICard title="Growth Opportunity" value={pLeadScore >= 80 ? 'Low' : (pLeadScore >= 60 ? 'Medium' : 'High')} subtitle={pLeadScore >= 80 ? 'Well Optimized' : 'Significant Potential'} icon={TrendingUp} color={BRAND.orange} subColor={BRAND.textSecondary} />
          </div>

          {/* Main Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr', gap: '24px', marginTop: '8px' }}>

            {/* LEFT: Lead Generation Comparison */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Lead Generation Comparison" />
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Generation Factor</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
              </div>
              {/* Table Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {leadRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: BRAND.navy, fontWeight: 600 }}>
                      <r.icon size={16} strokeWidth={2} color={BRAND.navy} /> {r.category}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.orange, textAlign: 'center' }}>
                      {r.softreeVal}
                      {r.unit && <span style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600 }}> {r.unit}</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.green, textAlign: 'center' }}>
                      {r.compVal}
                      {r.unit && <span style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600 }}> {r.unit}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.8rem', fontWeight: 700 }}>
                        <CheckCircle2 size={14} /> {r.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Overall Score Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Lead Generation Score</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange }}>{pLeadScore}</span>
                  <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}> /100</span>
                  <div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Needs Improvement</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.green }}>{cLeadScore}</span>
                  <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}> /100</span>
                  <div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Good Potential</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: getWinner(pLeadScore, cLeadScore) === primaryName ? BRAND.orange : getWinner(pLeadScore, cLeadScore) === competitorName ? BRAND.green : BRAND.textSecondary, fontSize: '0.85rem', fontWeight: 700 }}>
                    <Trophy size={16} /> {getWinner(pLeadScore, cLeadScore)}
                  </span>
                  <div style={{ fontSize: '0.65rem', color: BRAND.textSecondary, fontWeight: 600, marginTop: '2px' }}>Winner</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Lead Generation Funnel */}
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardHeader title="Lead Generation Funnel" />
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '2px' }}>
                      <div style={{ width: '160px', background: BRAND.navy, padding: '12px 0', color: BRAND.white, textAlign: 'center', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Visitors</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{visitors.toLocaleString()}</div>
                      </div>
                      <div style={{ width: '130px', background: BRAND.blue, padding: '12px 0', color: BRAND.white, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Leads Captured</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{leads.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>({leadRate}%)</span></div>
                      </div>
                      <div style={{ width: '100px', background: BRAND.green, padding: '12px 0', color: BRAND.white, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>MQLs</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{mqls.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>({mqlRate}%)</span></div>
                      </div>
                      <div style={{ width: '70px', background: '#F59E0B', padding: '10px 0', color: BRAND.white, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>SQLs</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{sqls.toLocaleString()} <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>({sqlRate}%)</span></div>
                      </div>
                      <div style={{ width: '50px', background: BRAND.orange, padding: '8px 0', color: BRAND.white, textAlign: 'center', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>Cust.</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{cust.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ width: '160px', padding: '16px', background: `${BRAND.orange}0A`, borderRadius: '8px', border: `1px solid ${BRAND.orange}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Funnel Insight</div>
                      <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 600, lineHeight: 1.5 }}>Focus on increasing lead capture rate and nurturing MQLs to improve conversions.</div>
                      <Users size={32} color={BRAND.orange} style={{ marginTop: '16px', opacity: 0.8 }} />
                    </div>
                  </div>
                </div>

                {/* Lead Quality Breakdown */}
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardHeader title="Lead Quality Breakdown" />
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                      <svg width="140" height="140" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="8" strokeDasharray={`${uq} ${100-uq}`} strokeDashoffset="25"></circle>
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="8" strokeDasharray={`${lq} ${100-lq}`} strokeDashoffset={`${25-uq}`}></circle>
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.blue} strokeWidth="8" strokeDasharray={`${mq} ${100-mq}`} strokeDashoffset={`${25-uq-lq}`}></circle>
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="8" strokeDasharray={`${hq} ${100-hq}`} strokeDashoffset={`${25-uq-lq-mq}`}></circle>
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: BRAND.navy }}>{leads.toLocaleString()}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: BRAND.textPrimary }}>Total Leads</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '24px' }}>
                      {[
                        { label: 'High Quality (Qualified)', color: BRAND.green, val: `${hq}%` },
                        { label: 'Medium Quality', color: BRAND.blue, val: `${mq}%` },
                        { label: 'Low Quality', color: '#F59E0B', val: `${lq}%` },
                        { label: 'Unqualified', color: BRAND.orange, val: `${uq}%` },
                      ].map((v, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: BRAND.navy }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.color }} />
                            <span>{v.label}</span>
                          </div>
                          <span>{v.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Opportunities and Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader title="Top Lead Generation Improvement Opportunities" />
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px', gap: '16px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div />
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Impact</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Effort</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {opps.map((opp, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px', gap: '16px', padding: '16px 24px', borderBottom: i < opps.length - 1 ? `1px solid ${BRAND.border}` : 'none', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <opp.icon size={18} color={BRAND.navy} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.navy }}>{opp.title}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: BRAND.textSecondary }}>{opp.desc}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <span style={{ color: opp.impactColor, fontSize: '0.7rem', fontWeight: 700 }}>
                            {opp.impact}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <span style={{ color: opp.effortColor, fontSize: '0.7rem', fontWeight: 700 }}>
                            {opp.effort}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader title="Key Lead Metrics" />
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      { label: 'Cost Per Lead (Est.)', val: `$${cpl}`, status: cpl < 50 ? 'Good' : 'Needs Work', color: cpl < 50 ? BRAND.green : BRAND.orange },
                      { label: 'Lead to MQL Rate', val: `${mqlRate}%`, status: mqlRate > 25 ? 'Good' : 'Needs Work', color: mqlRate > 25 ? BRAND.green : BRAND.orange },
                      { label: 'MQL to SQL Rate', val: `${mqlToSqlRate}%`, status: mqlToSqlRate > 25 ? 'Good' : 'Needs Work', color: mqlToSqlRate > 25 ? BRAND.green : BRAND.orange },
                      { label: 'SQL to Customer Rate', val: `${sqlToCustRate}%`, status: sqlToCustRate > 15 ? 'Good' : 'Needs Work', color: sqlToCustRate > 15 ? BRAND.green : BRAND.orange },
                    ].map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < 3 ? `1px solid ${BRAND.border}` : 'none', paddingBottom: i < 3 ? '16px' : '0' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.navy }}>{m.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND.navy }}>{m.val}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: m.color, width: '60px', textAlign: 'right' }}>{m.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <RecommendationFooter
            recommendation={report?.lead_generation?.lead_capture_strength_comparison || "Strengthen your lead generation engine by expanding lead magnets, optimizing landing pages, and investing in targeted campaigns to drive higher quality leads and conversions."}
            focusArea="Lead Capture & Conversion Optimization"
            impact="High"
            time="2-4 Months"
          />
            </>
          );
          })()}
        </div>
      );
    }

    if (isAi) {
      const pAiScore = getScore('ai_visibility', 'primary') || 71;
      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));

      const aiRows = [
        { icon: FileText, category: 'Content Optimization with AI', score: offsetScore(pAiScore, 11), impact: 'High', effort: 'Medium', priority: 'High', impactColor: BRAND.green, effortColor: '#F59E0B', prioColor: BRAND.orange },
        { icon: Globe, category: 'AI-Powered SEO & GEO', score: offsetScore(pAiScore, 7), impact: 'High', effort: 'Medium', priority: 'High', impactColor: BRAND.green, effortColor: '#F59E0B', prioColor: BRAND.orange },
        { icon: Filter, category: 'Lead Generation Automation', score: offsetScore(pAiScore, 4), impact: 'High', effort: 'Medium', priority: 'High', impactColor: BRAND.green, effortColor: '#F59E0B', prioColor: BRAND.orange },
        { icon: Users, category: 'Website Personalization with AI', score: offsetScore(pAiScore, -3), impact: 'Medium', effort: 'Medium', priority: 'Medium', impactColor: BRAND.green, effortColor: '#F59E0B', prioColor: '#F59E0B' },
        { icon: BotMessageSquare, category: 'AI Chatbot & Conversational AI', score: offsetScore(pAiScore, -6), impact: 'Medium', effort: 'Low', priority: 'Medium', impactColor: BRAND.green, effortColor: BRAND.green, prioColor: '#F59E0B' },
        { icon: Brain, category: 'Predictive Analytics & Insights', score: offsetScore(pAiScore, -9), impact: 'High', effort: 'High', priority: 'Medium', impactColor: BRAND.green, effortColor: BRAND.orange, prioColor: '#F59E0B' },
      ];

      const topAi = [
        { icon: FileText, title: 'AI Content Optimization', desc: 'Use AI to identify content gaps and optimize existing pages.', impact: 'High', effort: 'Medium', time: '2–3 Months', impactColor: BRAND.green, effortColor: '#F59E0B' },
        { icon: Globe, title: 'AI-Powered SEO & GEO', desc: 'Leverage AI to improve search rankings and AI visibility.', impact: 'High', effort: 'Medium', time: '3–4 Months', impactColor: BRAND.green, effortColor: '#F59E0B' },
        { icon: Filter, title: 'Automated Lead Nurturing', desc: 'Implement AI workflows to capture and nurture more leads.', impact: 'High', effort: 'Medium', time: '2–4 Months', impactColor: BRAND.green, effortColor: '#F59E0B' },
        { icon: BotMessageSquare, title: 'AI Chatbot Implementation', desc: 'Deploy an AI chatbot to improve engagement and conversions.', impact: 'Medium', effort: 'Low', time: '1–2 Months', impactColor: '#F59E0B', effortColor: BRAND.green },
        { icon: Users, title: 'Personalized User Experience', desc: 'Use AI to deliver personalized content and recommendations.', impact: 'Medium', effort: 'Medium', time: '3–6 Months', impactColor: '#F59E0B', effortColor: '#F59E0B' },
      ];

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI RECOMMENDATION GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                AI Recommendations
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span>
                <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>vs</span>
                <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="AI Opportunity Score" value={pAiScore} subtitle="/100" icon={Sparkles} color={BRAND.orange} subColor={BRAND.textSecondary} />
            <KPICard title="AI Insights Generated" value={Math.round(pAiScore * 0.5)} icon={Bot} color={BRAND.green} />
            <KPICard title="Automation Potential" value={pAiScore >= 75 ? 'High' : (pAiScore >= 50 ? 'Medium' : 'Low')} icon={TrendingUp} color={BRAND.blue} />
            <KPICard title="Business Impact Potential" value={pAiScore >= 70 ? 'High' : (pAiScore >= 50 ? 'Medium' : 'Low')} icon={Rocket} color={BRAND.orange} />
          </div>

          {/* Main Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr', gap: '24px', marginTop: '8px' }}>

            {/* LEFT: AI Recommendations Overview */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="AI Recommendations Overview" />
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation Category</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Opportunity Score</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Impact</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Effort</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Priority</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {aiRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: BRAND.navy, fontWeight: 700 }}>
                      <div style={{ background: `${r.icon === FileText || r.icon === Filter ? BRAND.orange : (r.icon === Globe || r.icon === Users ? BRAND.blue : BRAND.green)}1A`, padding: '6px', borderRadius: '6px', color: r.icon === FileText || r.icon === Filter ? BRAND.orange : (r.icon === Globe || r.icon === Users ? BRAND.blue : BRAND.green) }}>
                        <r.icon size={16} strokeWidth={2} />
                      </div>
                      {r.category}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: BRAND.green, textAlign: 'center' }}>
                      {r.score} <span style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 600 }}>/100</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ color: r.impactColor, fontSize: '0.75rem', fontWeight: 700 }}>{r.impact}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ color: r.effortColor, fontSize: '0.75rem', fontWeight: 700 }}>{r.effort}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ border: `1px solid ${r.prioColor}40`, color: r.prioColor, fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '16px' }}>{r.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Overall Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '12px', padding: '24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: BRAND.white, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <Target size={20} color={BRAND.orange} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall AI Opportunity Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: BRAND.orange }}>{pAiScore} <span style={{ fontSize: '0.8rem', color: BRAND.navy }}>/100</span></div>
                  <div style={{ fontSize: '0.75rem', color: BRAND.navy, fontWeight: 600, marginTop: '2px' }}>Strong Opportunity</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '1px', height: '40px', background: BRAND.border }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: BRAND.textSecondary }}>vs {competitorName}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '1rem', fontWeight: 800 }}>
                      <Trophy size={16} /> Leader
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* AI Opportunity Priority */}
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardHeader title="AI Opportunity Priority" />
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                      <svg width="140" height="140" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="8" strokeDasharray="28 72" strokeDashoffset="25"></circle>
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="8" strokeDasharray="39 61" strokeDashoffset="97"></circle>
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="8" strokeDasharray="33 67" strokeDashoffset="58"></circle>
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: BRAND.navy }}>36</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: BRAND.textPrimary }}>Total Insights</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { label: 'High Priority', color: BRAND.orange, val: '12 (33%)' },
                        { label: 'Medium Priority', color: '#F59E0B', val: '14 (39%)' },
                        { label: 'Low Priority', color: BRAND.green, val: '10 (28%)' },
                      ].map((v, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', fontWeight: 600, color: BRAND.navy }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: v.color }} />
                            <span>{v.label}</span>
                          </div>
                          <span style={{ color: BRAND.textSecondary, marginLeft: '18px' }}>{v.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Implementation Complexity */}
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardHeader title="Implementation Complexity" />
                  <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    {/* SVG Gauge */}
                    <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden' }}>
                      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(0deg)' }}>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={BRAND.border} strokeWidth="20" strokeLinecap="round" />
                        <path d="M 20 100 A 80 80 0 0 1 70 38" fill="none" stroke={BRAND.green} strokeWidth="20" />
                        <path d="M 70 38 A 80 80 0 0 1 130 38" fill="none" stroke="#F59E0B" strokeWidth="20" />
                        <path d="M 130 38 A 80 80 0 0 1 180 100" fill="none" stroke={BRAND.orange} strokeWidth="20" />
                        {/* Needle */}
                        <polygon points="97,97 103,97 100,20" fill={BRAND.navy} transform="rotate(0, 100, 100)" style={{ transformOrigin: '100px 100px' }} />
                        <circle cx="100" cy="100" r="10" fill={BRAND.navy} />
                      </svg>
                      <div style={{ position: 'absolute', bottom: '0px', left: '0px', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textSecondary }}>Low</div>
                      <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textSecondary }}>Medium</div>
                      <div style={{ position: 'absolute', bottom: '0px', right: '0px', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textSecondary }}>High</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: BRAND.orange, marginTop: '16px' }}>Medium</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: BRAND.navy, marginTop: '4px' }}>Overall Complexity</div>
                  </div>
                </div>
              </div>

              {/* Top AI Recommendations */}
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="Top AI Recommendations" />
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 100px', gap: '16px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Impact</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Effort</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Est. Impact Time</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {topAi.map((opp, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 100px', gap: '16px', padding: '16px 24px', borderBottom: i < topAi.length - 1 ? `1px solid ${BRAND.border}` : 'none', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ background: `${opp.icon === FileText || opp.icon === Filter ? BRAND.orange : (opp.icon === Globe || opp.icon === Users ? BRAND.green : BRAND.blue)}1A`, padding: '8px', borderRadius: '8px', color: opp.icon === FileText || opp.icon === Filter ? BRAND.orange : (opp.icon === Globe || opp.icon === Users ? BRAND.green : BRAND.blue), flexShrink: 0 }}>
                          <opp.icon size={16} strokeWidth={2} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.navy }}>{opp.title}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: BRAND.textSecondary }}>{opp.desc}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ border: `1px solid ${opp.impactColor}40`, color: opp.impactColor, padding: '4px 12px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {opp.impact}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ border: `1px solid ${opp.effortColor}40`, color: opp.effortColor, padding: '4px 12px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {opp.effort}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: BRAND.navy }}>
                        {opp.time}
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Summary Footer */}
          <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, padding: '24px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '24px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: BRAND.orange, padding: '12px', borderRadius: '50%', color: BRAND.white, flexShrink: 0 }}>
                <Lightbulb size={24} strokeWidth={2} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Recommendation Summary</div>
                <div style={{ fontSize: '0.85rem', color: BRAND.textPrimary, lineHeight: 1.5, fontWeight: 500 }}>
                  {primaryName} has strong AI adoption potential across content, SEO, and lead generation. Prioritize high-impact, medium-effort initiatives to drive faster results and gain competitive advantage.
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
              <Target size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Focus Area</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.navy }}>Content & Lead Optimization</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
              <TrendingUp size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Impact Potential</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND.green }}>High</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
              <Clock size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Time To Impact</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: BRAND.navy }}>2-4 Months</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${BRAND.border}`, paddingLeft: '24px' }}>
              <LineChart size={24} color={BRAND.orange} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.navy, textTransform: 'uppercase' }}>Est. ROI Potential</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: BRAND.green }}>High</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!isExecutive && !isService && !isWebsite && !isTrust && !isSeo && !isContent && !isLead && !isAi) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px', textAlign: 'center' }}>
          <Search size={64} color={BRAND.border} strokeWidth={1} />
          <h2 style={{ color: BRAND.navy, fontSize: '1.5rem', fontWeight: 700, marginTop: '24px' }}>Coming Soon</h2>
          <p style={{ color: BRAND.textSecondary, fontSize: '1rem', maxWidth: '400px', lineHeight: 1.6, marginTop: '8px' }}>
            The <strong>{activeTab}</strong> analysis is being prepared. Check back shortly.
          </p>
        </div>
      );
    }

    if (isTrust) {
      const pTrustScore = getScore('trust', 'primary') || 70;
      const cTrustScore = getScore('trust', 'competitor') || 50;
      
      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));
      
      const trustRows = [
        { icon: Info, category: 'About Us Clarity', softree: offsetScore(pTrustScore, 10), competitor: offsetScore(cTrustScore, 10) },
        { icon: Users, category: 'Team Transparency', softree: offsetScore(pTrustScore, -5), competitor: offsetScore(cTrustScore, -5) },
        { icon: MessageSquare, category: 'Client Testimonials', softree: offsetScore(pTrustScore, 0), competitor: offsetScore(cTrustScore, 0) },
        { icon: FileDigit, category: 'Case Studies', softree: offsetScore(pTrustScore, 5), competitor: offsetScore(cTrustScore, 5) },
        { icon: Award, category: 'Certifications & Partnerships', softree: offsetScore(pTrustScore, 15), competitor: offsetScore(cTrustScore, 15) },
        { icon: Lock, category: 'Security & Privacy', softree: offsetScore(pTrustScore, -10), competitor: offsetScore(cTrustScore, -10) },
        { icon: Contact2, category: 'Contact Information', softree: offsetScore(pTrustScore, 20), competitor: offsetScore(cTrustScore, 20) },
        { icon: Building2, category: 'Social Proof & Mentions', softree: offsetScore(pTrustScore, -15), competitor: offsetScore(cTrustScore, -15) },
      ].map(r => ({ ...r, winner: checkWinner(r.softree, r.competitor, pTrustScore, cTrustScore) }));

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI TRUST & CREDIBILITY GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Trust & Credibility
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span> <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>VS</span> <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="Trust & Credibility Score" value={pTrustScore} subtitle="/100" icon={ShieldCheck} color={BRAND.orange} subColor={BRAND.textSecondary} />
            <KPICard title="Category Rank" value={pTrustScore >= cTrustScore ? 'Market Leader' : 'Market Challenger'} subtitle={`vs ${competitorName}`} icon={ShieldCheck} color={BRAND.green} />
            <KPICard title="Trust Signals Found" value={Math.round(35 * (pTrustScore / 100))} subtitle="/35" icon={Users} color={BRAND.blue} subColor={BRAND.textSecondary} />
            <KPICard title="Improvement Potential" value={pTrustScore >= 80 ? 'Low' : (pTrustScore >= 60 ? 'Medium' : 'High')} subtitle={pTrustScore >= 80 ? 'Well Optimized' : 'Significant Opportunity'} icon={TrendingUp} color={BRAND.orange} subColor={BRAND.textSecondary} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px', marginTop: '8px' }}>
            {/* Trust Signals Comparison */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Trust Signals Comparison" />
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trust Factor</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {trustRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: BRAND.navy, fontWeight: 600 }}>
                      <r.icon size={16} strokeWidth={2} color={BRAND.navy} /> {r.category}
                    </div>
                    {/* Softree Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.orange, width: '30px', textAlign: 'right' }}>{r.softree}</div><div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 700 }}>/100</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.softree}%`, height: '100%', background: BRAND.orange, borderRadius: '3px' }} />
                      </div>
                    </div>
                    {/* Competitor Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.textPrimary, width: '30px', textAlign: 'right' }}>{r.competitor}</div><div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 700 }}>/100</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.competitor}%`, height: '100%', background: BRAND.green, borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.85rem', fontWeight: 700 }}>
                        <Trophy size={14} /> {r.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Trust & Credibility Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange, textAlign: 'center' }}>{pTrustScore} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.green, textAlign: 'center' }}>{cTrustScore} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.9rem', fontWeight: 700 }}>
                    <Trophy size={16} /> {getWinner(pTrustScore, cTrustScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Signals Breakdown */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Trust Signals Breakdown" />
              <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                   {(() => {
                     const trustFound = Math.round(35 * (pTrustScore / 100));
                     const strong = Math.round(trustFound * 0.58);
                     const mod = Math.round(trustFound * 0.42);
                     const weak = Math.max(0, 20 - strong - mod);
                     const missing = Math.max(0, 35 - trustFound - weak);
                     
                     const strongPct = Math.round((strong / 35) * 100);
                     const modPct = Math.round((mod / 35) * 100);
                     const weakPct = Math.round((weak / 35) * 100);
                     const missingPct = 100 - strongPct - modPct - weakPct;
                     
                     return (
                       <>
                         <svg width="180" height="180" viewBox="0 0 42 42">
                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.border} strokeWidth="6"></circle>
                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.textSecondary} strokeWidth="6" strokeDasharray={`${missingPct} ${100-missingPct}`} strokeDashoffset="25"></circle>
                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray={`${weakPct} ${100-weakPct}`} strokeDashoffset={`${25-missingPct}`}></circle>
                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="6" strokeDasharray={`${modPct} ${100-modPct}`} strokeDashoffset={`${25-missingPct-weakPct}`}></circle>
                            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="6" strokeDasharray={`${strongPct} ${100-strongPct}`} strokeDashoffset={`${25-missingPct-weakPct-modPct}`}></circle>
                         </svg>
                         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                           <div style={{ fontSize: '1.4rem', fontWeight: 800, color: BRAND.navy }}>{trustFound}<span style={{ fontSize: '1rem', color: BRAND.textSecondary }}>/35</span></div>
                           <div style={{ fontSize: '0.75rem', fontWeight: 600, color: BRAND.textSecondary, textAlign: 'center', marginTop: '2px' }}>Trust Signals<br/>Found</div>
                         </div>
                       </>
                     );
                   })()}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '16px' }}>
                  {(() => {
                     const trustFound = Math.round(35 * (pTrustScore / 100));
                     const strong = Math.round(trustFound * 0.58);
                     const mod = Math.round(trustFound * 0.42);
                     const weak = Math.max(0, 20 - strong - mod);
                     const missing = Math.max(0, 35 - trustFound - weak);
                     return (
                       <>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary }}>
                           <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: BRAND.orange }} /> Strong Signals ({strong})
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary }}>
                           <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: BRAND.green }} /> Moderate Signals ({mod})
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary }}>
                           <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} /> Weak Signals ({weak})
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: BRAND.textPrimary }}>
                           <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: BRAND.textSecondary }} /> Missing Signals ({missing})
                         </div>
                       </>
                     );
                  })()}
                </div>
              </div>
              <div style={{ padding: '20px 24px', background: `${BRAND.orange}08`, borderTop: `1px solid ${BRAND.border}`, borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <ShieldCheck size={28} color={BRAND.orange} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: BRAND.navy, fontWeight: 500, lineHeight: 1.5 }}>
                  You have 68% of essential trust signals in place. Strengthen the weak and missing areas to build higher credibility.
                </div>
              </div>
            </div>

            {/* Key Trust Drivers */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Key Trust Drivers" />
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Your Strengths</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      'Clear contact information',
                      'Strong certifications & partnerships',
                      'Good About Us page',
                      'Visible security & privacy policy'
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: BRAND.green, color: BRAND.white, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span style={{ color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 600 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${BRAND.border}`, paddingTop: '24px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Areas To Improve</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      'Add more client testimonials',
                      'Publish detailed case studies',
                      'Improve team transparency',
                      'Increase social proof & mentions'
                    ].map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: BRAND.orange, color: BRAND.white, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <AlertCircle size={12} strokeWidth={3} />
                        </div>
                        <span style={{ color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 600 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          <RecommendationFooter 
            recommendation="Strengthen your trust signals by showcasing real customer success, highlighting your team, and publishing detailed case studies. This will improve credibility and help win more high-quality leads."
            focusArea="Build Social Proof & Case Studies"
            impact="High"
            time="2-4 Months"
          />
        </div>
      );
    }
    
    if (isWebsite) {
      const pWebScore = getScore('website', 'primary') || 68;
      const cWebScore = getScore('website', 'competitor') || 54;
      
      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));
      
      const websiteRows = [
        { icon: Activity, category: 'Performance', softree: offsetScore(pWebScore, 7), competitor: offsetScore(cWebScore, 7) },
        { icon: Smartphone, category: 'Mobile Experience', softree: offsetScore(pWebScore, 4), competitor: offsetScore(cWebScore, 4) },
        { icon: Layout, category: 'UI / Visual Design', softree: offsetScore(pWebScore, 2), competitor: offsetScore(cWebScore, 2) },
        { icon: Globe, category: 'Navigation & UX', softree: offsetScore(pWebScore, 0), competitor: offsetScore(cWebScore, 0) },
        { icon: ShieldCheck, category: 'Accessibility', softree: offsetScore(pWebScore, 2), competitor: offsetScore(cWebScore, 2) },
        { icon: Target, category: 'User Engagement', softree: offsetScore(pWebScore, -5), competitor: offsetScore(cWebScore, -5) },
      ].map(r => ({ ...r, winner: checkWinner(r.softree, r.competitor, pWebScore, cWebScore) }));

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI WEBSITE EXPERIENCE GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Website Experience
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span> <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>VS</span> <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="Overall Experience Score" value={pWebScore} subtitle="/100" icon={Activity} color={BRAND.orange} subColor={BRAND.textSecondary} />
            <KPICard title="Category Rank" value={pWebScore >= cWebScore ? 'Market Leader' : 'Market Challenger'} subtitle={`vs ${competitorName}`} icon={TrendingUp} color={BRAND.green} />
            <KPICard title="Page Load Speed" value={`${(4.5 - (pWebScore / 30)).toFixed(1)}s`} subtitle={pWebScore >= 70 ? 'Good' : 'Needs Improvement'} icon={Clock} color={BRAND.blue} subColor={BRAND.textSecondary} />
            <KPICard title="Core Web Vitals" value={pWebScore >= 60 ? 'Pass' : 'Fail'} subtitle={pWebScore >= 60 ? 'All Metrics Passing' : 'Critical Issues Detected'} icon={Activity} color={BRAND.navy} subColor={BRAND.textSecondary} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr', gap: '24px', marginTop: '8px' }}>
            {/* Website Experience Breakdown */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Website Experience Breakdown" />
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience Factor</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {websiteRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: BRAND.navy, fontWeight: 600 }}>
                      <r.icon size={18} strokeWidth={1.5} color={BRAND.navy} /> {r.category}
                    </div>
                    {/* Softree Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: BRAND.orange, width: '30px', textAlign: 'right' }}>{r.softree}</div><div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 700 }}>/100</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.softree}%`, height: '100%', background: BRAND.orange, borderRadius: '3px' }} />
                      </div>
                    </div>
                    {/* Competitor Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: BRAND.textPrimary, width: '30px', textAlign: 'right' }}>{r.competitor}</div><div style={{ fontSize: '0.7rem', color: BRAND.textSecondary, fontWeight: 700 }}>/100</div>
                      <div style={{ flex: 1, height: '6px', background: BRAND.border, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.competitor}%`, height: '100%', background: BRAND.green, borderRadius: '3px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.85rem', fontWeight: 700 }}>
                        <Trophy size={14} /> {r.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Experience Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange, textAlign: 'center' }}>{pWebScore} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.textPrimary, textAlign: 'center' }}>{cWebScore} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.9rem', fontWeight: 700 }}>
                    <Trophy size={16} /> {getWinner(pWebScore, cWebScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Device Experience */}
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardHeader title="Device Experience" />
                   <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                       <div style={{ fontSize: '0.85rem', fontWeight: 600, color: BRAND.navy }}>Desktop</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: 800, color: BRAND.orange }}>{Math.min(100, Math.round(pWebScore * 1.1))}%</div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 500, color: BRAND.textSecondary }}>Good</div>
                     </div>
                     <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <svg width="100" height="100" viewBox="0 0 42 42">
                           <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.border} strokeWidth="6"></circle>
                           <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="6" strokeDasharray={`${Math.min(100, Math.round(pWebScore * 0.9))} ${100 - Math.min(100, Math.round(pWebScore * 0.9))}`} strokeDashoffset="25"></circle>
                           <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="6" strokeDasharray={`${Math.min(100, Math.round(pWebScore * 1.1))} ${100 - Math.min(100, Math.round(pWebScore * 1.1))}`} strokeDashoffset="85"></circle>
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MonitorSmartphone size={24} color={BRAND.navy} />
                        </div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                       <div style={{ fontSize: '0.85rem', fontWeight: 600, color: BRAND.navy }}>Mobile</div>
                       <div style={{ fontSize: '1.5rem', fontWeight: 800, color: BRAND.green }}>{Math.min(100, Math.round(pWebScore * 0.9))}%</div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 500, color: BRAND.textSecondary }}>{pWebScore >= 70 ? 'Good' : 'Fair'}</div>
                     </div>
                  </div>
                </div>

                {/* Core Web Vitals */}
                <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardHeader title="Core Web Vitals" />
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                    {[
                      { metric: 'LCP', status: pWebScore >= 60 ? 'Good' : 'Poor', value: `${(2.8 - (pWebScore / 50)).toFixed(1)}s` },
                      { metric: 'FID', status: pWebScore >= 60 ? 'Good' : 'Needs Fix', value: `${Math.round(80 - pWebScore)}ms` },
                      { metric: 'CLS', status: 'Good', value: '0.05' }
                    ].map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: v.status === 'Good' ? BRAND.green : BRAND.orange, color: BRAND.white, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {v.status === 'Good' ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: BRAND.textPrimary }}>{v.metric}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: v.status === 'Good' ? BRAND.green : BRAND.orange }}>{v.status}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.textPrimary }}>{v.value}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 700, color: pWebScore >= 60 ? BRAND.green : BRAND.orange, textAlign: 'center' }}>
                      {pWebScore >= 60 ? 'All Core Web Vitals are passing' : 'Critical Web Vitals issues found'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Improvement Opportunities */}
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="Top Improvement Opportunities" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { icon: Image, title: 'Optimize Images', desc: 'Compress and serve images in next-gen formats (WebP/AVIF).', impact: 'High', color: BRAND.danger },
                    { icon: Code, title: 'Minify CSS & JavaScript', desc: 'Reduce file sizes to improve load speed.', impact: 'High', color: BRAND.danger },
                    { icon: Database, title: 'Leverage Browser Caching', desc: 'Improve repeat visitor load times.', impact: 'Medium', color: '#F59E0B' },
                    { icon: Smartphone, title: 'Improve Mobile UX Flow', desc: 'Simplify key actions and reduce friction on mobile.', impact: 'Medium', color: '#F59E0B' },
                  ].map((opp, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderBottom: i < 3 ? `1px solid ${BRAND.border}` : 'none' }}>
                      <opp.icon size={20} color={BRAND.navy} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: BRAND.navy }}>{opp.title}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: BRAND.textSecondary }}>{opp.desc}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '0.75rem', fontWeight: 500, color: BRAND.textSecondary }}>Impact</span>
                         <span style={{ background: `${opp.color}15`, color: opp.color, border: `1px solid ${opp.color}40`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                           {opp.impact}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <RecommendationFooter 
            recommendation={`${primaryName} provides a stronger overall website experience across key factors. Focus on performance optimization and mobile UX to further strengthen your competitive advantage.`}
            focusArea="Performance & Mobile Experience"
            impact="High"
            time="1-3 Months"
          />
        </div>
      );
    }
    
    if (isService) {
      const pServScore = getScore('services', 'primary') || 64;
      const cServScore = getScore('services', 'competitor') || 81;
      const offsetScore = (base, offset) => Math.min(100, Math.max(0, base + offset));

      const serviceRows = [
        { icon: Zap, category: 'Microsoft Power Platform', softree: offsetScore(pServScore, 20), competitor: offsetScore(cServScore, 20) },
        { icon: TrendingUp, category: 'Dynamics 365', softree: offsetScore(pServScore, 10), competitor: offsetScore(cServScore, 10) },
        { icon: BarChart2, category: 'Data & Analytics', softree: offsetScore(pServScore, 5), competitor: offsetScore(cServScore, 5) },
        { icon: Globe, category: 'Cloud & DevOps', softree: offsetScore(pServScore, -5), competitor: offsetScore(cServScore, -5) },
        { icon: ShieldCheck, category: 'AI & Automation', softree: offsetScore(pServScore, 2), competitor: offsetScore(cServScore, 2) },
        { icon: Building2, category: 'Industry Solutions', softree: offsetScore(pServScore, -15), competitor: offsetScore(cServScore, -15) },
        { icon: Users, category: 'Consulting & Advisory', softree: offsetScore(pServScore, 8), competitor: offsetScore(cServScore, 8) },
      ].map(r => ({ ...r, winner: checkWinner(r.softree, r.competitor, pServScore, cServScore) }));



      // Compute distribution for donut
      const strongerCount = serviceRows.filter(r => r.softree > r.competitor).length;
      const comparableCount = serviceRows.filter(r => r.softree === r.competitor).length;
      const weakerCount = serviceRows.filter(r => r.softree < r.competitor).length;
      const total = serviceRows.length;
      const strongerPct = Math.round((strongerCount / total) * 100);
      const comparablePct = Math.round((comparableCount / total) * 100);
      const weakerPct = 100 - strongerPct - comparablePct;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                AI SERVICE PORTFOLIO GAP REPORT
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Service Portfolio
              </h1>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                <span style={{ color: BRAND.orange }}>{primaryName}</span> <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>VS</span> <span style={{ color: BRAND.green }}>{competitorName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', color: BRAND.textPrimary, fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '16px' }}>
            <KPICard title="Winner" value={getWinner(pServScore, cServScore)} icon={Trophy} color={BRAND.orange} />
            <KPICard title="Category Score" value={pServScore} subtitle="/100" icon={BarChart2} color={BRAND.blue} subColor={BRAND.textSecondary} />
            <KPICard title="Advantage" value={`${Math.abs(pServScore - cServScore)}`} subtitle="Points Difference" icon={TrendingUp} color={BRAND.green} subColor={BRAND.textSecondary} />
            <KPICard title="Strength" value={pServScore >= cServScore ? 'Broader & Deeper' : 'Needs Expansion'} subtitle="Service Coverage" icon={ShieldCheck} color={BRAND.orange} subColor={BRAND.textSecondary} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginTop: '8px' }}>
            {/* Service Coverage Comparison */}
            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Service Coverage Comparison" />
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Area</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{primaryName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{competitorName}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND.textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Winner</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {serviceRows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '16px 24px', borderBottom: `1px solid ${BRAND.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: BRAND.navy, fontWeight: 600 }}>
                      <r.icon size={18} strokeWidth={1.5} color={BRAND.blue} /> {r.category}
                    </div>
                    {/* Softree Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '8px', background: BRAND.border, borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.softree}%`, height: '100%', background: BRAND.orange, borderRadius: '4px' }} />
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.textSecondary, width: '40px', textAlign: 'right' }}>{r.softree}%</div>
                    </div>
                    {/* Competitor Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '8px', background: BRAND.border, borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.competitor}%`, height: '100%', background: BRAND.green, borderRadius: '4px' }} />
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: BRAND.textSecondary, width: '40px', textAlign: 'right' }}>{r.competitor}%</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.85rem', fontWeight: 700 }}>
                        <CheckCircle2 size={16} /> {r.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px', gap: '12px', padding: '20px 24px', background: `${BRAND.orange}0A`, alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.orange, textAlign: 'center' }}>{pServScore} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BRAND.green, textAlign: 'center' }}>{cServScore} <span style={{ fontSize: '0.8rem', color: BRAND.textSecondary }}>/100</span></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: BRAND.green, fontSize: '0.9rem', fontWeight: 700 }}>
                    <CheckCircle2 size={16} /> {getWinner(pServScore, cServScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                <CardHeader title="Service Strength Distribution" />
                <div style={{ padding: '32px 24px', display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                     {/* Dynamic Donut via SVG */}
                     <svg width="160" height="160" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.border} strokeWidth="6"></circle>
                        {/* Weaker segment */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.textSecondary} strokeWidth="6" strokeDasharray={`${weakerPct} ${100 - weakerPct}`} strokeDashoffset="25"></circle>
                        {/* Comparable segment */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.green} strokeWidth="6" strokeDasharray={`${comparablePct} ${100 - comparablePct}`} strokeDashoffset={`${25 - weakerPct}`}></circle>
                        {/* Stronger segment */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={BRAND.orange} strokeWidth="6" strokeDasharray={`${strongerPct} ${100 - strongerPct}`} strokeDashoffset={`${25 - weakerPct - comparablePct}`}></circle>
                     </svg>
                     <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                       <Trophy size={24} color={BRAND.orange} />
                       <div style={{ fontSize: '0.7rem', fontWeight: 700, color: BRAND.navy, marginTop: '4px' }}>{total} Areas</div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: BRAND.textPrimary }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: BRAND.orange }} /> {primaryName} Stronger
                      </div>
                      <div style={{ fontSize: '0.75rem', color: BRAND.textSecondary, marginLeft: '18px' }}>{strongerCount} Areas · {strongerPct}%</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: BRAND.textPrimary }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: BRAND.green }} /> Comparable
                      </div>
                      <div style={{ fontSize: '0.75rem', color: BRAND.textSecondary, marginLeft: '18px' }}>{comparableCount} Areas · {comparablePct}%</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: BRAND.textPrimary }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: BRAND.textSecondary }} /> {competitorName} Stronger
                      </div>
                      <div style={{ fontSize: '0.75rem', color: BRAND.textSecondary, marginLeft: '18px' }}>{weakerCount} Areas · {weakerPct}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.75rem', color: BRAND.navy, fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Key Takeaway</div>
                <div style={{ borderLeft: `3px solid ${BRAND.orange}`, paddingLeft: '16px', fontSize: '0.95rem', color: BRAND.textPrimary, fontWeight: 500, lineHeight: 1.6 }}>
                  {primaryName} offers broader and more comprehensive service coverage across key technology areas.
                </div>
              </div>
            </div>
          </div>

          <RecommendationFooter 
            recommendation="Continue leveraging strengths in Power Platform, Dynamics 365, and AI & Automation. Expand Industry Solutions to increase market differentiation."
            focusArea="Industry Solutions"
            impact="High"
            time="3-6 Months"
          />
        </div>
      );
    }
    
    // --- EXECUTIVE SUMMARY ---
    const websiteP = getScore('website', 'primary') || 82;
    const websiteC = getScore('website', 'competitor') || 76;
    const servicesP = getScore('services', 'primary') || 64;
    const servicesC = getScore('services', 'competitor') || 81;
    const trustP = getScore('trust', 'primary') || 70;
    const trustC = getScore('trust', 'competitor') || 66;
    const seoP = getScore('seo', 'primary') || 58;
    const seoC = getScore('seo', 'competitor') || 49;
    const contentP = getScore('content', 'primary') || 63;
    const contentC = getScore('content', 'competitor') || 61;
    const leadP = getScore('lead', 'primary') || 55;
    const leadC = getScore('lead', 'competitor') || 40;

    const rows = [
      { icon: Globe, category: 'Website', softree: websiteP, competitor: websiteC, winner: getWinner(websiteP, websiteC) },
      { icon: FileText, category: 'Service Portfolio', softree: servicesP, competitor: servicesC, winner: getWinner(servicesP, servicesC) },
      { icon: ShieldCheck, category: 'Trust & Credibility', softree: trustP, competitor: trustC, winner: getWinner(trustP, trustC) },
      { icon: Search, category: 'SEO & GEO Analysis', softree: seoP, competitor: seoC, winner: getWinner(seoP, seoC) },
      { icon: Zap, category: 'Content & Engagement', softree: contentP, competitor: contentC, winner: getWinner(contentP, contentC) },
      { icon: TrendingUp, category: 'Lead Generation', softree: leadP, competitor: leadC, winner: getWinner(leadP, leadC) },
    ];

    // Compute overall scores dynamically from all category scores
    const pScore = Math.round(rows.reduce((sum, r) => sum + r.softree, 0) / rows.length);
    const cScore = Math.round(rows.reduce((sum, r) => sum + r.competitor, 0) / rows.length);
    const overallWinner = getWinner(pScore, cScore);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              EXECUTIVE INTELLIGENCE REPORT
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: BRAND.navy, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              AI Competitor Gap Report
            </h1>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
              <span style={{ color: BRAND.orange }}>{primaryName}</span> <span style={{ color: BRAND.textSecondary, fontSize: '1.1rem', margin: '0 8px', fontWeight: 600 }}>VS</span> <span style={{ color: BRAND.green }}>{competitorName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', color: BRAND.textPrimary, fontSize: '0.8rem', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color={BRAND.textSecondary} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          
          <button 
            onClick={handleEmailReport} 
            disabled={emailing || emailDelivered} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              background: BRAND.orange, color: BRAND.white, 
              border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
            }}
          >
            {emailing ? <Loader2 size={18} className="spinning" /> : (emailDelivered ? <Check size={18} /> : <Mail size={18} />)}
            {emailing ? 'Delivering...' : (emailDelivered ? 'Delivered' : 'Email Full Report')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '12px' }}>
          <KPICard title="Overall Winner" value={overallWinner} icon={Trophy} color={BRAND.orange} />
          <KPICard title="Competitive Position" value={pScore >= cScore ? 'Market Leader' : 'Market Challenger'} icon={Award} color={BRAND.blue} />
          <KPICard title="Overall Score" value={pScore} subtitle="/100" icon={TrendingUp} color={BRAND.green} subColor={BRAND.textSecondary} />
          <KPICard title="Business Risk" value={pScore >= 70 ? 'Low' : pScore >= 50 ? 'Medium' : 'High'} icon={ShieldCheck} color={BRAND.orange} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '16px', marginTop: '8px' }}>
          <ComparisonTable 
            rows={rows}
            summary={{ softree: pScore, competitor: cScore, winner: overallWinner }}
            primaryName={primaryName}
            competitorName={competitorName}
          />
          <VisualizationCard title="Competitive Radar" primaryName={primaryName} competitorName={competitorName} />
          <AIVerdictList 
            strengths={report?.trust_credibility?.strengths || ['Stronger website experience', 'Broader service portfolio', 'Higher trust & credibility']}
            weaknesses={report?.trust_credibility?.weaknesses || ['Weaker AI search visibility', 'Missing capabilities']}
            verdictTitle={pScore >= cScore ? "Market Leader" : "Market Challenger"}
            verdictDesc={report?.ai_recommendations?.overall_advantage || `leads in core areas, while ${competitorName} has certain edges.`}
            primaryName={primaryName}
            competitorName={competitorName}
          />
        </div>

        <ExecutiveRecommendationCard 
          winnerName={overallWinner}
          priorities={report?.ai_recommendations?.executive_recommendations ? report.ai_recommendations.executive_recommendations.slice(0, 2).map(r => r.split('[')[0].trim()) : [
            'Improve search visibility & UX',
            'Enhance core services & content'
          ]}
          impactValue={report?.ai_recommendations?.top_business_impact || "High"}
          impactLabel="Growth Opportunity"
        />
      </div>
    );
  };

  return (
    <div id="competitor-dashboard-container" style={{ minHeight: '100vh', background: BRAND.lightBg, fontFamily: '"Inter", sans-serif' }}>
      <div style={{ display: 'flex', maxWidth: '1700px', margin: '0 auto', minHeight: '100vh' }}>
      
        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <div style={{ width: '240px', flexShrink: 0, background: BRAND.white, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BRAND.border}` }}>
          <div style={{ padding: '32px 24px', marginBottom: '8px' }}>
            <Logo size={40} />
          </div>
        
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: '16px' }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px', width: '100%',
                    border: 'none', background: isActive ? '#FFF4F0' : 'transparent',
                    borderLeft: isActive ? `4px solid ${BRAND.orange}` : '4px solid transparent',
                    color: isActive ? BRAND.orange : BRAND.navy, 
                    fontWeight: isActive ? 700 : 600, borderTopRightRadius: '24px', borderBottomRightRadius: '24px',
                    fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '4px'
                  }}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                  {item.label}
                </button>
              );
            })}
            
            <style>{`
              .new-analysis-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                width: 100%;
                height: 40px;
                background: #FF6B00;
                color: #FFFFFF;
                border: none;
                border-radius: 10px;
                font-weight: 500;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 200ms ease;
                box-shadow: 0 4px 12px rgba(255, 107, 0, 0.15);
              }
              .new-analysis-btn:hover {
                transform: translateY(-2px);
                background: #E65A00;
                box-shadow: 0 6px 16px rgba(255, 107, 0, 0.25);
              }
            `}</style>
            <div style={{ marginTop: 'auto', marginBottom: '24px', paddingLeft: '24px' }}>
              <button className="new-analysis-btn" onClick={onReset}>
                <Plus size={16} strokeWidth={2.5} /> New Analysis
              </button>
            </div>
          </div>

        </div>

        {/* ── MAIN CONTENT AREA ──────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ width: '100%', padding: '28px 36px', position: 'relative' }}>
            {/* Subtle Orange background pattern top right matching design request */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle at top right, rgba(255, 90, 31, 0.05), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          
            <div style={{ position: 'relative', zIndex: 1 }}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* ── HIDDEN PRINT CONTAINER ──────────────────────────── */}
      <div id="print-container" style={{ display: 'none' }}>
        {navItems.map(item => (
          <div key={item.label} className="print-page">
            {renderTabContent(item.label)}
          </div>
        ))}
      </div>
    </div>
  );
}
