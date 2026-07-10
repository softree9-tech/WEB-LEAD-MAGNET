import React, { useState, useMemo } from 'react';
import { Download, Mail, CheckCircle2, TrendingUp, Clock, DollarSign, Brain, Users, Activity, Target, Loader2, ChevronRight, ShieldCheck, Zap, AlertTriangle, Workflow, Map, ArrowRight } from 'lucide-react';
import { emailHealthcareReport, downloadHealthcarePdf } from '../../api/api';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell
} from 'recharts';

export default function HealthcareDashboard({ data, userEmail, userName, hospitalName, onReset }) {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const [emailing, setEmailing] = useState(false);
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await downloadHealthcarePdf({ ...data, hospital_name: hospitalName });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Healthcare_Assessment_${hospitalName || 'Report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleEmailReport = async () => {
    if (emailing || emailDelivered) return;
    setEmailing(true);
    try {
      // Create exact dashboard HTML
      const dashboardElement = document.querySelector('.healthcare-dashboard-container');
      const dashboardClone = dashboardElement ? dashboardElement.cloneNode(true) : document.body.cloneNode(true);
      
      let cssRules = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
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
<script src="https://cdn.tailwindcss.com"></script>
<style>
  ${cssRules}
  body { background: #F7F8FC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
  .no-print { display: none !important; }
</style>
</head>
<body>
  <div style="width: 100%; max-width: 1440px; margin: 0 auto; background: #F7F8FC;">
    ${dashboardClone.outerHTML}
  </div>
</body>
</html>
      `;

      const payload = {
        name: userName || "Healthcare Executive",
        email: userEmail || "unknown@example.com",
        hospital_name: hospitalName || "Hospital",
        report_data: data,
        html_content: fullHtml
      };
      await emailHealthcareReport(payload);
      setEmailDelivered(true);
    } catch (err) {
      console.error(err);
      alert("Failed to email report.");
    } finally {
      setEmailing(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const dashboardElement = document.querySelector('.healthcare-dashboard-container');
      const dashboardClone = dashboardElement ? dashboardElement.cloneNode(true) : document.body.cloneNode(true);
      
      let cssRules = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
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
<script src="https://cdn.tailwindcss.com"></script>
<style>
  ${cssRules}
  body { background: #F7F8FC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
  .no-print { display: none !important; }
</style>
</head>
<body>
  <div style="width: 100%; max-width: 1440px; margin: 0 auto; background: #F7F8FC;">
    ${dashboardClone.outerHTML}
  </div>
</body>
</html>
      `;

      const response = await fetch("http://localhost:8000/api/healthcare/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_name: hospitalName || "Hospital",
          report_data: data,
          html_content: fullHtml
        })
      });

      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Softree_Healthcare_Assessment_${(hospitalName || "Hospital").replace(/\\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const readinessScore = data?.ai_readiness_score || 0;
  let readinessBadge = { label: 'Early Stage', color: '#5F6475', bg: '#F7F8FC' };
  if (readinessScore >= 70) {
    readinessBadge = { label: 'High Readiness', color: '#16A34A', bg: '#DCFCE7' };
  } else if (readinessScore >= 40) {
    readinessBadge = { label: 'Moderate Readiness', color: '#D97706', bg: '#FEF3C7' };
  }

  // Generate radar chart data
  const radarData = useMemo(() => [
    { subject: 'People', A: data?.readiness_people || 40, fullMark: 100 },
    { subject: 'Process', A: data?.readiness_processes || 50, fullMark: 100 },
    { subject: 'Tech', A: data?.readiness_technology || 60, fullMark: 100 },
    { subject: 'Data', A: data?.readiness_data || 45, fullMark: 100 },
    { subject: 'Gov', A: data?.readiness_governance || 70, fullMark: 100 },
    { subject: 'Sec', A: data?.readiness_security || 85, fullMark: 100 },
  ], [data]);

  // Generate bar chart data
  const barData = useMemo(() => {
    if (data?.department_scores && data.department_scores.length > 0) {
      return [...data.department_scores].sort((a, b) => b.score - a.score);
    }
    return [
      { name: 'Finance', score: 85 },
      { name: 'Clinical', score: 70 },
      { name: 'Ops', score: 90 },
      { name: 'Patient Svcs', score: 65 },
      { name: 'Admin', score: 80 }
    ].sort((a, b) => b.score - a.score);
  }, [data]);

  const topOpps = (data?.top_ai_opportunities || []).slice(0, 5);

  return (
    <div className="healthcare-dashboard-container" style={{ backgroundColor: '#F7F8FC', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      
      {/* ── HEADER ── */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E7EAF3', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(10, 15, 60, 0.02)' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            AI Agent Opportunity Assessment™
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0F3C', margin: '0' }}>
            {hospitalName || 'Healthcare Organization'}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="no-print">
          <div style={{ fontSize: '0.85rem', color: '#5F6475', fontWeight: 500, marginRight: '1rem' }}>
            Generated {currentDate}
          </div>
          <button onClick={onReset} style={{ height: '40px', padding: '0 1.25rem', borderRadius: '8px', background: '#F7F8FC', color: '#0A0F3C', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #E7EAF3' }} className="hover:-translate-y-0.5 hover:shadow-sm">
            New Analysis
          </button>
          <button onClick={handleEmailReport} disabled={emailing || emailDelivered} style={{ height: '40px', padding: '0 1.5rem', borderRadius: '8px', background: '#0A0F3C', color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', boxShadow: '0 4px 12px rgba(10, 15, 60, 0.15)' }} className="hover:-translate-y-0.5 hover:shadow-md">
            <Mail size={16} /> {emailing ? "Sending..." : emailDelivered ? "Sent" : "Email Full Report"}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '2.5rem' }}>
        
        {/* ── SECTION 1: EXECUTIVE HEADER ── */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '400px', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Executive Assessment Overview
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#5F6475', lineHeight: 1.6, margin: 0 }}>
              Based on your responses, your organization demonstrates {readinessScore >= 70 ? 'strong' : readinessScore >= 40 ? 'moderate' : 'early-stage'} AI readiness with multiple high-value automation opportunities across clinical and administrative operations. Immediate prioritization can yield significant operational savings and performance gains.
            </p>
          </div>
          <div style={{ background: readinessBadge.bg, color: readinessBadge.color, padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${readinessBadge.color}30` }}>
            <ShieldCheck size={20} />
            {readinessBadge.label}
          </div>
        </section>

        {/* ── SECTION 2: EXECUTIVE KPI CARDS ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'AI Readiness Score', value: `${readinessScore}/100`, icon: Brain },
            { label: 'Opportunity Level', value: data?.ai_opportunity_level || 'Moderate', icon: Target },
            { label: 'Estimated Annual ROI', value: data?.estimated_annual_roi || 'N/A', icon: DollarSign },
            { label: 'Potential Annual Savings', value: data?.potential_annual_cost_savings || 'N/A', icon: TrendingUp },
            { label: 'Recommended Agents', value: data?.recommended_ai_agents_count || 0, icon: Activity },
            { label: 'Implementation Timeline', value: data?.estimated_implementation_timeline || 'N/A', icon: Clock }
          ].map((kpi, idx) => (
            <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 14px rgba(10,15,60,0.02)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ background: '#FFF0E6', padding: '8px', borderRadius: '10px', color: '#FF6B00' }}>
                  <kpi.icon size={20} strokeWidth={2.5} />
                </div>

              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '0.25rem', lineHeight: 1.1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#5F6475', fontWeight: 600 }}>{kpi.label}</div>
            </div>
          ))}
        </section>

        {/* ── SECTION 3: EXECUTIVE ANALYTICS ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* LEFT: Top AI Opportunities Cards */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(10,15,60,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="#FF6B00" />
              Top AI Opportunities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topOpps.length > 0 ? topOpps.map((opp, idx) => (
                <div key={idx} style={{ background: '#F7F8FC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E7EAF3', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5F6475', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{opp.department || opp.dept}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A0F3C' }}>{opp.recommended_agent || opp.agent}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#5F6475', marginBottom: '0.25rem' }}>Business Impact</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0A0F3C' }}>{opp.impact || 'High'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: opp.priority === 'High' ? '#FFF0E6' : '#F7F8FC', color: opp.priority === 'High' ? '#FF6B00' : '#5F6475', border: opp.priority === 'High' ? '1px solid #FF6B00' : '1px solid #E7EAF3' }}>
                      {opp.priority} Priority
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#5F6475' }}>No opportunity data available.</div>
              )}
            </div>
          </div>

          {/* RIGHT: Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,15,60,0.02)', flex: 1, minHeight: '280px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A0F3C', marginBottom: '1rem', textAlign: 'center' }}>AI Readiness Dimensions</h3>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#E7EAF3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#5F6475', fontSize: 11, fontWeight: 600 }} />
                    <Radar name="Readiness" dataKey="A" stroke="#FF6B00" strokeWidth={2} fill="#FF6B00" fillOpacity={0.2} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ color: '#0A0F3C', fontWeight: 700 }} itemStyle={{ color: '#5F6475', fontWeight: 600 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div style={{ background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,15,60,0.02)', flex: 1, minHeight: '220px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0A0F3C', marginBottom: '1rem' }}>Department Opportunity Score</h3>
              <div style={{ width: '100%', height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7EAF3" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={75} tick={{ fill: '#0A0F3C', fontSize: 11, fontWeight: 600 }} />
                    <RechartsTooltip cursor={{ fill: '#F7F8FC' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ color: '#0A0F3C', fontWeight: 700 }} itemStyle={{ color: '#5F6475', fontWeight: 600 }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF6B00' : '#0A0F3C'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: BUSINESS IMPACT DASHBOARD ── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1.25rem' }}>Business Impact Projections</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Annual Savings', val: data?.estimated_annual_savings || 'N/A' },
              { label: 'Staff Hours Saved', val: data?.estimated_hours_saved ? `${data.estimated_hours_saved}`.replace(/hours?/gi, '').trim() + ' hrs/year' : 'N/A' },
              { label: 'Operational Efficiency', val: data?.operational_efficiency_gain || 'N/A' },
              { label: 'Patient Satisfaction', val: data?.patient_satisfaction_improvement || 'N/A' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#0A0F3C', borderRadius: '16px', padding: '1.5rem', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
                  <TrendingUp size={80} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#D1D5DB', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 5 & 6: ROADMAP & RECOMMENDATIONS ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Implementation Roadmap */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(10,15,60,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Map size={20} color="#FF6B00" />
              Implementation Roadmap
            </h3>
            <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <div style={{ position: 'absolute', left: 0, top: '8px', bottom: '8px', width: '2px', background: '#E7EAF3' }}></div>
              {(data?.implementation_roadmap?.length > 0 ? data.implementation_roadmap : [
                { phase: 'Phase 1', title: 'Quick Wins', desc: 'Deploy high-ROI agents in targeted administrative workflows.' },
                { phase: 'Phase 2', title: 'Department Automation', desc: 'Scale AI across entire departments (e.g., Clinical Docs, Finance).' },
                { phase: 'Phase 3', title: 'Enterprise AI Expansion', desc: 'Integrate advanced analytics and predictive models system-wide.' }
              ]).map((step, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: idx === 2 ? 0 : '2rem' }}>
                  <div style={{ position: 'absolute', left: '-1.5rem', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#FF6B00', transform: 'translateX(-45%)', border: '3px solid #FFFFFF' }}></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{step.phase}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A0F3C', marginBottom: '0.25rem' }}>{step.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#5F6475', lineHeight: 1.4 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Recommendations */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(10,15,60,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0F3C', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Workflow size={20} color="#FF6B00" />
              Executive Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(data?.priority_focus_areas || ['Prioritize clinical documentation AI', 'Automate patient scheduling', 'Enhance revenue cycle management', 'Deploy patient triage bots', 'Audit data governance']).slice(0,5).map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F7F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0F3C', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, border: '1px solid #E7EAF3' }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0A0F3C', lineHeight: 1.4 }}>{rec}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ── BOTTOM SECTION: EXECUTIVE SUMMARY & CTA ── */}
        <section style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '400px', background: '#FFFFFF', border: '1px solid #E7EAF3', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(10,15,60,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', marginBottom: '1rem' }}>Executive Summary</h3>
            <p style={{ fontSize: '1.25rem', color: '#0A0F3C', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
              "{data?.executive_summary || 'This assessment indicates strong potential for AI adoption. Finance and Clinical Documentation should be prioritized first to maximize ROI while minimizing implementation effort.'}"
            </p>
          </div>
          
          <div style={{ width: '100%', maxWidth: '400px', background: '#0A0F3C', borderRadius: '20px', padding: '2.5rem', color: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>Ready to Build Your AI Roadmap?</h3>
            <p style={{ fontSize: '0.95rem', color: '#D1D5DB', marginBottom: '2rem', lineHeight: 1.5 }}>
              Validate these opportunities with our AI specialists and build a phased implementation plan.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="no-print">
              <button onClick={() => window.open('https://www.softreetechnology.com/contact', '_blank')} style={{ height: '48px', width: '100%', borderRadius: '10px', background: '#FF6B00', color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.2)' }} className="hover:-translate-y-0.5 hover:shadow-lg">
                Book Consultation <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
