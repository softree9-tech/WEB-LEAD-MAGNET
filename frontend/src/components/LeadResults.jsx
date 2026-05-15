import React, { useState } from 'react';
import {
  ExternalLink, RefreshCw, Download, Monitor, Mail, Lock,
  FileCode, Check, X, Search, Activity, BarChart3, Settings,
  LogOut, LayoutDashboard, FileText, Bot, Target, Smartphone,
  Copy, ChevronDown, ChevronUp, Flame, Info
} from 'lucide-react';
import VisualAudit from './VisualAudit';
import RevenueLeak from './RevenueLeak';
import FirstImpression from './FirstImpression';
import SiteDecay from './SiteDecay';
import AEOFearPanel from './AEOFearPanel';

export default function LeadResults({ leads }) {
  const [expandedLeads, setExpandedLeads] = useState({});
  const [sortBy, setSortBy] = useState('none');
  const [filterHotOnly, setFilterHotOnly] = useState(false);
  const [searchTerm, setSearchByDomain] = useState('');

  const toggleExpand = (website) => {
    setExpandedLeads(prev => ({
      ...prev,
      [website]: !prev[website]
    }));
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="card shadow-none bg-transparent border border-dashed border-2">
        <div className="card-body text-center py-5">
          <div className="avatar avatar-lg bg-label-secondary mb-3 mx-auto">
            <span className="avatar-initial rounded-circle"><LayoutDashboard size={32} /></span>
          </div>
          <h5 className="mb-2">No websites analyzed yet</h5>
          <p className="text-muted">Enter a URL above to generate a professional sales audit.</p>
        </div>
      </div>
    );
  }

  const filteredLeads = leads
    .filter(lead => {
      if (filterHotOnly && parseInt(lead.final_score) < 7) return false;
      if (searchTerm && !lead.website.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return parseInt(b.final_score) - parseInt(a.final_score);
      if (sortBy === 'seo') return parseInt(b.seo_score) - parseInt(a.seo_score);
      if (sortBy === 'aeo') return parseInt(b.aeo_score) - parseInt(a.aeo_score);
      return 0;
    });

  return (
    <div className="row g-4">
      {/* Search and Filters Card */}
      <div className="col-12">
        <div className="card">
          <div className="card-body d-flex flex-wrap align-items-center gap-3">
            <div className="flex-grow-1">
              <div className="input-group input-group-merge">
                <span className="input-group-text"><Search size={18} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search analyzed domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchByDomain(e.target.value)}
                />
              </div>
            </div>

            <select
              className="form-select w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="none">Sort by: Default</option>
              <option value="score">Hotness Score</option>
              <option value="seo">SEO Score</option>
              <option value="aeo">AEO Score</option>
            </select>

            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="hotLeadsSwitch"
                checked={filterHotOnly}
                onChange={(e) => setFilterHotOnly(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="hotLeadsSwitch">Hot Leads Only</label>
            </div>

            <div className="ms-auto text-muted small">
              {filteredLeads.length} leads found
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      {filteredLeads.length > 1 && (
        <div className="col-12">
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => {
              const csvHeader = 'Website,Company Name,SEO Score,Mobile UX,Load Time,Tech Stack,Lead Score,Pitch\n';
              const csvRows = filteredLeads.map(lead => {
                const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
                return [
                  escapeCSV(lead.website),
                  escapeCSV(lead.website.replace(/^https?:\/\//i, '')),
                  lead.seo_score,
                  lead.mobile_performance,
                  lead.load_time,
                  escapeCSV(lead.tech_stack),
                  lead.final_score,
                  escapeCSV(lead.rebranding_pitch)
                ].join(',');
              }).join('\n');
              const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `apollo_export_${new Date().getTime()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download size={14} className="me-1" /> Apollo Export
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => {
              const csvHeader = 'domain,company_name,score,seo_status,aeo_response,tech_stack,broken_links_count\n';
              const csvRows = filteredLeads.map(lead => {
                const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
                return [
                  escapeCSV(lead.website),
                  escapeCSV(lead.website.replace(/^https?:\/\//i, '')),
                  lead.final_score,
                  escapeCSV(lead.seo_status),
                  escapeCSV(lead.aeo_probe_response),
                  escapeCSV(lead.tech_stack),
                  lead.broken_links?.length || 0
                ].join(',');
              }).join('\n');
              const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `clay_export_${new Date().getTime()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download size={14} className="me-1" /> Clay Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => {
              const csvHeader = 'website,final_score,design,cta,message,trust,speed,rebranding_pitch,trust_warnings,seo_issues,aeo_quote,emailfullbody\n';
              const csvRows = filteredLeads.map(lead => {
                const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
                return [
                  escapeCSV(lead.website),
                  lead.final_score,
                  escapeCSV(lead.design),
                  escapeCSV(lead.cta),
                  escapeCSV(lead.message),
                  escapeCSV(lead.trust),
                  escapeCSV(lead.speed),
                  escapeCSV(lead.rebranding_pitch),
                  "", // trust warnings
                  "", // seo issues
                  escapeCSV(lead.aeo_probe_response),
                  escapeCSV(lead.email_body)
                ].join(',');
              }).join('\n');
              const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `master_export_${new Date().getTime()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}>
              <Download size={14} className="me-1" /> Master CSV Export
            </button>
          </div>
        </div>
      )}

      {/* Lead Cards */}
      {filteredLeads.map((lead, index) => {
        const seoScore = parseInt(lead.seo_score || 0);
        const aeoScore = parseInt(lead.aeo_score || 0);
        const isExpanded = expandedLeads[lead.website] || false;

        return (
          <div key={lead.website} className="col-12">
            <div className={`card ${isExpanded ? 'border-primary shadow' : ''}`}>
              <div className="card-header d-flex justify-content-between align-items-center p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className={`avatar avatar-md ${parseInt(lead.final_score) >= 7 ? 'bg-label-danger' : 'bg-label-primary'}`}>
                    <span className="avatar-initial rounded">
                      {parseInt(lead.final_score) >= 7 ? <Flame size={24} /> : <Target size={24} />}
                    </span>
                  </div>
                  <div>
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                      {lead.website.replace(/^https?:\/\//i, '')}
                      {parseInt(lead.final_score) >= 7 && (
                        <span className="badge bg-danger animate-pulse">🔥 HOT LEAD</span>
                      )}
                    </h5>
                    <small className="text-muted">Analyzed on {new Date().toLocaleDateString()}</small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-icon btn-label-secondary" onClick={() => toggleExpand(lead.website)}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={() => {/* Export logic */}}>
                    <Download size={14} className="me-1" /> Export CSV
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="card-body p-4 border-top">
                  <div className="row g-4">
                    {/* Feature Panels */}
                    {lead.revenue_leak && <div className="col-12"><RevenueLeak lead={lead} /></div>}
                    {lead.first_impression && <div className="col-md-6"><FirstImpression lead={lead} /></div>}
                    {lead.site_age && <div className="col-md-6"><SiteDecay lead={lead} /></div>}

                    {/* Main Metrics Row */}
                    <div className="col-md-4">
                      <div className="card h-100 shadow-none border bg-light bg-opacity-10">
                        <div className="card-body">
                          <h6 className="card-title text-uppercase text-muted small mb-4">UX & Rebranding</h6>
                          <div className="d-flex align-items-center gap-3 mb-4">
                            <h2 className="mb-0">{lead.ux_score || 85}</h2>
                            <div className="flex-grow-1">
                              <div className="progress" style={{height: '8px'}}>
                                <div className="progress-bar bg-info" style={{width: `${lead.ux_score || 85}%`}}></div>
                              </div>
                            </div>
                          </div>
                          <ul className="list-unstyled mb-0">
                            <li className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">Design</span>
                              <span className="badge bg-label-primary">{lead.design}</span>
                            </li>
                            <li className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">Mobile UX</span>
                              <span className={`badge ${lead.seo_mobile ? 'bg-label-success' : 'bg-label-danger'}`}>
                                {lead.seo_mobile ? 'Optimized' : 'Failing'}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card h-100 shadow-none border bg-light bg-opacity-10">
                        <div className="card-body">
                          <h6 className="card-title text-uppercase text-muted small mb-4">Google SEO</h6>
                          <div className="d-flex align-items-center gap-3 mb-4">
                            <h2 className="mb-0">{seoScore}</h2>
                            <div className="flex-grow-1">
                              <div className="progress" style={{height: '8px'}}>
                                <div className="progress-bar bg-success" style={{width: `${seoScore}%`}}></div>
                              </div>
                            </div>
                          </div>
                          <ul className="list-unstyled mb-0">
                            <li className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">Perf</span>
                              <span className="fw-semibold">{lead.lighthouse_performance || 50}%</span>
                            </li>
                            <li className="d-flex justify-content-between">
                              <span className="text-muted small">Load Time</span>
                              <span className={`fw-semibold ${parseFloat(lead.load_time) > 3 ? 'text-danger' : 'text-success'}`}>{lead.load_time}s</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="card h-100 shadow-none border bg-light bg-opacity-10">
                        <div className="card-body">
                          <h6 className="card-title text-uppercase text-muted small mb-4">AI Search Visibility</h6>
                          <div className="d-flex align-items-center gap-3 mb-4">
                            <h2 className="mb-0">{aeoScore}</h2>
                            <div className="flex-grow-1">
                              <div className="progress" style={{height: '8px'}}>
                                <div className="progress-bar bg-warning" style={{width: `${aeoScore}%`}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex gap-1 mb-0 flex-wrap">
                            <span className="badge bg-label-secondary small">ChatGPT</span>
                            <span className="badge bg-label-secondary small">Gemini</span>
                            <span className="badge bg-label-secondary small">Bing Chat</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Audit */}
                    <div className="col-12">
                      <VisualAudit lead={lead} />
                    </div>

                    {/* AI Outreach Email */}
                    <div className="col-12">
                      <div className="card bg-label-primary border-0 shadow-none">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 text-primary">AI Sales Pitch & Outreach</h5>
                            <button className="btn btn-primary btn-sm" onClick={() => {/* copy */}}>
                              <Copy size={14} className="me-1" /> Copy Pitch
                            </button>
                          </div>
                          <div className="bg-white p-3 rounded border border-primary border-opacity-25" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#566a7f' }}>
                            {lead.email_body || "Generating pitch..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
