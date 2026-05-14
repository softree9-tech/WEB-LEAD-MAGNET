import React from 'react';
import '../LeadResults.css';
import { ExternalLink, RefreshCw, Download, Monitor, Mail, Lock, FileCode, Check, X, Search, Activity, BarChart3, Settings, LogOut, LayoutDashboard, FileText, Bot, Target, Smartphone, Copy, TrendingDown, AlertTriangle } from 'lucide-react';

export default function LeadResults({ leads }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          No websites analyzed yet. Enter a URL above to generate a Rebranding & Search Visibility Report.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Global Batch Export Button */}
      {leads.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
          <button
            className="primary-btn"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
            }}
            onClick={() => {
              const csvHeader = 'website,final_score,design,cta,message,trust,speed,first_impression_score,first_impression_verdict,first_impression_explanation,revenue_leak,leak_severity,visitors_lost,leads_lost,missing_leads_count,conversion_loss_percent,readiness_level,missing_leads_insight,rebranding_pitch,trust_warnings,seo_issues,aeo_quote,emailfullbody\n';

              const csvRows = leads.map(lead => {
                const consistencyVal = lead.design === 'Modern' ? 90 : 60;
                const flowVal = lead.message === 'Clear' ? 80 : 50;
                const mobileVal = lead.seo_mobile ? 80 : 30;
                const engagementVal = lead.cta === 'Strong' ? 90 : 40;
                const uxScore = Math.round((consistencyVal + flowVal + mobileVal + engagementVal) / 4);

                const trustWarning = [
                  (!lead.seo_ssl ? 'SSL certificate invalid or missing' : (lead.ssl_days_remaining < 30 ? `SSL expires in ${lead.ssl_days_remaining} days` : '')),
                  !lead.has_lead_capture ? 'No contact form detected' : '',
                  !lead.has_newsletter ? 'No newsletter signup found' : '',
                  !(lead.has_analytics?.google_analytics) ? 'Google Analytics not installed' : '',
                ].filter(Boolean).join(' | ') || 'No critical issues found';

                const seoIssues = [
                  !lead.seo_title && 'Missing title tag',
                  !lead.seo_meta_desc && 'Missing meta description',
                  !lead.seo_h1 && 'Missing H1 tag',
                  !lead.seo_canonical && 'Missing canonical tag',
                  !lead.seo_og && 'Missing Open Graph tags',
                  !lead.seo_mobile && 'Poor mobile optimization',
                  lead.has_duplicate_meta && 'Duplicate meta tags',
                  !lead.has_cta && 'Weak CTA placement',
                  !lead.has_newsletter && 'Missing newsletter signup',
                  parseFloat(lead.load_time) > 3.0 && `Slow page load (${lead.load_time}s)`,
                  (lead.broken_links?.length > 0) && `${lead.broken_links.length} broken links`,
                  (lead.image_percent_missing_alt > 0) && 'Missing alt text',
                  ...((lead.lighthouse_issues?.performance || []).slice(0, 1).map(i => `Perf: ${i}`)),
                  ...((lead.lighthouse_issues?.seo || []).slice(0, 1).map(i => `SEO: ${i}`)),
                ].filter(Boolean).slice(0, 5).join(' | ') || 'No major SEO issues detected';

                const batchSeoScore = parseInt(lead.seo_score || 0);
                const batchAeoScore = parseInt(lead.aeo_score || 0);
                const batchEmailBody = `Hi team,

I was doing some research in your industry and took a look under the hood of ${lead.website.replace(/^https?:\/\//i, '')}. I ran a deep forensic analysis and found 4 critical bottlenecks bleeding your organic traffic and conversions:

1. REBRANDING & UX (${uxScore}/100)
${lead.rebranding_pitch || "Your overall visual hierarchy and user engagement flows need optimization to convert high-intent traffic."}

2. TECH & TRUST SIGNALS
${lead.ssl_days_remaining < 30 ? `Critical: Your SSL Certificate expires in ${lead.ssl_days_remaining} days, which will trigger Google security warnings. ` : ``}${(!lead.has_lead_capture || !lead.has_newsletter) ? "You are currently missing vital lead capture mechanisms like a newsletter opt-in or strong contact forms." : "Your core tracking tags and lead pipelines need to be optimized for conversion tracking."}

3. GOOGLE SEO METRICS (${batchSeoScore}/100)
Google's official Lighthouse API grades your site's performance at ${lead.lighthouse_performance || 50}% and accessibility at ${lead.lighthouse_accessibility || 50}%. Your live load time is ${lead.load_time}s.

4. AI SEARCH VISIBILITY (AEO: ${batchAeoScore}/100)
The future of search is AI. We directly queried ChatGPT about your brand, and the engine responded: "${lead.aeo_probe_response || "I am unable to find detailed information."}"

I've put together a comprehensive technical audit outlining exactly how we can resolve these specific issues to immediately improve your conversion rate. Do you have 5 minutes next Tuesday to chat?

Best,
[Your Name]`;

                const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

                return [
                  escapeCSV(lead.website),
                  uxScore,
                  escapeCSV(lead.design),
                  escapeCSV(lead.cta),
                  escapeCSV(lead.message),
                  escapeCSV(lead.trust),
                  escapeCSV(lead.speed),
                  escapeCSV(lead.first_impression_score || 0),
                  escapeCSV(lead.first_impression_verdict || 'Unknown'),
                  escapeCSV(lead.first_impression_explanation || ''),
                  escapeCSV(`$${lead.revenue_leak_amount || 0}`),
                  escapeCSV(lead.revenue_leak_severity || 'Low'),
                  escapeCSV(lead.visitors_lost || 0),
                  escapeCSV(lead.leads_lost || 0),
                  escapeCSV(lead.missing_opportunities_count || 0),
                  escapeCSV(`${lead.estimated_conversion_loss_percent || 0}%`),
                  escapeCSV(lead.conversion_readiness_level || 'Low'),
                  escapeCSV(lead.missing_leads_insight || ''),
                  escapeCSV(lead.rebranding_pitch),
                  escapeCSV(trustWarning),
                  escapeCSV(seoIssues),
                  escapeCSV((lead.aeo_probe_response || 'No AI recognition data.').substring(0, 1000)),
                  escapeCSV(batchEmailBody)
                ].join(',');
              }).join('\n');

              const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `batch_analysis_report_${new Date().getTime()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download size={18} style={{ marginRight: '8px' }} />
            Export All {leads.length} Results to Master CSV
          </button>
        </div>
      )}

      {leads.map((lead, index) => {
        // Core metrics mappings
        const consistencyVal = lead.design === 'Modern' ? 90 : 60;
        const flowVal = lead.message === 'Clear' ? 80 : 50;
        const mobileVal = lead.seo_mobile ? 80 : 30;
        const engagementVal = lead.cta === 'Strong' ? 90 : 40;
        const uxScore = Math.round((consistencyVal + flowVal + mobileVal + engagementVal) / 4);

        const seoScore = parseInt(lead.seo_score || 0);
        const aeoScore = parseInt(lead.aeo_score || 0);

        const emailBody = `Hi team,

I was doing some research in your industry and took a look under the hood of ${lead.website.replace(/^https?:\/\//i, '')}. I ran a deep forensic analysis and found 4 critical bottlenecks bleeding your organic traffic and conversions:

1. REBRANDING & UX (${uxScore}/100)
${lead.rebranding_pitch || "Your overall visual hierarchy and user engagement flows need optimization to convert high-intent traffic."}

2. TECH & TRUST SIGNALS
${lead.ssl_days_remaining < 30 ? `Critical: Your SSL Certificate expires in ${lead.ssl_days_remaining} days, which will trigger Google security warnings. ` : ``}${(!lead.has_lead_capture || !lead.has_newsletter) ? "You are currently missing vital lead capture mechanisms like a newsletter opt-in or strong contact forms." : "Your core tracking tags and lead pipelines need to be optimized for conversion tracking."}

3. GOOGLE SEO METRICS (${seoScore}/100)
Google's official Lighthouse API grades your site's performance at ${lead.lighthouse_performance || 50}% and accessibility at ${lead.lighthouse_accessibility || 50}%. Your live load time is ${lead.load_time}s.

4. AI SEARCH VISIBILITY (AEO: ${aeoScore}/100)
The future of search is AI. We directly queried ChatGPT about your brand, and the engine responded: "${lead.aeo_probe_response || "I am unable to find detailed information."}"

I've put together a comprehensive technical audit outlining exactly how we can resolve these specific issues to immediately improve your conversion rate. Do you have 5 minutes next Tuesday to chat?

Best,
[Your Name]`;


        return (
          <div key={index} className="elite-dashboard">
            <div className="elite-sidebar">
              <div className="brand-icon">P</div>

              <div className="nav-tooltip-wrap">
                <LayoutDashboard size={20} className="nav-icon active" onClick={() => document.getElementById(`lead-${index}`).scrollIntoView({ behavior: 'smooth' })} />

              </div>

              <div className="nav-tooltip-wrap">
                <FileText size={20} className="nav-icon" onClick={() => document.getElementById(`lead-${index}-outreach`).scrollIntoView({ behavior: 'smooth' })} />

              </div>

              <div className="nav-tooltip-wrap">
                <BarChart3 size={20} className="nav-icon" onClick={() => document.getElementById(`lead-${index}-seo`).scrollIntoView({ behavior: 'smooth' })} />

              </div>

              <div className="nav-tooltip-wrap">
                <Activity size={20} className="nav-icon" onClick={() => document.getElementById(`lead-${index}-trust`).scrollIntoView({ behavior: 'smooth' })} />

              </div>

              <div className="nav-tooltip-wrap" style={{ marginTop: 'auto' }}>
                <Settings size={20} className="nav-icon" onClick={() => alert('Settings coming soon!')} />

              </div>

              <div className="nav-tooltip-wrap" style={{ marginBottom: '2rem' }}>
                <LogOut size={20} className="nav-icon" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

              </div>
            </div>

            <div className="elite-main" id={`lead-${index}`}>
              <div className="elite-header">
                <div>
                  <h1 className="report-title">WEBSITE PERFORMANCE REPORT: <span className="highlight-domain">{lead.website.replace(/^https?:\/\//i, '')}</span></h1>
                  <p className="report-date">Data as of: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="header-actions">
                  <button className="action-btn" onClick={() => window.location.reload()}><RefreshCw size={14} /> Recalculate</button>
                  <button className="action-btn primary" onClick={() => {
                    const csvHeader = 'website,final_score,design,cta,message,trust,speed,first_impression_score,first_impression_verdict,first_impression_explanation,revenue_leak,leak_severity,visitors_lost,leads_lost,missing_leads_count,conversion_loss_percent,readiness_level,missing_leads_insight,rebranding_pitch,trust_warnings,seo_issues,aeo_quote,emailfullbody\n';
                    const trustWarning = [
                      (!lead.seo_ssl ? 'SSL certificate invalid or missing' : (lead.ssl_days_remaining < 30 ? `SSL expires in ${lead.ssl_days_remaining} days` : '')),
                      !lead.has_lead_capture ? 'No contact form detected' : '',
                      !lead.has_newsletter ? 'No newsletter signup found' : '',
                      !(lead.has_analytics?.google_analytics) ? 'Google Analytics not installed' : '',
                    ].filter(Boolean).join(' | ') || 'No critical issues found';

                    const seoIssues = [
                      !lead.seo_title && 'Missing title tag',
                      !lead.seo_meta_desc && 'Missing meta description',
                      !lead.seo_h1 && 'Missing H1 tag',
                      !lead.seo_canonical && 'Missing canonical tag',
                      !lead.seo_og && 'Missing Open Graph tags',
                      !lead.seo_mobile && 'Poor mobile optimization',
                      lead.has_duplicate_meta && 'Duplicate meta tags',
                      !lead.has_cta && 'Weak CTA placement',
                      !lead.has_newsletter && 'Missing newsletter signup',
                      parseFloat(lead.load_time) > 3.0 && `Slow page load (${lead.load_time}s)`,
                      (lead.broken_links?.length > 0) && `${lead.broken_links.length} broken links`,
                      (lead.image_percent_missing_alt > 0) && 'Missing alt text',
                      ...((lead.lighthouse_issues?.performance || []).slice(0, 1).map(i => `Perf: ${i}`)),
                      ...((lead.lighthouse_issues?.seo || []).slice(0, 1).map(i => `SEO: ${i}`)),
                    ].filter(Boolean).slice(0, 5).join(' | ') || 'No major SEO issues detected';

                    // Preserve newlines inside quoted fields — RFC 4180 compliant
                    const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

                    const csvRow = [
                      escapeCSV(lead.website),
                      uxScore,
                      escapeCSV(lead.design),
                      escapeCSV(lead.cta),
                      escapeCSV(lead.message),
                      escapeCSV(lead.trust),
                      escapeCSV(lead.speed),
                      escapeCSV(lead.first_impression_score || 0),
                      escapeCSV(lead.first_impression_verdict || 'Unknown'),
                      escapeCSV(lead.first_impression_explanation || ''),
                      escapeCSV(`$${lead.revenue_leak_amount || 0}`),
                      escapeCSV(lead.revenue_leak_severity || 'Low'),
                      escapeCSV(lead.visitors_lost || 0),
                      escapeCSV(lead.leads_lost || 0),
                      escapeCSV(lead.missing_opportunities_count || 0),
                      escapeCSV(`${lead.estimated_conversion_loss_percent || 0}%`),
                      escapeCSV(lead.conversion_readiness_level || 'Low'),
                      escapeCSV(lead.missing_leads_insight || ''),
                      escapeCSV(lead.rebranding_pitch),
                      escapeCSV(trustWarning),
                      escapeCSV(seoIssues),
                      escapeCSV((lead.aeo_probe_response || 'No AI recognition data.').substring(0, 500)),
                      escapeCSV(emailBody)
                    ].join(',');


                    const blob = new Blob(['\uFEFF' + csvHeader + csvRow], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `instantly_${lead.website.replace(/^https?:\/\//i, '').replace(/[/.]/g, '_')}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }}><Download size={14} /> Export to Instantly CSV</button>
                  {/* <div className="avatar">JD</div> */}
                </div>
              </div>

              <div className="quadrant-grid">

                {/* 0. First Impression Score */}
                <div className="quad-card first-impression-card animate-slide-up">
                  <div className="quad-header">
                    <h2>Professional Presence Score</h2>
                    <div className={`verdict-badge verdict-${(lead.first_impression_verdict || 'Average').toLowerCase()}`}>
                      {lead.first_impression_verdict || 'Average'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="impression-score-large">
                      {lead.first_impression_score || 0}<span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500 }}>/10</span>
                    </div>
                    <div className="impression-explanation">
                      {lead.first_impression_explanation || "Analyzing website's visual impact and immediate trust signals..."}
                    </div>
                  </div>
                  <div className="impression-factors">
                    <div className="factor-tag"><Activity size={12} /> Branding</div>
                    <div className="factor-tag"><LayoutDashboard size={12} /> Layout</div>
                    <div className="factor-tag"><Target size={12} /> CTA Clarity</div>
                    <div className="factor-tag"><Lock size={12} /> Trust</div>
                    <div className="factor-tag"><Smartphone size={12} /> Mobile Feel</div>
                    <div className="factor-tag"><FileText size={12} /> Readability</div>
                  </div>
                </div>

                {/* 1. UX Scorecard */}
                <div className="quad-card">
                  <div className="quad-header">
                    <h2>Rebranding UX Scorecard</h2>
                    <div className="grade-badge">Grade: {uxScore > 80 ? 'A' : uxScore > 70 ? 'B+' : uxScore > 60 ? 'B' : 'C'} | {uxScore}%</div>
                  </div>
                  <div className="ux-content">
                    <div className="ring-container">
                      <div className="ring glow-ring" style={{ background: `conic-gradient(#06b6d4 ${uxScore}%, transparent 0)` }}>
                        <div className="inner-circle">
                          <span className="big-score">{uxScore}</span>
                          <span className="out-of">/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="ux-bars">
                      <div className="bar-row">
                        <span><Monitor size={14} /> Consistency</span>
                        <span>{lead.design === 'Modern' ? '9/10' : '6/10'}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: lead.design === 'Modern' ? '90%' : '60%' }}></div></div>
                      </div>
                      <div className="bar-row">
                        <span><FileCode size={14} /> Visual Flow</span>
                        <span>{lead.message === 'Clear' ? '8/10' : '5/10'}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: lead.message === 'Clear' ? '80%' : '50%' }}></div></div>
                      </div>
                      <div className="bar-row">
                        <span><Smartphone size={14} /> Mobile UX</span>
                        <span>{lead.seo_mobile ? '8/10' : '3/10'}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: lead.seo_mobile ? '80%' : '30%' }}></div></div>
                      </div>
                      <div className="bar-row">
                        <span><Target size={14} /> User Engagement</span>
                        <span>{lead.cta === 'Strong' ? '9/10' : '4/10'}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: lead.cta === 'Strong' ? '90%' : '40%' }}></div></div>
                      </div>
                    </div>
                  </div>
                  <div className="strengths-weaknesses">
                    <div>
                      <h4 className="green-title">Strengths</h4>
                      <ul className="green-list">
                        <li>{lead.design === 'Modern' ? 'Consistent color palette' : 'Basic foundational layout'}</li>
                        <li>{lead.cta === 'Strong' ? 'Clear CTA hierarchy' : 'Text is readable'}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="red-title">Improvement areas</h4>
                      <ul className="red-list">
                        {!lead.seo_mobile && <li>Slow page load / unoptimized Mobile UX</li>}
                        {(lead.total_links > 0 || lead.broken_links?.length > 0) && lead.broken_links?.length > 0 && <li>Contains {lead.broken_links?.length || 0} invalid links out of {lead.total_links || lead.broken_links?.length || 0} total links on homepage</li>}
                        {(lead.total_links > 0 || lead.broken_links?.length > 0) && (!lead.broken_links || lead.broken_links?.length === 0) && <li style={{ color: '#10b981' }}>0 invalid links out of {lead.total_links || 0} total links on homepage</li>}
                        {lead.image_percent_missing_alt > 0 && <li>Inconsistent alt-tag accessibility</li>}
                        {lead.has_dead_socials && <li>Features dead template social links</li>}
                        {(lead.seo_mobile && (!lead.broken_links || lead.broken_links.length === 0) && !lead.has_dead_socials) && <li>Minor visual flow inconsistencies</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. Tech & Trust */}
                <div className="quad-card" id={`lead-${index}-trust`}>
                  <div className="quad-header">
                    <h2>Tech & Trust Checkmarks</h2>
                    <div className="trust-badge" style={{ background: lead.trust === 'Strong' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: lead.trust === 'Strong' ? '#10b981' : '#ef4444', borderColor: lead.trust === 'Strong' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                      TRUST SIGNALS: {lead.trust} ({lead.trust === 'Strong' ? '90' : '40'}%)
                    </div>
                  </div>
                  <div className="checkmarks-grid">
                    <div className="check-box">
                      <h3><Activity size={16} color="#fbbf24" /> Tracking</h3>
                      <div className="check-item"><span>Google Analytics</span> {lead.has_analytics?.google_analytics ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Tag Manager</span> {lead.has_analytics?.tag_manager ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Facebook Pixel</span> {lead.has_analytics?.facebook_pixel ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>LinkedIn Tag</span> {lead.has_analytics?.linkedin_tag ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                    </div>
                    <div className="check-box">
                      <h3><Mail size={16} color="#a855f7" /> Lead Capture</h3>
                      <div className="check-item"><span>Contact Form</span> {lead.has_lead_capture ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>CTA Placement</span> {lead.has_cta ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Newsletter Sign-up</span> {lead.has_newsletter ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      {(!lead.has_lead_capture || !lead.has_newsletter) && <div style={{ color: '#ef4444', fontSize: '0.7rem', textAlign: 'right' }}>(Needs attention)</div>}
                    </div>
                    <div className="check-box">
                      <h3><Lock size={16} color="#10b981" /> SSL Security</h3>
                      <div className="check-item"><span>Certificate Valid</span> {lead.seo_ssl ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Expires</span> {lead.ssl_days_remaining ? `${lead.ssl_days_remaining} days` : 'N/A'}</div>
                      <div className="check-item"><span>HTTPS enforced</span> {lead.ssl_enforced ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                    </div>
                    <div className="check-box">
                      <h3><FileCode size={16} color="#3b82f6" /> Meta Tags</h3>
                      <div className="check-item"><span>Title Tag</span> {lead.seo_title ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Description</span> {lead.seo_meta_desc ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Canonical Tag</span> {lead.seo_canonical ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                      <div className="check-item"><span>Open Graph</span> {lead.seo_og ? <Check color="#10b981" size={16} /> : <X color="#ef4444" size={16} />}</div>
                    </div>
                  </div>
                </div>

                {/* 3. Google SEO */}
                <div className="quad-card" id={`lead-${index}-seo`}>
                  <div className="quad-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2>Google SEO Score</h2>
                    <div style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', background: lead.lighthouse_api_success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: lead.lighthouse_api_success ? '#10b981' : '#ef4444' }}>
                      {lead.lighthouse_api_success ? '• Verified via Google API' : '• AI Estimated (API Offline)'}
                    </div>
                  </div>
                  <div className="seo-dials-container">
                    <div className="corner-dial topleft">
                      <div className="mini-ring" style={{ background: `conic-gradient(#3b82f6 ${lead.lighthouse_performance || 50}%, transparent 0)` }}><div className="mini-inner">{lead.lighthouse_performance || 50}%</div></div>
                      <span>Performance</span>
                    </div>
                    <div className="corner-dial topright">
                      <div className="mini-ring" style={{ background: `conic-gradient(#3b82f6 ${lead.lighthouse_accessibility || 50}%, transparent 0)` }}><div className="mini-inner">{lead.lighthouse_accessibility || 50}%</div></div>
                      <span>Accessibility</span>
                    </div>

                    <div className="center-dial">
                      <div className="ring glow-ring seo-ring" style={{ background: `conic-gradient(#10b981 ${seoScore}%, transparent 0)` }}>
                        <div className="inner-circle">
                          <span className="big-score">{seoScore}</span>
                          <span className="out-of">/100</span>
                          <span className="status-text" style={{ color: '#10b981' }}>{seoScore > 80 ? 'Excellent' : seoScore > 50 ? 'Average' : 'Poor'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="corner-dial bottomleft">
                      <div className="mini-ring" style={{ background: `conic-gradient(#a855f7 ${lead.mobile_performance || 50}%, transparent 0)` }}><div className="mini-inner">{lead.mobile_performance || 50}%</div></div>
                      <span>Mobile UX</span>
                    </div>
                    <div className="corner-dial bottomright">
                      <div className="mini-ring" style={{ background: `conic-gradient(#3b82f6 ${seoScore}%, transparent 0)` }}><div className="mini-inner">{seoScore}%</div></div>
                      <span>Best Practices</span>
                    </div>
                  </div>

                  {lead.lighthouse_api_success && lead.lighthouse_issues && (
                    <div style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                      <h4 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '0.85rem' }}>Critical Technical Issues Detected:</h4>
                      <ul style={{ paddingLeft: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {lead.lighthouse_issues.accessibility?.map((issue, i) => <li key={`acc-${i}`}><strong style={{ color: '#a855f7' }}>Accessibility:</strong> {issue}</li>)}
                        {lead.lighthouse_issues.mobile?.map((issue, i) => <li key={`mob-${i}`}><strong style={{ color: '#f97316' }}>Mobile UX:</strong> {issue}</li>)}
                        {lead.lighthouse_issues.performance?.map((issue, i) => <li key={`perf-${i}`}><strong style={{ color: '#3b82f6' }}>Performance:</strong> {issue}</li>)}

                        {(!lead.lighthouse_issues.accessibility?.length && !lead.lighthouse_issues.mobile?.length && !lead.lighthouse_issues.performance?.length) &&
                          <li style={{ color: '#10b981', listStyle: 'none' }}>No major technical issues found by Google Lighthouse.</li>
                        }
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Live Page Load Speed:</span>
                      <span style={{ fontWeight: 600, color: parseFloat(lead.load_time) < 2.5 ? '#10b981' : '#ef4444' }}>{lead.load_time}s</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Primary Tech Stack:</span>
                      <span style={{ fontWeight: 600, textAlign: 'right' }}>{lead.tech_stack || 'Unknown'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Platform Last Modified:</span>
                      <span style={{ fontWeight: 600, textAlign: 'right' }}>{lead.last_modified}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Revenue Leak Calculator */}
                <div className="quad-card revenue-leak-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingDown size={20} /> Estimated Revenue Leakage
                    </h2>
                    <div className={`severity-badge severity-${(lead.revenue_leak_severity || 'Low').toLowerCase()}`}>
                      {lead.revenue_leak_severity || 'Low'} Severity
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="leak-amount-box">
                      <div className="leak-amount">
                        ${(lead.revenue_leak_amount || 0).toLocaleString()}
                        <span style={{ fontSize: '1rem', color: '#64748b', marginLeft: '6px', fontWeight: 500 }}>/ mo</span>
                      </div>
                    </div>
                    <div className="leak-stats" style={{ textAlign: 'right' }}>
                      <div className="stat-item" style={{ textAlign: 'right' }}>
                        <span className="stat-label">Visitors Lost</span>
                        <span className="stat-value">{lead.visitors_lost || 0}</span>
                      </div>
                      <div className="stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.25rem', textAlign: 'right' }}>
                        <span className="stat-label">Missed Leads</span>
                        <span className="stat-value">{lead.leads_lost || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={16} color="#ef4444" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>AI Insight</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      "{lead.revenue_leak_explanation || "You are likely losing revenue due to technical bottlenecks and conversion gaps."}"
                    </p>
                  </div>
                </div>

                {/* 5. Leads You're Missing */}
                <div className="quad-card missing-leads-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bot size={20} /> Leads You're Missing
                    </h2>
                    <div className={`severity-badge severity-${(lead.conversion_readiness_level || 'Low').toLowerCase() === 'high' ? 'low' : (lead.conversion_readiness_level || 'Low').toLowerCase() === 'medium' ? 'moderate' : 'critical'}`}>
                      Readiness: {lead.conversion_readiness_level || 'Low'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="missing-count-box">
                      <span className="missing-number">{lead.missing_opportunities_count || 0}</span>
                      <span className="missing-label">Missed Opportunities</span>
                    </div>
                    <div className="loss-percent-box" style={{ textAlign: 'right' }}>
                      <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 800 }}>-{lead.estimated_conversion_loss_percent || 0}%</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Est. Conversion Loss</div>
                    </div>
                  </div>

                  <div className="missing-items-list">
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Missing Conversion Paths:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(lead.missing_opportunities_list || []).map((item, i) => (
                        <div key={i} className="factor-tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <X size={12} /> {item}
                        </div>
                      ))}
                      {(lead.missing_opportunities_list || []).length === 0 && (
                        <div className="factor-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <Check size={12} /> All conversion paths active
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(249, 115, 22, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Bot size={16} color="#f97316" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase' }}>AI Insight</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      "{lead.missing_leads_insight || "Visitors have limited conversion paths, reducing lead generation potential."}"
                    </p>
                  </div>
                </div>

                {/* 6. AI Search Visibility & Ranking — Full Width */}
                <div className="quad-card aeo-card-wide" style={{ gridColumn: '1 / -1' }}>
                  <div className="quad-header">
                    <h2>AI Search Visibility &amp; Ranking</h2>
                    <div className="ai-logos" style={{ margin: 0 }}>
                      <span className="ai-badge"><Bot size={14} color="#10b981" /> ChatGPT</span>
                      <span className="ai-badge"><Search size={14} color="#a855f7" /> Gemini</span>
                      <span className="ai-badge" style={{ color: '#3b82f6' }}><span style={{ fontSize: '14px', marginRight: '4px', fontWeight: 800 }}>b</span> Bing Chat</span>
                    </div>
                  </div>

                  <div className="aeo-split-layout">
                    {/* Left Column — Score + Bars + Chart */}
                    <div className="aeo-left-col">
                      <div className="ai-visibility-bar">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Search Engine Visibility</span><span>{aeoScore}%</span></div>
                        <div className="bar-track"><div className="bar-fill blue-purple" style={{ width: `${aeoScore}%` }}></div></div>
                      </div>

                      <p className="subtitle" style={{ marginBottom: '0.75rem' }}>Mentions across AI tools</p>
                      <div className="ai-grid-bars" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Brand Authority</span><span>{Math.min(100, aeoScore + 5)}%</span></div>
                          <div className="bar-track" style={{ marginBottom: '4px' }}><div className="bar-fill blue" style={{ width: `${Math.min(100, aeoScore + 5)}%` }}></div></div>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tip: Increase high-quality backlinks and digital PR mentions.</p>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Conversational Ranking</span><span>{Math.max(0, aeoScore - 10)}%</span></div>
                          <div className="bar-track" style={{ marginBottom: '4px' }}><div className="bar-fill purple" style={{ width: `${Math.max(0, aeoScore - 10)}%` }}></div></div>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tip: Format content to directly answer common user FAQs.</p>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Topical Relevance</span><span>{aeoScore}%</span></div>
                          <div className="bar-track" style={{ marginBottom: '4px' }}><div className="bar-fill teal" style={{ width: `${aeoScore}%` }}></div></div>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tip: Publish comprehensive deep-dive blog clusters on core services.</p>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>User Intent Match</span><span>{Math.min(100, aeoScore + 2)}%</span></div>
                          <div className="bar-track" style={{ marginBottom: '4px' }}><div className="bar-fill blue-purple" style={{ width: `${Math.min(100, aeoScore + 2)}%` }}></div></div>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tip: Align landing page headlines with exact buyer search terms.</p>
                        </div>
                      </div>

                      <div className="fake-chart" style={{ marginTop: '1rem' }}>
                        <p>AI Traffic Predictions<br /><span style={{ fontSize: '0.65rem' }}>AI Traffic predictions and anatomic predictions</span></p>
                        <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                          <path d="M0,20 Q10,18 20,15 T40,18 T60,10 T80,15 T100,2" fill="url(#ai-grad)" opacity="0.3" />
                          <path d="M0,20 Q10,18 20,15 T40,18 T60,10 T80,15 T100,2" fill="none" stroke="#06b6d4" strokeWidth="1" />
                          <defs><linearGradient id="ai-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
                        </svg>
                      </div>
                    </div>

                    {/* Right Column — Insights & Probe Response */}
                    <div className="aeo-right-col">
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        <h3 style={{ color: '#f97316', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}><span className="icon">👁️</span> Visibility Status</h3>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>{lead.aeo_status}</p>

                        <h3 style={{ color: '#f97316', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}><span className="icon">🚀</span> Improvement Strategy</h3>
                        <p style={{ margin: '0', color: 'var(--text-secondary)' }}>{lead.aeo_improvement}</p>
                      </div>

                      {lead.aeo_probe_response && (
                        <div className="aeo-probe-scroll" style={{ marginTop: '1rem', background: 'rgba(249, 115, 22, 0.05)', borderLeft: '3px solid #f97316', padding: '1rem', borderRadius: '4px 12px 12px 4px', maxHeight: '180px', overflowY: 'auto' }}>
                          <h4 style={{ color: '#f97316', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', marginTop: 0 }}>Raw "ChatGPT" Database Query Response:</h4>
                          <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
                            "{lead.aeo_probe_response}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* 5. AI Outreach Email */}
              <div className="quad-card" id={`lead-${index}-outreach`} style={{ marginTop: '1.5rem', flex: 'none' }}>
                <div className="quad-header" style={{ marginBottom: '1rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail color="var(--accent-color)" size={20} /> Personalized AI Outreach Email
                  </h2>
                  <button className="action-btn" onClick={(e) => {
                    navigator.clipboard.writeText(emailBody);
                    e.currentTarget.innerHTML = '<span style="color:#10b981;display:flex;align-items:center;gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!</span>';
                    setTimeout(() => e.target.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy to Clipboard', 2000);
                  }}>
                    <Copy size={14} /> Copy to Clipboard
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <textarea
                    readOnly
                    className="input-field"
                    style={{ width: '100%', height: '300px', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6', resize: 'vertical' }}
                    value={emailBody}
                  />
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
