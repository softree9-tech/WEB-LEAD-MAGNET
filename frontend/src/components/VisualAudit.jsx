import React, { useState } from 'react';
import { Monitor, Smartphone, Sparkles, AlertCircle, TrendingDown, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import './VisualAudit.css';

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
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6'
};

const VisualAudit = ({ lead }) => {
  const [activeTab, setActiveTab] = useState('desktop');
  const [hoveredPin, setHoveredPin] = useState(null);

  const annotations = lead.visual_annotations || [];
  const croScore = lead.cro_score || 0;

  const renderPins = (isMobile = false) => {
    return annotations.map((ann, index) => {
      const pos = positionMap[ann.position_hint] || positionMap['middle-center'];
      return (
        <div
          key={index}
          className="annotation-pin"
          style={{
            ...pos,
            backgroundColor: severityColors[ann.severity]
          }}
          onMouseEnter={() => setHoveredPin(index)}
          onMouseLeave={() => setHoveredPin(null)}
        >
          {index + 1}
          {hoveredPin === index && (
            <div className="pin-popup">
              <div className="popup-header">
                <span className="section-badge">{ann.section}</span>
                <span className="severity-text" style={{ color: severityColors[ann.severity] }}>
                  {ann.severity.toUpperCase()}
                </span>
              </div>
              <p className="issue-text">{ann.issue}</p>
              <div className="impact-box">
                <TrendingDown size={14} />
                <span>{ann.revenue_impact}</span>
              </div>
              <div className="fix-box">
                <CheckCircle2 size={14} />
                <span>{ann.fix}</span>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="visual-audit-container">
      <div className="audit-header">
        <div className="title-area">
          <h3>Visual Audit & Design Analysis</h3>
          <div className="cro-badge" style={{
            borderColor: croScore > 70 ? '#10b981' : croScore > 40 ? '#f59e0b' : '#ef4444',
            color: croScore > 70 ? '#10b981' : croScore > 40 ? '#f59e0b' : '#ef4444'
          }}>
            CRO Score: {croScore}%
          </div>
        </div>
        <div className="tab-switcher">
          <button
            className={activeTab === 'desktop' ? 'active' : ''}
            onClick={() => setActiveTab('desktop')}
          >
            <Monitor size={16} /> Desktop
          </button>
          <button
            className={activeTab === 'mobile' ? 'active' : ''}
            onClick={() => setActiveTab('mobile')}
          >
            <Smartphone size={16} /> Mobile
          </button>
          <button
            className={activeTab === 'beforeafter' ? 'active' : ''}
            onClick={() => setActiveTab('beforeafter')}
          >
            <Sparkles size={16} /> Before / After
          </button>
        </div>
      </div>

      <div className="audit-content">
        {activeTab === 'desktop' && (
          <div className="screenshot-wrapper desktop">
            {lead.screenshot_desktop ? (
              <>
                <img src={`data:image/jpeg;base64,${lead.screenshot_desktop}`} alt="Desktop Audit" />
                <div className="pins-overlay">{renderPins()}</div>
              </>
            ) : (
              <div className="no-screenshot">No desktop screenshot available</div>
            )}
          </div>
        )}

        {activeTab === 'mobile' && (
          <div className="screenshot-wrapper mobile">
            {lead.screenshot_mobile ? (
              <div className="mobile-frame">
                <img src={`data:image/jpeg;base64,${lead.screenshot_mobile}`} alt="Mobile Audit" />
                <div className="pins-overlay">{renderPins(true)}</div>
              </div>
            ) : (
              <div className="no-screenshot">No mobile screenshot available</div>
            )}
          </div>
        )}

        {activeTab === 'beforeafter' && (
          <div className="before-after-panel">
            <div className="panel current">
              <h4>Current State</h4>
              <div className="screenshot-mini">
                {lead.screenshot_desktop && <img src={`data:image/jpeg;base64,${lead.screenshot_desktop}`} alt="Current" />}
                <div className="overlay-red"></div>
              </div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="panel redesign">
              <h4>After Redesign</h4>
              <div className="redesign-concept">
                <Sparkles className="sparkle-icon" size={24} />
                <p>{lead.before_after_concept || "A modern, high-converting redesign focusing on visual hierarchy and clear CTAs."}</p>
                <ul className="improvement-points">
                  <li><ChevronRight size={14} /> Optimized color palette</li>
                  <li><ChevronRight size={14} /> Strategic CTA placement</li>
                  <li><ChevronRight size={14} /> Enhanced trust signals</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="priority-list-section">
        <h4><AlertCircle size={18} /> What to fix first</h4>
        <div className="priority-grid">
          {annotations.sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3 };
            return order[a.severity] - order[b.severity];
          }).map((ann, index) => (
            <div key={index} className="priority-item">
              <div className="item-header">
                <span className={`sev-tag ${ann.severity}`}>{ann.severity}</span>
                <span className="item-section">{ann.section}</span>
              </div>
              <p className="item-issue">{ann.issue}</p>
              <div className="item-impact">
                <strong>Impact:</strong> {ann.revenue_impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cro-widget">
        <div className="cro-info">
          <div className="cro-label">
            CRO Score <Info size={14} title="Conversion Rate Optimization — how well this site converts visitors to leads" />
          </div>
          <div className="cro-value" style={{ color: croScore > 70 ? '#10b981' : croScore > 40 ? '#f59e0b' : '#ef4444' }}>
            {croScore}/100
          </div>
        </div>
        <div className="cro-bar-track">
          <div className="cro-bar-fill" style={{
            width: `${croScore}%`,
            backgroundColor: croScore > 70 ? '#10b981' : croScore > 40 ? '#f59e0b' : '#ef4444'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default VisualAudit;
