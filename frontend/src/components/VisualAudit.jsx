import React, { useState } from 'react';
import { Monitor, Smartphone, Sparkles, AlertCircle, TrendingDown, CheckCircle2, ChevronRight, Info } from 'lucide-react';

const positionMap = {
  'top-left': { top: '10%', left: '10%' },
  'top-center': { top: '10%', left: '50%' },
  'top-right': { top: '10%', left: '85%' },
  'middle-left': { top: '45%', left: '10%' },
  'middle-center': { top: '45%', left: '50%' },
  'middle-right': { top: '45%', left: '85%' },
  'bottom-left': { top: '80%', left: '10%' },
  'bottom-center': { top: '80%', left: '50%' },
  'bottom-right': { top: '80%', left: '85%' }
};

const severityColors = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'primary'
};

const VisualAudit = ({ lead }) => {
  const [activeTab, setActiveTab] = useState('desktop');
  const [hoveredPin, setHoveredPin] = useState(null);

  const annotations = lead.visual_annotations || [];
  const croScore = lead.cro_score || 0;

  const renderPins = () => {
    return annotations.map((ann, index) => {
      const pos = positionMap[ann.position_hint] || positionMap['middle-center'];
      const sev = severityColors[ann.severity] || 'secondary';
      return (
        <div
          key={index}
          className={`position-absolute d-flex align-items-center justify-content-center rounded-circle border border-white shadow-sm cursor-pointer bg-${sev} text-white`}
          style={{
            ...pos,
            width: '24px',
            height: '24px',
            zIndex: 10,
            fontSize: '12px',
            fontWeight: 'bold'
          }}
          onMouseEnter={() => setHoveredPin(index)}
          onMouseLeave={() => setHoveredPin(null)}
        >
          {index + 1}
          {hoveredPin === index && (
            <div className="card position-absolute shadow-lg border-0" style={{ bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '250px', zIndex: 20 }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge bg-label-${sev} small`}>{ann.section}</span>
                  <small className={`text-${sev} fw-bold`}>{ann.severity.toUpperCase()}</small>
                </div>
                <p className="card-text small mb-2">{ann.issue}</p>
                <div className="d-flex align-items-center gap-1 text-danger small mb-1">
                  <TrendingDown size={12} />
                  <span>Impact: {ann.revenue_impact}</span>
                </div>
                <div className="d-flex align-items-center gap-1 text-success small">
                  <CheckCircle2 size={12} />
                  <span>Fix: {ann.fix}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="card shadow-none border mt-4">
      <div className="card-header border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">Visual Audit & Design Concept</h6>
          <span className={`badge bg-label-${croScore > 70 ? 'success' : croScore > 40 ? 'warning' : 'danger'}`}>
            CRO Score: {croScore}%
          </span>
        </div>
      </div>
      <div className="card-body p-0">
        <ul className="nav nav-tabs nav-fill" role="tablist">
          <li className="nav-item">
            <button className={`nav-link py-3 ${activeTab === 'desktop' ? 'active' : ''}`} onClick={() => setActiveTab('desktop')}>
              <Monitor size={16} className="me-2" /> Desktop
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link py-3 ${activeTab === 'mobile' ? 'active' : ''}`} onClick={() => setActiveTab('mobile')}>
              <Smartphone size={16} className="me-2" /> Mobile
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link py-3 ${activeTab === 'beforeafter' ? 'active' : ''}`} onClick={() => setActiveTab('beforeafter')}>
              <Sparkles size={16} className="me-2" /> Design Concept
            </button>
          </li>
        </ul>

        <div className="tab-content p-4">
          {(activeTab === 'desktop' || activeTab === 'mobile') && (
            <div className="position-relative bg-light rounded overflow-hidden" style={{ minHeight: '400px' }}>
              {activeTab === 'desktop' ? (
                lead.screenshot_desktop ? (
                  <>
                    <img src={`data:image/jpeg;base64,${lead.screenshot_desktop}`} className="img-fluid" alt="Desktop Audit" />
                    {renderPins()}
                  </>
                ) : <div className="p-5 text-center text-muted">No desktop screenshot available</div>
              ) : (
                lead.screenshot_mobile ? (
                  <div className="text-center">
                    <div className="d-inline-block position-relative shadow" style={{ width: '375px', border: '10px solid #222', borderRadius: '30px' }}>
                      <img src={`data:image/jpeg;base64,${lead.screenshot_mobile}`} className="img-fluid rounded-top" alt="Mobile Audit" />
                      {renderPins()}
                    </div>
                  </div>
                ) : <div className="p-5 text-center text-muted">No mobile screenshot available</div>
              )}
            </div>
          )}

          {activeTab === 'beforeafter' && (
            <div className="row g-4 align-items-center">
              <div className="col-md-5">
                <div className="position-relative rounded overflow-hidden shadow-sm border border-danger">
                  {lead.screenshot_desktop && <img src={`data:image/jpeg;base64,${lead.screenshot_desktop}`} className="img-fluid opacity-50" alt="Current" />}
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <span className="badge bg-danger">CURRENT STATE</span>
                  </div>
                </div>
              </div>
              <div className="col-md-2 text-center h4 text-muted mb-0">VS</div>
              <div className="col-md-5">
                <div className="card bg-label-primary border-0 shadow-none h-100">
                  <div className="card-body">
                    <h5 className="card-title text-primary mb-3">Redesign Concept</h5>
                    <p className="card-text small mb-4">{lead.before_after_concept || "AI-powered professional redesign concept to boost conversions."}</p>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex align-items-center gap-2 small">
                        <CheckCircle2 size={14} className="text-success" /> Optimized visual hierarchy
                      </div>
                      <div className="d-flex align-items-center gap-2 small">
                        <CheckCircle2 size={14} className="text-success" /> strategic CTA placement
                      </div>
                      <div className="d-flex align-items-center gap-2 small">
                        <CheckCircle2 size={14} className="text-success" /> Enhanced trust signals
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer bg-light p-4">
        <h6 className="mb-3 d-flex align-items-center gap-2">
          <AlertCircle size={18} className="text-warning" /> High Priority Fixes
        </h6>
        <div className="row g-3">
          {annotations.slice(0, 3).map((ann, index) => (
            <div key={index} className="col-md-4">
              <div className="bg-white p-3 rounded border h-100 shadow-none">
                <div className="d-flex justify-content-between mb-2">
                  <span className="badge bg-label-secondary x-small">{ann.section}</span>
                  <span className={`text-${severityColors[ann.severity]} x-small fw-bold`}>{ann.severity.toUpperCase()}</span>
                </div>
                <p className="mb-0 x-small fw-semibold">{ann.issue}</p>
                <div className="mt-2 text-danger x-small fw-bold">{ann.revenue_impact} lost</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualAudit;
