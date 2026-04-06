import { ExternalLink, Zap, LayoutTemplate, MessageSquare, Target, ShieldCheck, Search, FileCode, Smartphone, Lock, XCircle, CheckCircle2, Cpu, Globe, Bot, Clock, Link as LinkIcon } from 'lucide-react';

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
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem', animationDelay: '0.2s' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
        <Target size={22} color="var(--accent-color)" />
        Lead Magnet Reports ({leads.length})
      </h2>
      
      {leads.map((lead, index) => {
        const isHot = lead.final_score >= 7;
        
        return (
          <div key={index} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <a 
                  href={lead.website && lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}
                >
                  {lead.website.replace(/^https?:\/\//i, '')}
                  <ExternalLink size={18} color="var(--text-secondary)" />
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '0.875rem', 
                  fontWeight: '700',
                  color: isHot ? 'var(--error-color)' : 'var(--text-primary)'
                }}>
                  Lead Score: {lead.final_score}/10
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              
              {/* Rebranding Scorecard */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayoutTemplate size={18} /> Rebranding Scorecard (UX)
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visual Design:</span>
                    <strong style={{ fontWeight: '600' }}>{lead.design || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Messaging & Value Prop:</span>
                    <strong style={{ fontWeight: '600' }}>{lead.message || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Call-To-Action (CTA):</span>
                    <strong style={{ fontWeight: '600' }}>{lead.cta || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Trust Signals (Reviews):</span>
                    <strong style={{ fontWeight: '600' }}>{lead.trust || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* SEO Scorecard */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={18} /> Tech & Trust Scorecard
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={14}/> Tech Stack:</span>
                    <strong style={{ fontWeight: '600', color: 'var(--accent-color)' }}>{lead.tech_stack || 'Unknown'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Last Updated:</span>
                    <strong style={{ fontWeight: '600', color: lead.last_modified !== 'Unknown' && !lead.last_modified?.includes('2026') ? 'var(--error-color)' : 'var(--text-primary)' }}>{lead.last_modified || 'Unknown'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><LinkIcon size={14}/> Broken Links (404s):</span>
                    <strong style={{ fontWeight: '600', color: lead.broken_links?.length > 0 ? 'var(--error-color)' : 'var(--success-color)' }}>
                      {lead.broken_links?.length > 0 ? `${lead.broken_links.length} Critical Errors` : '0 Found'}
                    </strong>
                  </div>
                  {lead.broken_links?.length > 0 && (
                    <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Endpoints returning 404/500:</p>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--error-color)', wordBreak: 'break-all' }}>
                        {lead.broken_links.map((link, idx) => (
                           <li key={idx}><a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--error-color)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>{link}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14}/> Google Lighthouse Speed:</span>
                    <strong style={{ fontWeight: '600', color: parseFloat(lead.load_time) > 3 ? 'var(--error-color)' : 'var(--success-color)' }}>
                      {lead.load_time ? `${lead.load_time}s` : 'Unknown'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><FileCode size={14}/> SEO Meta Description:</span>
                    <strong>{lead.seo_meta_desc ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutTemplate size={14}/> Primary H1 Heading:</span>
                    <strong>{lead.seo_h1 ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={14}/> Mobile Optimised (Viewport):</span>
                    <strong>{lead.seo_mobile ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14}/> SSL Security:</span>
                    <strong>{lead.seo_ssl ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}</strong>
                  </div>
                </div>
              </div>

            </div>

             {/* Generated UX Pitch */}
             <div style={{ marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--accent-color)', padding: '1rem 1.25rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)', fontWeight: '700', marginBottom: '0.5rem' }}>
                  The Rebranding Pitch (Visual/UX Penalty)
                </div>
                <div style={{ fontWeight: '500', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  "{lead.rebranding_pitch || 'No pitch generated.'}"
                </div>
              </div>
            </div>

            {/* Search Engine & AI Engine Visibility Dashboard */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>Visibility Analysis</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Google SEO Performance */}
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Globe size={20} /> Google SEO Score
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: lead.seo_score < 50 ? 'var(--error-color)' : lead.seo_score < 75 ? 'var(--warning-color, #fbbf24)' : '#10b981', lineHeight: '1' }}>{lead.seo_score || 0}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' }}>/100</span>
                  </div>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
                  {lead.seo_status || 'Google visibility analysis unavailable.'}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#10b981', fontWeight: '700', marginBottom: '0.35rem' }}>Improvement Strategy</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', display: 'block' }}>{lead.seo_improvement || 'N/A'}</span>
                </div>
              </div>

              {/* AI AEO Performance */}
              <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Bot size={20} /> AI Search Visibility (AEO)
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: lead.aeo_score < 50 ? 'var(--error-color)' : lead.aeo_score < 75 ? 'var(--warning-color, #fbbf24)' : '#10b981', lineHeight: '1' }}>{lead.aeo_score || 0}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' }}>/100</span>
                  </div>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
                  {lead.aeo_status || 'AI engine analysis unavailable.'}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#8b5cf6', fontWeight: '700', marginBottom: '0.35rem' }}>AEO Action Plan</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', display: 'block' }}>{lead.aeo_improvement || 'N/A'}</span>
                </div>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}
