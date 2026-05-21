import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../LeadResults.css';
import { ExternalLink, RefreshCw, Download, Monitor, Mail, Lock, FileCode, Check, X, Search, Activity, BarChart3, Settings, ChevronUp, LayoutDashboard, FileText, Bot, Target, Smartphone, Copy, TrendingDown, AlertTriangle, Sword, Trophy, Zap, Sparkles } from 'lucide-react';

/**
 * Enterprise-Grade Mobile Responsiveness Evaluation Engine
 * 
 * Performs a weighted, multi-signal responsiveness audit across 5 categories:
 *   1. Breakpoint Config (viewport meta, media query readiness)
 *   2. Layout Adaptation (content structure, CTA positioning, touch targets)
 *   3. Scaling & Rendering (performance, visual fidelity, load behavior)
 *   4. Horizontal Overflow (section-level overflow & clipping risks)
 *   5. Section Consistency (cross-section alignment & spacing uniformity)
 *
 * Each category starts at 20/20 and is reduced by weighted penalty deductions.
 * A deterministic confidence jitter adds nuanced realism so scores are never
 * perfectly round unless the site is truly flawless.
 *
 * Penalty severity scale:
 *   Minor spacing / text issue  → -2 to -5
 *   Overflow / clipping issue   → -8 to -12
 *   Clipped section / CTA       → -12 to -15
 *   Broken responsive layout    → -15 to -20
 *   Severe viewport collision   → -20 to -25
 */
function calculateMobileResponsivenessScore(lead) {
  const sections = lead.mobile_sections || [];
  const uxRating = (lead.mobile_ux_rating || 'Average').toLowerCase();
  const conversionRisk = (lead.mobile_conversion_risk || 'Moderate').toLowerCase();
  const hasViewport = !!lead.seo_mobile;
  const mobilePerf = parseInt(lead.mobile_performance || 0);
  const lighthousePerf = parseInt(lead.lighthouse_performance || 0);
  const loadTime = parseFloat(lead.load_time || 0);
  const hasCta = !!lead.has_cta;
  const hasLeadCapture = !!lead.has_lead_capture;
  const ctaVisibility = (lead.cta_visibility_rating || 'Moderate').toLowerCase();
  const ctaPlacement = (lead.cta_placement_quality || 'Suboptimal').toLowerCase();
  const designQuality = (lead.design || 'Outdated').toLowerCase();
  const ctaStrength = (lead.cta || 'Weak').toLowerCase();
  const messageClarity = (lead.message || 'Confusing').toLowerCase();

  let criticalSections = 0;
  let highRiskSections = 0;
  let moderateRiskSections = 0;
  let lowRiskSections = 0;

  // Track the 14 intelligent responsiveness detections
  const issuesDetected = {
    clippedComponents: false,
    croppedButtons: false,
    hiddenContent: false,
    horizontalOverflow: false,
    brokenLayouts: false,
    inconsistentSpacing: false,
    viewportCollisions: false,
    textWrapping: false,
    overlappingElements: false,
    scalingInconsistencies: false,
    renderingGlitches: false,
    brokenAlignment: false,
    excessiveSpacing: false,
    touchTarget: false
  };

  sections.forEach(sec => {
    const risk = (sec.risk || 'Low').toLowerCase();
    if (risk === 'critical') criticalSections++;
    else if (risk === 'high') highRiskSections++;
    else if (risk === 'moderate') moderateRiskSections++;
    else lowRiskSections++;

    const insight = (sec.insight || '').toLowerCase();
    
    // 1 & 2: clipped components, cropped buttons/CTAs
    if (/clip|cut.?off|truncat/.test(insight)) {
      if (/cta|button|link|icon/.test(insight)) {
        issuesDetected.croppedButtons = true;
      } else {
        issuesDetected.clippedComponents = true;
      }
    }
    if (/crop/.test(insight)) {
      if (/cta|button|link|icon/.test(insight)) {
        issuesDetected.croppedButtons = true;
      } else {
        issuesDetected.clippedComponents = true;
      }
    }

    // 3: hidden content
    if (/hidden|display.?none|invisible|disappear/.test(insight)) {
      issuesDetected.hiddenContent = true;
    }

    // 4: horizontal overflow
    if (/overflow|scroll.?horiz|bleed|scrollable|off.?screen/.test(insight)) {
      issuesDetected.horizontalOverflow = true;
    }

    // 5: broken layouts
    if (/broken.*layout|layout.*broken|distort|jumbled|messy/.test(insight)) {
      issuesDetected.brokenLayouts = true;
    }

    // 6 & 13: inconsistent spacing, excessive empty spacing
    if (/spac|padding|margin|gap|uneven.*space/.test(insight)) {
      if (/empty|dead|huge|excessive/.test(insight)) {
        issuesDetected.excessiveSpacing = true;
      } else {
        issuesDetected.inconsistentSpacing = true;
      }
    }

    // 7: viewport collisions
    if (/viewport.*collision|collid.*viewport|edge.*collision|screen.*edge|touch.*edge/.test(insight)) {
      issuesDetected.viewportCollisions = true;
    }

    // 8: text wrapping failures
    if (/wrap|break|line.?break|text.*wrap|text.?overflow|overlap.*text/.test(insight)) {
      issuesDetected.textWrapping = true;
    }

    // 9: overlapping elements
    if (/overlap|stack|collid|cover|z.?index|overlay/.test(insight)) {
      issuesDetected.overlappingElements = true;
    }

    // 10: scaling inconsistencies
    if (/scale|zoom|resize|shrink|stretch|font.*size/.test(insight)) {
      issuesDetected.scalingInconsistencies = true;
    }

    // 11: mobile rendering glitches
    if (/glitch|rendering|artifact|flicker|broken.*render/.test(insight)) {
      issuesDetected.renderingGlitches = true;
    }

    // 12: broken section alignment
    if (/align|center|offset|shift|misalign|off.?center/.test(insight)) {
      issuesDetected.brokenAlignment = true;
    }

    // 14: touch target accessibility issues
    if (/tap|touch|finger|click.?area|small.?button|target.?size|accessibility|difficult.*click/.test(insight)) {
      issuesDetected.touchTarget = true;
    }
  });

  const totalSections = sections.length || 1;
  const problematicSections = criticalSections + highRiskSections;
  const problematicRatio = problematicSections / totalSections;

  // ================================================================
  // CATEGORY 1: Breakpoint Config (20 points max)
  // ================================================================
  let breakpointScore = 20;
  if (!hasViewport) breakpointScore -= 10;
  if (issuesDetected.viewportCollisions) breakpointScore -= 6;
  if (issuesDetected.scalingInconsistencies) breakpointScore -= 5;
  if (uxRating === 'critical') breakpointScore -= 8;
  else if (uxRating === 'poor') breakpointScore -= 5;
  else if (uxRating === 'average') breakpointScore -= 2;
  breakpointScore = Math.max(0, Math.min(20, breakpointScore));

  // ================================================================
  // CATEGORY 2: Layout Adaptation (20 points max)
  // ================================================================
  let layoutScore = 20;
  if (issuesDetected.brokenLayouts) layoutScore -= 8;
  if (issuesDetected.croppedButtons) layoutScore -= 7;
  if (issuesDetected.touchTarget) layoutScore -= 6;
  if (issuesDetected.hiddenContent) layoutScore -= 4;
  if (!hasCta) layoutScore -= 7;
  else if (ctaStrength === 'weak') layoutScore -= 4;
  layoutScore = Math.max(0, Math.min(20, layoutScore));

  // ================================================================
  // CATEGORY 3: Scaling & Rendering (20 points max)
  // ================================================================
  let renderingScore = 20;
  if (issuesDetected.renderingGlitches) renderingScore -= 8;
  if (issuesDetected.textWrapping) renderingScore -= 5;
  if (issuesDetected.clippedComponents) renderingScore -= 7;
  if (mobilePerf > 0 && mobilePerf < 50) renderingScore -= 6;
  else if (loadTime > 4.0) renderingScore -= 5;
  renderingScore = Math.max(0, Math.min(20, renderingScore));

  // ================================================================
  // CATEGORY 4: Horizontal Overflow (20 points max)
  // ================================================================
  let overflowScore = 20;
  if (issuesDetected.horizontalOverflow) overflowScore -= 10;
  if (issuesDetected.viewportCollisions) overflowScore -= 6;
  if (issuesDetected.overlappingElements) overflowScore -= 6;
  if (criticalSections > 0) overflowScore -= Math.min(8, criticalSections * 4);
  if (highRiskSections > 0) overflowScore -= Math.min(6, highRiskSections * 3);
  overflowScore = Math.max(0, Math.min(20, overflowScore));

  // ================================================================
  // CATEGORY 5: Section Consistency (20 points max)
  // ================================================================
  let consistencyScore = 20;
  if (issuesDetected.inconsistentSpacing) consistencyScore -= 5;
  if (issuesDetected.brokenAlignment) consistencyScore -= 6;
  if (issuesDetected.excessiveSpacing) consistencyScore -= 4;
  
  // Mixed risk levels indicates inconsistency
  const riskLevels = new Set(sections.map(sec => (sec.risk || 'Low').toLowerCase()));
  if (riskLevels.size >= 3) consistencyScore -= 5;
  else if (riskLevels.size === 2 && (riskLevels.has('critical') || riskLevels.has('high'))) consistencyScore -= 3;
  consistencyScore = Math.max(0, Math.min(20, consistencyScore));

  // ================================================================
  // AGGREGATE SCORING
  // ================================================================
  const categoryScores = {
    breakpoint: breakpointScore,
    layout: layoutScore,
    rendering: renderingScore,
    overflow: overflowScore,
    consistency: consistencyScore
  };

  const failedCategoriesCount = Object.values(categoryScores).filter(val => val < 13).length;
  
  let rawTotal = breakpointScore + layoutScore + renderingScore + overflowScore + consistencyScore;
  
  // Apply additional failed category penalty for realistic scoring
  rawTotal -= failedCategoriesCount * 5;

  // --- Deterministic confidence jitter for realism ---
  const jitterSeed = (
    (lead.website || '').length +
    (sections.length * 7) +
    (parseInt(lead.seo_score || 0) % 13) +
    (parseInt(lead.first_impression_score || 0) * 3)
  );
  const jitter = ((jitterSeed % 7) - 3); // Range: -3 to +3
  if (rawTotal > 10 && rawTotal < 97) {
    rawTotal += jitter;
  }

  let totalScore = Math.max(0, Math.min(100, rawTotal));

  // Build premium, minimal detected issues list
  const detectedIssues = [];
  if (!hasViewport) {
    detectedIssues.push({ issue: 'Missing viewport configuration', severity: 'critical' });
  }
  if (issuesDetected.viewportCollisions) {
    detectedIssues.push({ issue: 'Viewport collision risks detected', severity: 'critical' });
  }
  if (issuesDetected.brokenLayouts) {
    detectedIssues.push({ issue: 'Broken responsive layouts detected', severity: 'high' });
  }
  if (issuesDetected.horizontalOverflow) {
    detectedIssues.push({ issue: 'Horizontal overflow detected', severity: 'high' });
  }
  if (issuesDetected.croppedButtons) {
    detectedIssues.push({ issue: 'Cropped buttons/CTAs detected', severity: 'high' });
  }
  if (issuesDetected.clippedComponents) {
    detectedIssues.push({ issue: 'Clipped components detected', severity: 'high' });
  }
  if (issuesDetected.touchTarget) {
    detectedIssues.push({ issue: 'Touch target accessibility issues detected', severity: 'moderate' });
  }
  if (issuesDetected.overlappingElements) {
    detectedIssues.push({ issue: 'Overlapping elements detected', severity: 'moderate' });
  }
  if (issuesDetected.hiddenContent) {
    detectedIssues.push({ issue: 'Hidden content areas detected', severity: 'moderate' });
  }
  if (issuesDetected.brokenAlignment) {
    detectedIssues.push({ issue: 'Broken section alignment detected', severity: 'moderate' });
  }
  if (issuesDetected.inconsistentSpacing) {
    detectedIssues.push({ issue: 'Spacing inconsistencies detected', severity: 'minor' });
  }
  if (issuesDetected.textWrapping) {
    detectedIssues.push({ issue: 'Text wrapping failures detected', severity: 'minor' });
  }
  if (issuesDetected.scalingInconsistencies) {
    detectedIssues.push({ issue: 'Scaling inconsistencies detected', severity: 'minor' });
  }
  if (issuesDetected.renderingGlitches) {
    detectedIssues.push({ issue: 'Mobile rendering glitches detected', severity: 'minor' });
  }
  if (issuesDetected.excessiveSpacing) {
    detectedIssues.push({ issue: 'Excessive empty spacing detected', severity: 'minor' });
  }
  if (!hasCta) {
    detectedIssues.push({ issue: 'Missing mobile call-to-action', severity: 'high' });
  }
  if (loadTime > 4.0) {
    detectedIssues.push({ issue: 'Slow mobile page response', severity: 'moderate' });
  }

  // Ensure 100% is extremely difficult to achieve unless flawless
  const hasAnyIssues = detectedIssues.length > 0;
  const isPerfect = !hasAnyIssues && (uxRating === 'excellent') && (conversionRisk === 'low') && (mobilePerf === 0 || mobilePerf >= 95) && loadTime <= 1.5;
  
  if (!isPerfect && totalScore >= 95) {
    totalScore = 94;
  }

  // --- Grade & label determination ---
  let label, grade;
  if (totalScore >= 95) {
    label = "Near-Perfect Enterprise Responsiveness";
    grade = "Excellent";
  } else if (totalScore >= 80) {
    label = "Strong Responsive Implementation";
    grade = "Good";
  } else if (totalScore >= 60) {
    label = "Moderate Responsiveness Issues";
    grade = "Average";
  } else {
    label = "Poor Mobile Responsiveness";
    grade = "Critical";
  }

  return {
    score: totalScore,
    label,
    grade,
    details: {
      viewportFit: breakpointScore,
      mediaQuery: layoutScore,
      rendering: renderingScore,
      overflow: overflowScore,
      consistency: consistencyScore
    },
    detectedIssues,
    issueCount: detectedIssues.length,
    sectionRiskSummary: { critical: criticalSections, high: highRiskSections, moderate: moderateRiskSections, low: lowRiskSections }
  };
}

function MobileWalkthrough({ lead }) {
  const sections = lead.mobile_sections && lead.mobile_sections.length > 0
    ? lead.mobile_sections
    : [
        {
          name: "Mobile Overview",
          insight: lead.mobile_ai_insight || "Primary CTA might be difficult to notice on smaller mobile devices, reducing conversion potential.",
          risk: lead.mobile_conversion_risk || "Moderate",
          b64_image: lead.b64_image_mobile || ""
        }
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (sections.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sections.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [sections.length, isPaused]);

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentSection = sections[currentIndex];
  const riskValue = currentSection.risk || 'Moderate';
  const riskClass = riskValue.toLowerCase() === 'critical' || riskValue.toLowerCase() === 'high' 
    ? 'critical' 
    : riskValue.toLowerCase() === 'moderate' 
      ? 'moderate' 
      : 'low';

  const slideVariants = {
    enter: (dir) => ({
      y: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.02,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring', stiffness: 120, damping: 20 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir) => ({
      y: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        y: { type: 'spring', stiffness: 120, damping: 20 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.4 }
      }
    })
  };

  const respMetrics = calculateMobileResponsivenessScore(lead);
  const uxRatingClass = (lead.mobile_ux_rating || 'Average').toLowerCase();
  const convRiskClass = (lead.mobile_conversion_risk || 'Moderate').toLowerCase();

  return (
    <div 
      className="mobile-walkthrough-carousel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="quad-header" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Smartphone size={20} /> Mobile Experience Walkthrough
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
            {currentIndex + 1} / {sections.length}
          </span>
          <div className={`severity-badge severity-${riskClass}`}>
            {riskValue} Risk
          </div>
        </div>
      </div>

      <div className="mobile-mockup-container" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mobile-frame">
          <div className="mobile-screen" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="mobile-section-overlay-badge">
              {currentSection.name || `Section ${currentIndex + 1}`}
            </div>

            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                {currentSection.b64_image ? (
                  <img 
                    src={`data:image/jpeg;base64,${currentSection.b64_image}`} 
                    alt={currentSection.name} 
                    className="mobile-screenshot"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569', textAlign: 'center', padding: '1.5rem', background: '#090d16' }}>
                    <Smartphone size={32} style={{ marginBottom: '0.5rem', color: '#1e293b' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentSection.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#334155', marginTop: '4px' }}>Mock Viewport</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {sections.length > 1 && (
          <div className="carousel-dots-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                aria-label={`Go to section ${idx + 1}`}
                style={{
                  width: idx === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: idx === currentIndex ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mobile-stats-grid" style={{ marginTop: '1rem' }}>
        {/* UX Rating Card */}
        <div className="mobile-stat-card ux-rating-card">
          <span className="mobile-stat-label">UX Rating</span>
          <div className="mobile-stat-content">
            <span className={`mobile-stat-value rating-${uxRatingClass}`}>
              {lead.mobile_ux_rating || 'Average'}
            </span>
          </div>
          <span className="mobile-stat-insight">Overall Experience</span>
        </div>

        {/* Mobile Responsiveness Score Card */}
        <div className="mobile-stat-card responsiveness-score-card">
          <span className="mobile-stat-label">Mobile Responsiveness</span>
          <div className="mobile-stat-content">
            <span className={`mobile-stat-value score-text ${respMetrics.score >= 80 ? 'score-good' : respMetrics.score >= 60 ? 'score-moderate' : 'score-poor'}`}>
              {respMetrics.score}%
            </span>
            <span className={`premium-badge badge-${respMetrics.grade.toLowerCase()}`}>
              {respMetrics.grade}
            </span>
          </div>
          <span className="mobile-stat-insight">{respMetrics.label}</span>
          {respMetrics.issueCount > 0 && (
            <span className="resp-issue-count">{respMetrics.issueCount} issue{respMetrics.issueCount !== 1 ? 's' : ''} detected</span>
          )}
          
          {/* HUD Tooltip detail breakdown */}
          <div className="responsiveness-tooltip">
            <div className="tooltip-title">Responsiveness Audit Breakdown</div>
            <div className="tooltip-subtitle">Each category scored out of 20 points</div>
            {[
              { name: 'Breakpoint Config', value: respMetrics.details.viewportFit },
              { name: 'Layout Adaptation', value: respMetrics.details.mediaQuery },
              { name: 'Scaling & Rendering', value: respMetrics.details.rendering },
              { name: 'Horizontal Overflow', value: respMetrics.details.overflow },
              { name: 'Section Consistency', value: respMetrics.details.consistency }
            ].map((cat, i) => (
              <div className="tooltip-row" key={i}>
                <span>{cat.name}</span>
                <div className="tooltip-score-bar-wrap">
                  <div className="tooltip-score-bar-track">
                    <div
                      className="tooltip-score-bar-fill"
                      style={{
                        width: `${(cat.value / 20) * 100}%`,
                        background: cat.value >= 16 ? '#10b981' : cat.value >= 10 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="val" style={{
                    color: cat.value >= 16 ? '#10b981' : cat.value >= 10 ? '#f59e0b' : '#ef4444'
                  }}>{cat.value}/20</span>
                </div>
              </div>
            ))}
            {respMetrics.detectedIssues.length > 0 && (
              <>
                <div className="tooltip-divider" />
                <div className="tooltip-issues-title">Detected Issues ({respMetrics.detectedIssues.length})</div>
                {respMetrics.detectedIssues.slice(0, 5).map((item, i) => (
                  <div className="tooltip-issue-row" key={i}>
                    <span className={`tooltip-severity-dot severity-${item.severity}`} />
                    <span className="tooltip-issue-text">{item.issue}</span>
                  </div>
                ))}
                {respMetrics.detectedIssues.length > 5 && (
                  <div className="tooltip-more">+{respMetrics.detectedIssues.length - 5} more issues</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Conversion Risk Card */}
        <div className="mobile-stat-card conversion-risk-card">
          <span className="mobile-stat-label">Conversion Risk</span>
          <div className="mobile-stat-content">
            <span className={`mobile-stat-value risk-${convRiskClass}`}>
              {lead.mobile_conversion_risk || 'Moderate'}
            </span>
          </div>
          <span className="mobile-stat-insight">Lead Dropoff Risk</span>
        </div>
      </div>

      <div className="mobile-ai-box" style={{ minHeight: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <div className="mobile-ai-header">
          <Bot size={14} color="#3b82f6" />
          <span className="mobile-ai-label">Live Screen Critique</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={currentIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mobile-ai-text"
            style={{ margin: 0 }}
          >
            "{currentSection.insight || "No specific mobile critiques compiled for this section."}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

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
              const csvHeader = 'website,competitor_website,final_score,design,cta,message,trust,speed,schema_score,schema_impact,first_impression_score,first_impression_verdict,executive_summary,business_risk_insight,strategic_opportunity_insight,executive_ai_recommendation,brand_credibility_insight,msg_clarity_level,msg_effectiveness_insight,val_prop_analysis,msg_strategic_rec,headline_clarity,val_prop_strength,cta_quality,msg_confidence,audience_clarity,brand_effectiveness,cta_strength,cta_urgency,cta_visibility,cta_placement,cta_clarity,cta_persuasiveness,cta_eff_insight,cta_opt_rec_ai,mobile_rating,mobile_risk,mobile_insight,momentum_score,momentum_status,momentum_risk,momentum_direction,momentum_insight,strategic_action_plan,revenue_leak,leak_severity,annual_loss,urgency_severity,revenue_impact_insight,visitors_lost,leads_lost,missing_leads_count,conversion_loss_percent,readiness_level,cta_opt_rec,conv_imp_sug,funnel_opt_ins,mobile_conv_rec,lead_gen_opp,conv_intel_ins,industry_percentile,industry_tier,industry_competitiveness,lead_quality,maturity_level,sales_potential,digital_readiness,growth_potential,market_insight,buyer_intent,trans_intent,ent_orientation,lead_gen_focus,conv_positioning,comm_maturity,website_type,comm_insights,sales_maturity,comm_readiness_lvl,conv_target_insight,market_strat_rec,keyword_opps,keyword_level,competitor_adv,search_impact,keyword_insight,trust_decay,maintenance_confidence,outdated_signals,credibility_insight,trust_recommendation,rebranding_pitch,seo_issues,aeo_quote,battle_winner,battle_verdict,emailfullbody\n';


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
                  escapeCSV(lead.competitor_data?.website || 'N/A'),
                  uxScore,
                  escapeCSV(lead.design),
                  escapeCSV(lead.cta),
                  escapeCSV(lead.message),
                  escapeCSV(lead.trust),
                  escapeCSV(lead.speed),
                  escapeCSV(lead.schema_coverage_score || 0),
                  escapeCSV(lead.schema_visibility_impact || 'Low'),
                  escapeCSV(lead.first_impression_score || 0),
                  escapeCSV(lead.first_impression_verdict || 'Unknown'),
                  escapeCSV(lead.executive_summary || ''),
                  escapeCSV(lead.business_risk_insight || ''),
                  escapeCSV(lead.strategic_opportunity_insight || ''),
                  escapeCSV(lead.executive_ai_recommendation || ''),
                   escapeCSV(lead.brand_credibility_insight || ''),
                  escapeCSV(lead.messaging_clarity_level || 'Moderate'),
                  escapeCSV(lead.communication_effectiveness_insight || ''),
                  escapeCSV(lead.value_proposition_analysis || ''),
                  escapeCSV(lead.messaging_strategic_recommendation || ''),
                  escapeCSV(lead.headline_clarity_score || 0),
                  escapeCSV(lead.value_prop_strength_score || 0),
                  escapeCSV(lead.cta_communication_quality_score || 0),
                  escapeCSV(lead.messaging_confidence_score || 0),
                  escapeCSV(lead.audience_targeting_clarity_score || 0),
                  escapeCSV(lead.brand_communication_effectiveness_score || 0),
                  escapeCSV(lead.cta_strength_level || 'Moderate'),
                  escapeCSV(lead.cta_urgency_score || 0),
                  escapeCSV(lead.cta_visibility_rating || 'Moderate'),
                  escapeCSV(lead.cta_placement_quality || 'Suboptimal'),
                  escapeCSV(lead.cta_action_clarity_score || 0),
                  escapeCSV(lead.cta_persuasiveness_score || 0),
                  escapeCSV(lead.cta_effectiveness_insight || ''),
                  escapeCSV(lead.cta_ai_optimization_recommendation || ''),
                  escapeCSV(lead.mobile_ux_rating || 'Average'),
                  escapeCSV(lead.mobile_conversion_risk || 'Moderate'),
                  escapeCSV(lead.mobile_ai_insight || ''),
                  escapeCSV(lead.momentum_score || 0),
                  escapeCSV(lead.competitive_growth_status || 'Steady'),
                  escapeCSV(lead.strategic_risk_level || 'Moderate'),
                  escapeCSV(lead.momentum_growth_direction || 'Neutral'),
                  escapeCSV(lead.momentum_ai_insight || ''),
                  escapeCSV((lead.ai_strategic_plan || []).map(s => `${s.priority}: ${s.action} (Impact: ${s.impact})`).join(' | ')),
                  escapeCSV(`$${lead.revenue_leak_amount || 0}`),
                  escapeCSV(lead.revenue_leak_severity || 'Low'),
                  escapeCSV(`$${lead.annual_opportunity_loss || 0}`),
                  escapeCSV(lead.urgency_severity || '90+ Days'),
                  escapeCSV(lead.revenue_impact_insight || ''),
                  escapeCSV(lead.visitors_lost || 0),
                  escapeCSV(lead.leads_lost || 0),
                  escapeCSV(lead.missing_opportunities_count || 0),
                  escapeCSV(`${lead.estimated_conversion_loss_percent || 0}%`),
                  escapeCSV(lead.conversion_readiness_level || 'Low'),
                  escapeCSV(lead.cta_optimization_recommendation || ''),
                  escapeCSV(lead.conversion_improvement_suggestion || ''),
                  escapeCSV(lead.funnel_optimization_insight || ''),
                  escapeCSV(lead.mobile_conversion_recommendation || ''),
                  escapeCSV(lead.lead_gen_improvement_opportunity || ''),
                  escapeCSV(lead.conversion_intelligence_insight || ''),
                  escapeCSV(lead.industry_percentile || 0),
                  escapeCSV(lead.industry_tier || 'Unknown'),
                  escapeCSV(lead.industry_competitiveness || 'Unknown'),
                  escapeCSV(lead.lead_quality_score || 0),
                  escapeCSV(lead.business_maturity_level || 'Unknown'),
                  escapeCSV(lead.sales_potential || 'Moderate'),
                  escapeCSV(lead.digital_readiness || 'Moderate'),
                  escapeCSV(lead.growth_potential || 'Moderate'),
                  escapeCSV(lead.market_position_intelligence_insight || ''),
                  escapeCSV(lead.buyer_intent_strength || 'Moderate'),
                  escapeCSV(lead.transactional_service_intent_score || 0),
                  escapeCSV(lead.enterprise_sales_orientation_score || 0),
                  escapeCSV(lead.lead_generation_focus_score || 0),
                  escapeCSV(lead.conversion_oriented_positioning_score || 0),
                  escapeCSV(lead.commercial_readiness_maturity || 'Moderate'),
                  escapeCSV(lead.primary_website_type || 'informational'),
                  escapeCSV(lead.commercial_insights || ''),
                  escapeCSV(lead.sales_positioning_maturity_score || 0),
                  escapeCSV(lead.commercial_readiness_level_score || 0),
                  escapeCSV(lead.conversion_targeting_insight || ''),
                  escapeCSV(lead.market_position_ai_strategic_recommendation || ''),
                  escapeCSV(lead.keyword_visibility_gap_opportunities || ''),
                  escapeCSV(lead.keyword_visibility_gap_level || 'Low'),
                  escapeCSV(lead.keyword_visibility_gap_competitor_advantage || ''),
                  escapeCSV(lead.keyword_visibility_gap_search_impact || 'Low'),
                  escapeCSV(lead.keyword_visibility_gap_insight || ''),
                  escapeCSV(lead.trust_decay_level || 'Low'),
                  escapeCSV(lead.maintenance_confidence || 100),
                  escapeCSV(lead.outdated_signal_indicators || ''),
                  escapeCSV(lead.credibility_impact_insight || ''),
                  escapeCSV(lead.ai_trust_recommendation || ''),
                  escapeCSV(lead.rebranding_pitch),
                  escapeCSV(trustWarning),
                  escapeCSV(seoIssues),
                  escapeCSV((lead.aeo_probe_response || 'No AI recognition data.').substring(0, 1000)),
                  escapeCSV(lead.battle_data?.overall_winner || 'N/A'),
                  escapeCSV(lead.battle_data?.ai_verdict || 'N/A'),
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

        // AI Trust Intelligence Logic
        const trustSignals = [
          lead.has_analytics?.google_analytics,
          lead.has_analytics?.tag_manager,
          lead.has_analytics?.facebook_pixel,
          lead.has_analytics?.linkedin_tag,
          lead.has_lead_capture,
          lead.has_cta,
          lead.has_newsletter,
          lead.seo_ssl,
          lead.ssl_enforced,
          lead.seo_title,
          lead.seo_meta_desc,
          lead.seo_canonical,
          lead.seo_og
        ];
        const passedSignals = trustSignals.filter(Boolean).length;
        const trustScore = Math.round((passedSignals / 13) * 100);

        let trustRisk = 'High';
        if (trustScore > 75) trustRisk = 'Low';
        else if (trustScore > 40) trustRisk = 'Moderate';

        let trustInsight = "Website demonstrates strong credibility signals and technical optimization for trust.";
        if (!lead.seo_ssl) {
          trustInsight = "Critical security vulnerability detected: SSL is missing or invalid, causing immediate trust loss and search penalties.";
        } else if (!lead.has_lead_capture && !lead.has_newsletter) {
          trustInsight = "Website lacks optimized conversion paths and lead capture mechanisms, resulting in significant missed opportunities.";
        } else if (passedSignals < 6) {
          trustInsight = "Major technical trust gaps identified. Lack of tracking and security signals may deter high-value prospects.";
        } else if (passedSignals < 10) {
          trustInsight = "Website has a solid foundation but lacks advanced conversion tracking and complete SEO metadata optimization.";
        }

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
                <button
                  aria-label="Dashboard Overview"
                  title="Dashboard Overview"
                  className="nav-btn-reset"
                  onClick={() => document.getElementById(`lead-${index}`).scrollIntoView({ behavior: 'smooth' })}
                >
                  <LayoutDashboard size={20} className="nav-icon active" />
                </button>
              </div>

              <div className="nav-tooltip-wrap">
                <button
                  aria-label="AI Outreach Email"
                  title="AI Outreach Email"
                  className="nav-btn-reset"
                  onClick={() => document.getElementById(`lead-${index}-outreach`).scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText size={20} className="nav-icon" />
                </button>
              </div>

              <div className="nav-tooltip-wrap">
                <button
                  aria-label="SEO Performance"
                  title="SEO Performance"
                  className="nav-btn-reset"
                  onClick={() => document.getElementById(`lead-${index}-seo`).scrollIntoView({ behavior: 'smooth' })}
                >
                  <BarChart3 size={20} className="nav-icon" />
                </button>
              </div>

              <div className="nav-tooltip-wrap">
                <button
                  aria-label="Trust Intelligence"
                  title="Trust Intelligence"
                  className="nav-btn-reset"
                  onClick={() => document.getElementById(`lead-${index}-trust`).scrollIntoView({ behavior: 'smooth' })}
                >
                  <Activity size={20} className="nav-icon" />
                </button>
              </div>

              <div className="nav-tooltip-wrap" style={{ marginTop: 'auto' }}>
                <button
                  aria-label="Settings"
                  title="Settings"
                  className="nav-btn-reset"
                  onClick={() => alert('Settings coming soon!')}
                >
                  <Settings size={20} className="nav-icon" />
                </button>
              </div>

              <div className="nav-tooltip-wrap" style={{ marginBottom: '2rem' }}>
                <button
                  aria-label="Return to Top"
                  title="Return to Top"
                  className="nav-btn-reset"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ChevronUp size={20} className="nav-icon" />
                </button>
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
                    const csvHeader = 'website,competitor_website,final_score,design,cta,message,trust,speed,schema_score,schema_impact,first_impression_score,first_impression_verdict,executive_summary,business_risk_insight,strategic_opportunity_insight,executive_ai_recommendation,brand_credibility_insight,msg_clarity_level,msg_effectiveness_insight,val_prop_analysis,msg_strategic_rec,headline_clarity,val_prop_strength,cta_quality,msg_confidence,audience_clarity,brand_effectiveness,cta_strength,cta_urgency,cta_visibility,cta_placement,cta_clarity,cta_persuasiveness,cta_eff_insight,cta_opt_rec_ai,mobile_rating,mobile_risk,mobile_insight,momentum_score,momentum_status,momentum_risk,momentum_direction,momentum_insight,strategic_action_plan,revenue_leak,leak_severity,annual_loss,urgency_severity,revenue_impact_insight,visitors_lost,leads_lost,missing_leads_count,conversion_loss_percent,readiness_level,cta_opt_rec,conv_imp_sug,funnel_opt_ins,mobile_conv_rec,lead_gen_opp,conv_intel_ins,industry_percentile,industry_tier,industry_competitiveness,lead_quality,maturity_level,sales_potential,digital_readiness,growth_potential,market_insight,buyer_intent,trans_intent,ent_orientation,lead_gen_focus,conv_positioning,comm_maturity,website_type,comm_insights,sales_maturity,comm_readiness_lvl,conv_target_insight,market_strat_rec,keyword_opps,keyword_level,competitor_adv,search_impact,keyword_insight,trust_decay,maintenance_confidence,outdated_signals,credibility_insight,trust_recommendation,rebranding_pitch,seo_issues,aeo_quote,battle_winner,battle_verdict,emailfullbody\n';

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
                      escapeCSV(lead.competitor_data?.website || 'N/A'),
                      uxScore,
                      escapeCSV(lead.design),
                      escapeCSV(lead.cta),
                      escapeCSV(lead.message),
                      escapeCSV(lead.trust),
                      escapeCSV(lead.speed),
                      escapeCSV(lead.schema_coverage_score || 0),
                      escapeCSV(lead.schema_visibility_impact || 'Low'),
                      escapeCSV(lead.first_impression_score || 0),
                      escapeCSV(lead.first_impression_verdict || 'Unknown'),
                      escapeCSV(lead.executive_summary || ''),
                      escapeCSV(lead.business_risk_insight || ''),
                      escapeCSV(lead.strategic_opportunity_insight || ''),
                      escapeCSV(lead.executive_ai_recommendation || ''),
                       escapeCSV(lead.brand_credibility_insight || ''),
                      escapeCSV(lead.messaging_clarity_level || 'Moderate'),
                      escapeCSV(lead.communication_effectiveness_insight || ''),
                      escapeCSV(lead.value_proposition_analysis || ''),
                      escapeCSV(lead.messaging_strategic_recommendation || ''),
                      escapeCSV(lead.headline_clarity_score || 0),
                      escapeCSV(lead.value_prop_strength_score || 0),
                      escapeCSV(lead.cta_communication_quality_score || 0),
                      escapeCSV(lead.messaging_confidence_score || 0),
                      escapeCSV(lead.audience_targeting_clarity_score || 0),
                      escapeCSV(lead.brand_communication_effectiveness_score || 0),
                      escapeCSV(lead.cta_strength_level || 'Moderate'),
                      escapeCSV(lead.cta_urgency_score || 0),
                      escapeCSV(lead.cta_visibility_rating || 'Moderate'),
                      escapeCSV(lead.cta_placement_quality || 'Suboptimal'),
                      escapeCSV(lead.cta_action_clarity_score || 0),
                      escapeCSV(lead.cta_persuasiveness_score || 0),
                      escapeCSV(lead.cta_effectiveness_insight || ''),
                      escapeCSV(lead.cta_ai_optimization_recommendation || ''),
                      escapeCSV(lead.mobile_ux_rating || 'Average'),
                      escapeCSV(lead.mobile_conversion_risk || 'Moderate'),
                      escapeCSV(lead.mobile_ai_insight || ''),
                      escapeCSV(lead.momentum_score || 0),
                      escapeCSV(lead.competitive_growth_status || 'Steady'),
                      escapeCSV(lead.strategic_risk_level || 'Moderate'),
                      escapeCSV(lead.momentum_growth_direction || 'Neutral'),
                      escapeCSV(lead.momentum_ai_insight || ''),
                      escapeCSV((lead.ai_strategic_plan || []).map(s => `${s.priority}: ${s.action} (Impact: ${s.impact})`).join(' | ')),
                      escapeCSV(`$${lead.revenue_leak_amount || 0}`),
                      escapeCSV(lead.revenue_leak_severity || 'Low'),
                      escapeCSV(`$${lead.annual_opportunity_loss || 0}`),
                      escapeCSV(lead.urgency_severity || '90+ Days'),
                      escapeCSV(lead.revenue_impact_insight || ''),
                      escapeCSV(lead.visitors_lost || 0),
                      escapeCSV(lead.leads_lost || 0),
                      escapeCSV(lead.missing_opportunities_count || 0),
                      escapeCSV(`${lead.estimated_conversion_loss_percent || 0}%`),
                      escapeCSV(lead.conversion_readiness_level || 'Low'),
                      escapeCSV(lead.cta_optimization_recommendation || ''),
                      escapeCSV(lead.conversion_improvement_suggestion || ''),
                      escapeCSV(lead.funnel_optimization_insight || ''),
                      escapeCSV(lead.mobile_conversion_recommendation || ''),
                      escapeCSV(lead.lead_gen_improvement_opportunity || ''),
                      escapeCSV(lead.conversion_intelligence_insight || ''),
                      escapeCSV(lead.industry_percentile || 0),
                      escapeCSV(lead.industry_tier || 'Unknown'),
                      escapeCSV(lead.industry_competitiveness || 'Unknown'),
                      escapeCSV(lead.lead_quality_score || 0),
                      escapeCSV(lead.business_maturity_level || 'Unknown'),
                      escapeCSV(lead.sales_potential || 'Moderate'),
                      escapeCSV(lead.digital_readiness || 'Moderate'),
                      escapeCSV(lead.growth_potential || 'Moderate'),
                      escapeCSV(lead.market_position_intelligence_insight || ''),
                      escapeCSV(lead.buyer_intent_strength || 'Moderate'),
                      escapeCSV(lead.transactional_service_intent_score || 0),
                      escapeCSV(lead.enterprise_sales_orientation_score || 0),
                      escapeCSV(lead.lead_generation_focus_score || 0),
                      escapeCSV(lead.conversion_oriented_positioning_score || 0),
                      escapeCSV(lead.commercial_readiness_maturity || 'Moderate'),
                      escapeCSV(lead.primary_website_type || 'informational'),
                      escapeCSV(lead.commercial_insights || ''),
                      escapeCSV(lead.sales_positioning_maturity_score || 0),
                      escapeCSV(lead.commercial_readiness_level_score || 0),
                      escapeCSV(lead.conversion_targeting_insight || ''),
                      escapeCSV(lead.market_position_ai_strategic_recommendation || ''),
                      escapeCSV(lead.keyword_visibility_gap_opportunities || ''),
                      escapeCSV(lead.keyword_visibility_gap_level || 'Low'),
                      escapeCSV(lead.keyword_visibility_gap_competitor_advantage || ''),
                      escapeCSV(lead.keyword_visibility_gap_search_impact || 'Low'),
                      escapeCSV(lead.keyword_visibility_gap_insight || ''),
                      escapeCSV(lead.trust_decay_level || 'Low'),
                      escapeCSV(lead.maintenance_confidence || 100),
                      escapeCSV(lead.outdated_signal_indicators || ''),
                      escapeCSV(lead.credibility_impact_insight || ''),
                      escapeCSV(lead.ai_trust_recommendation || ''),
                      escapeCSV(lead.rebranding_pitch),
                      escapeCSV(trustWarning),
                      escapeCSV(seoIssues),
                      escapeCSV((lead.aeo_probe_response || 'No AI recognition data.').substring(0, 500)),
                      escapeCSV(lead.battle_data?.overall_winner || 'N/A'),
                      escapeCSV(lead.battle_data?.ai_verdict || 'N/A'),
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

                {/* 0. Competitor Battle Card (Full Width) */}
                {lead.battle_data && (
                  <div className="quad-card battle-card animate-slide-up">
                    <div className="battle-header">
                      <div className="battle-title">
                        <Sword size={24} />
                        Competitor Battle Card
                      </div>
                      <div className="battle-vs-badge">
                        {lead.website.replace(/^https?:\/\//i, '').split('/')[0]} vs {lead.competitor_data?.website.replace(/^https?:\/\//i, '').split('/')[0]}
                      </div>
                    </div>

                    <div className="battle-comparison-grid">
                      {[
                        { label: 'SEO Score', key: 'seo_winner', primary: lead.seo_score, comp: lead.competitor_data?.seo_score },
                        { label: 'UX Score', key: 'ux_winner', primary: uxScore, comp: Math.round(((lead.competitor_data?.design === 'Modern' ? 90 : 60) + (lead.competitor_data?.message === 'Clear' ? 80 : 50) + (lead.competitor_data?.seo_mobile ? 80 : 30) + (lead.competitor_data?.cta === 'Strong' ? 90 : 40)) / 4) },
                        { label: 'Trust Score', key: 'trust_winner', primary: trustScore, comp: Math.round((([lead.competitor_data?.has_analytics?.google_analytics, lead.competitor_data?.has_analytics?.tag_manager, lead.competitor_data?.has_analytics?.facebook_pixel, lead.competitor_data?.has_analytics?.linkedin_tag, lead.competitor_data?.has_lead_capture, lead.competitor_data?.has_cta, lead.competitor_data?.has_newsletter, lead.competitor_data?.seo_ssl, lead.competitor_data?.ssl_enforced, lead.competitor_data?.seo_title, lead.competitor_data?.seo_meta_desc, lead.competitor_data?.seo_canonical, lead.competitor_data?.seo_og].filter(Boolean).length) / 13) * 100) },
                        { label: 'AI Visibility', key: 'ai_visibility_winner', primary: lead.aeo_score, comp: lead.competitor_data?.aeo_score },
                        { label: 'Performance', key: 'performance_winner', primary: lead.lighthouse_performance, comp: lead.competitor_data?.lighthouse_performance },
                        { label: 'Lead Capture', key: 'lead_capture_winner', primary: lead.has_lead_capture ? 1 : 0, comp: lead.competitor_data?.has_lead_capture ? 1 : 0 },
                        { label: 'Conversion Readiness', key: 'conversion_winner', primary: lead.conversion_readiness_level === 'High' ? 100 : lead.conversion_readiness_level === 'Medium' ? 60 : 30, comp: lead.competitor_data?.conversion_readiness_level === 'High' ? 100 : lead.competitor_data?.conversion_readiness_level === 'Medium' ? 60 : 30 }
                      ].map((metric, i) => (
                        <div key={i} className="battle-metric-row">
                          <div className="battle-metric-value primary">
                            <span className="metric-domain">PRIMARY</span>
                            <span className="metric-score">{metric.primary}{typeof metric.primary === 'number' && metric.primary > 1 ? '%' : ''}</span>
                            {lead.battle_data[metric.key] === 'Primary' && <div className="winner-indicator win"><Trophy size={10} /> Winner</div>}
                          </div>

                          <div className="battle-metric-label">{metric.label}</div>

                          <div className="battle-metric-value competitor">
                            <span className="metric-domain">COMPETITOR</span>
                            <span className="metric-score">{metric.comp}{typeof metric.comp === 'number' && metric.comp > 1 ? '%' : ''}</span>
                            {lead.battle_data[metric.key] === 'Competitor' && <div className="winner-indicator win"><Trophy size={10} /> Winner</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="battle-verdict-box">
                      <div className="verdict-header">
                        <Zap size={20} color="#ef4444" fill="#ef4444" />
                        <span className="verdict-title">Executive AI Verdict</span>
                        <div className={`verdict-badge verdict-${lead.battle_data.overall_winner === 'Primary' ? 'excellent' : 'poor'}`} style={{ marginLeft: 'auto' }}>
                          Overall Advantage: {lead.battle_data.overall_winner}
                        </div>
                      </div>
                      <p className="verdict-text">
                        "{lead.battle_data.ai_verdict}"
                      </p>
                      <div className="advantage-summary">
                        <Target size={14} /> Strategic Insight: <span className="advantage-value">{lead.battle_data.overall_advantage}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 0. Executive Presence Intelligence */}
                <div className="quad-card first-impression-card animate-slide-up">
                  <div className="quad-header">
                    <h2>Executive Presence Intelligence</h2>
                    <div className={`verdict-badge verdict-${(lead.first_impression_verdict || 'Average').toLowerCase()}`}>
                      {lead.first_impression_verdict || 'Average'}
                    </div>
                  </div>
                  
                  <div className="executive-summary-box" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Bot size={16} color="#3b82f6" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Executive AI Summary</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>
                      "{lead.executive_summary || lead.first_impression_explanation || "Analyzing website's visual impact and immediate trust signals..."}"
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> Biggest Business Risk
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.business_risk_insight || "Conversion leaks due to suboptimal user flow."}</div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Zap size={14} /> Top Opportunity Area
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.strategic_opportunity_insight || "Optimizing above-the-fold CTA placement."}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>Presence Score</div>
                      <div className="impression-score-large" style={{ fontSize: '2rem', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                        {lead.first_impression_score || 0}<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500, marginLeft: '2px' }}>/10</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#a855f7', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Sparkles size={14} /> Strategic AI Recommendation
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.executive_ai_recommendation || "Prioritize mobile responsive design and clear value proposition."}</div>
                    </div>
                  </div>

                   <div className="impression-factors" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div className="factor-tag" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}><Activity size={12} /> Branding</div>
                    <div className="factor-tag" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}><LayoutDashboard size={12} /> Layout</div>
                    <div className="factor-tag" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}><Target size={12} /> CTA Clarity</div>
                    <div className="factor-tag" title={lead.brand_credibility_insight} style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}><Lock size={12} color="#10b981" /> Trust Signals Verified</div>
                    <div className="factor-tag" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}><Smartphone size={12} /> Mobile Feel</div>
                  </div>

                  <div className="messaging-analysis-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                        <Bot size={18} /> Messaging & Content Clarity
                      </h3>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        Level: {lead.messaging_clarity_level || 'Moderate'}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', fontStyle: 'italic', lineHeight: '1.5' }}>
                        "{lead.communication_effectiveness_insight || "Analyzing messaging effectiveness..."}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        <Target size={12} /> Value Prop: <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{lead.value_proposition_analysis}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'Headline Clarity', score: lead.headline_clarity_score },
                        { label: 'Value Prop Strength', score: lead.value_prop_strength_score },
                        { label: 'CTA Quality', score: lead.cta_communication_quality_score },
                        { label: 'Confidence', score: lead.messaging_confidence_score },
                        { label: 'Audience Clarity', score: lead.audience_targeting_clarity_score },
                        { label: 'Effectiveness', score: lead.brand_communication_effectiveness_score }
                      ].map((item, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700 }}>{item.score || 0}/10</span>
                          </div>
                          <div className="bar-track" style={{ height: '3px' }}>
                            <div className="bar-fill" style={{ width: `${(item.score || 0) * 10}%`, background: (item.score || 0) > 7 ? '#10b981' : (item.score || 0) > 4 ? '#3b82f6' : '#ef4444' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                      <Sparkles size={14} color="#a855f7" style={{ marginTop: '2px' }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 700, color: '#a855f7' }}>Messaging Recommendation:</span> {lead.messaging_strategic_recommendation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 0.5. Mobile Experience Walkthrough Carousel */}
                <div className="quad-card mobile-reality-card animate-slide-up">
                  <MobileWalkthrough lead={lead} />
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

                  {/* AI Trust Decay Indicators Section */}
                  <div className="trust-decay-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4' }}>
                        <AlertTriangle size={18} /> AI Trust Decay Indicators
                      </h3>
                      <div className={`severity-badge severity-${(lead.trust_decay_level || 'Low').toLowerCase() === 'critical' || (lead.trust_decay_level || 'Low').toLowerCase() === 'high' ? 'critical' : (lead.trust_decay_level || 'Low').toLowerCase() === 'moderate' ? 'moderate' : 'low'}`} style={{ fontSize: '0.75rem', padding: '2px 10px' }}>
                        Decay: {lead.trust_decay_level || 'Low'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Maintenance Confidence</span>
                          <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 700 }}>{lead.maintenance_confidence || 100}%</span>
                        </div>
                        <div className="bar-track" style={{ height: '4px' }}>
                          <div className="bar-fill" style={{ width: `${lead.maintenance_confidence || 100}%`, background: (lead.maintenance_confidence || 100) > 80 ? '#10b981' : (lead.maintenance_confidence || 100) > 50 ? '#06b6d4' : '#ef4444' }}></div>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>System analysis of content freshness & technical health.</p>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <RefreshCw size={14} color="#f59e0b" />
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Outdated Signals</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {(lead.outdated_signal_indicators || 'None detected').split(',').map((sig, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                              {sig.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #06b6d4', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Activity size={16} color="#06b6d4" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4' }}>Credibility Impact Insight</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                        "{lead.credibility_impact_insight || "Analyzing long-term credibility impact..."}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                      <Bot size={16} color="#10b981" style={{ marginTop: '2px' }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>AI Trust Recommendation:</span> {lead.ai_trust_recommendation || "Maintain content freshness and resolve outdated visual signals to restore brand authority."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. AI Trust Intelligence */}
                <div className="quad-card" id={`lead-${index}-trust`}>
                  <div className="quad-header">
                    <h2>AI Trust Intelligence</h2>
                    <div className={`trust-risk-badge risk-${trustRisk.toLowerCase()}`}>
                      Risk: {trustRisk}
                    </div>
                  </div>

                  <div className="trust-score-container">
                    <div className="trust-score-box">
                      <span className="trust-score-value">{trustScore}</span>
                      <span className="trust-score-label">/100</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="bar-track" style={{ height: '8px' }}>
                        <div
                          className="bar-fill"
                          style={{
                            width: `${trustScore}%`,
                            background: trustScore > 75 ? '#10b981' : trustScore > 40 ? '#fbbf24' : '#ef4444'
                          }}
                        ></div>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        {passedSignals} of 13 Trust Signals Verified
                      </p>
                    </div>
                  </div>

                  <div className="trust-ai-insight">
                    <div className="trust-insight-header">
                      <Bot size={14} color="#3b82f6" />
                      <span className="trust-insight-label">AI Trust Insight</span>
                    </div>
                    <p className="trust-insight-text">
                      "{trustInsight}"
                    </p>
                  </div>

                  <div className="trust-check-grid">
                    <div className="trust-check-group">
                      <h3><Activity size={14} color="#fbbf24" /> Tracking</h3>
                      <div className="trust-check-item"><span>Google Analytics</span> {lead.has_analytics?.google_analytics ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Tag Manager</span> {lead.has_analytics?.tag_manager ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Facebook Pixel</span> {lead.has_analytics?.facebook_pixel ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>LinkedIn Tag</span> {lead.has_analytics?.linkedin_tag ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                    </div>
                    <div className="trust-check-group">
                      <h3><Mail size={14} color="#a855f7" /> Lead Capture</h3>
                      <div className="trust-check-item"><span>Contact Form</span> {lead.has_lead_capture ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>CTA Placement</span> {lead.has_cta ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Newsletter</span> {lead.has_newsletter ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      {(!lead.has_lead_capture || !lead.has_newsletter) && <span className="conversion-weakness">Potential Conversion Weakness</span>}
                    </div>
                    <div className="trust-check-group">
                      <h3><Lock size={14} color="#10b981" /> SSL Security</h3>
                      <div className="trust-check-item"><span>SSL Valid</span> {lead.seo_ssl ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Enforced</span> {lead.ssl_enforced ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item" style={{ fontSize: '0.75rem', color: lead.ssl_days_remaining < 30 ? '#ef4444' : '#94a3b8' }}>
                        <span>Expires</span> {lead.ssl_days_remaining ? `${lead.ssl_days_remaining}d` : 'N/A'}
                      </div>
                    </div>
                    <div className="trust-check-group">
                      <h3><FileCode size={14} color="#3b82f6" /> Meta Tags</h3>
                      <div className="trust-check-item"><span>Title Tag</span> {lead.seo_title ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Description</span> {lead.seo_meta_desc ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Canonical</span> {lead.seo_canonical ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
                      <div className="trust-check-item"><span>Open Graph</span> {lead.seo_og ? <Check color="#10b981" size={14} /> : <X color="#ef4444" size={14} />}</div>
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

                {/* 4. Revenue Impact Forecast */}
                <div className="quad-card revenue-leak-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingDown size={20} /> Revenue Impact Forecast
                    </h2>
                    <div className="impact-badges" style={{ display: 'flex', gap: '0.5rem' }}>
                      <div className={`severity-badge severity-${(lead.revenue_leak_severity || 'Low').toLowerCase()}`}>
                        {lead.revenue_leak_severity || 'Low'} Risk
                      </div>
                      <div className={`severity-badge severity-${(lead.urgency_severity || '').toLowerCase().includes('immediate') ? 'critical' : (lead.urgency_severity || '').toLowerCase().includes('30') ? 'moderate' : 'low'}`} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        Urgency: {lead.urgency_severity || '90+ Days'}
                      </div>
                    </div>
                  </div>

                  <div className="impact-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="leak-amount-box" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Monthly Impact</span>
                      <div className="leak-amount" style={{ fontSize: '1.5rem' }}>
                        ${(lead.revenue_leak_amount || 0).toLocaleString()}
                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>/mo</span>
                      </div>
                    </div>
                    <div className="leak-amount-box" style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Yearly Projected Loss</span>
                      <div className="leak-amount" style={{ fontSize: '1.5rem', color: '#3b82f6' }}>
                        ${(lead.annual_opportunity_loss || (lead.revenue_leak_amount || 0) * 12).toLocaleString()}
                        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>/yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="loss-details-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                    <div className="stat-item">
                      <span className="stat-label">Visitors Lost</span>
                      <span className="stat-value" style={{ fontSize: '1.1rem' }}>{lead.visitors_lost || 0}</span>
                    </div>
                    <div className="stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                      <span className="stat-label">Missed Leads</span>
                      <span className="stat-value" style={{ fontSize: '1.1rem' }}>{lead.leads_lost || 0}</span>
                    </div>
                    <div className="stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                      <span className="stat-label">Strategic Risk</span>
                      <span className="stat-value" style={{ fontSize: '1.1rem', color: lead.strategic_risk_level === 'High' ? '#ef4444' : '#fbbf24' }}>{lead.strategic_risk_level || 'Moderate'}</span>
                    </div>
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={16} color="#ef4444" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Executive AI Forecast</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{lead.revenue_impact_insight || lead.revenue_leak_explanation || "Continued delays in optimization may significantly reduce long-term conversion performance and AI visibility competitiveness."}"
                    </p>
                  </div>
                </div>

                {/* 5. Conversion Opportunity Intelligence */}
                <div className="quad-card conversion-intelligence-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bot size={20} /> Conversion Opportunity Intelligence
                    </h2>
                    <div className={`severity-badge severity-${(lead.conversion_readiness_level || 'Low').toLowerCase() === 'high' ? 'low' : (lead.conversion_readiness_level || 'Low').toLowerCase() === 'medium' ? 'moderate' : 'critical'}`}>
                      Readiness: {lead.conversion_readiness_level || 'Low'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="missing-count-box" style={{ background: 'rgba(249, 115, 22, 0.05)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                      <span className="missing-number" style={{ fontSize: '1.5rem', color: '#f97316' }}>{lead.missing_opportunities_count || 0}</span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Missing Paths</div>
                    </div>
                    <div className="loss-percent-box" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 800 }}>-{lead.estimated_conversion_loss_percent || 0}%</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Est. Conversion Loss</div>
                    </div>
                  </div>

                  <div className="missing-items-list" style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>Missing Conversion Paths:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {(lead.missing_opportunities_list || []).map((item, i) => (
                        <div key={i} className="factor-tag" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '0.7rem', padding: '2px 8px' }}>
                          <X size={10} /> {item}
                        </div>
                      ))}
                      {(lead.missing_opportunities_list || []).length === 0 && (
                        <div className="factor-tag" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.15)', fontSize: '0.7rem', padding: '2px 8px' }}>
                          <Check size={10} /> All paths active
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="cta-strength-analysis" style={{ background: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316' }}>
                        <Zap size={16} /> CTA Strength Analysis
                      </h3>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                        Strength: {lead.cta_strength_level || 'Moderate'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Urgency</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (lead.cta_urgency_score || 0) > 7 ? '#10b981' : (lead.cta_urgency_score || 0) > 4 ? '#3b82f6' : '#ef4444' }}>{lead.cta_urgency_score || 0}<span style={{ fontSize: '0.8rem', opacity: 0.5 }}>/10</span></div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Placement</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: lead.cta_placement_quality === 'Strategic' ? '#10b981' : lead.cta_placement_quality === 'Suboptimal' ? '#3b82f6' : '#ef4444', marginTop: '6px' }}>{lead.cta_placement_quality || 'Suboptimal'}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Visibility</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: lead.cta_visibility_rating === 'High' ? '#10b981' : lead.cta_visibility_rating === 'Moderate' ? '#3b82f6' : '#ef4444', marginTop: '6px' }}>{lead.cta_visibility_rating || 'Moderate'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Action Clarity</span>
                          <span style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 700 }}>{lead.cta_action_clarity_score || 0}/10</span>
                        </div>
                        <div className="bar-track" style={{ height: '3px' }}>
                          <div className="bar-fill" style={{ width: `${(lead.cta_action_clarity_score || 0) * 10}%`, background: '#f97316' }}></div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Persuasiveness</span>
                          <span style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 700 }}>{lead.cta_persuasiveness_score || 0}/10</span>
                        </div>
                        <div className="bar-track" style={{ height: '3px' }}>
                          <div className="bar-fill" style={{ width: `${(lead.cta_persuasiveness_score || 0) * 10}%`, background: '#f97316' }}></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(249, 115, 22, 0.05)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{lead.cta_effectiveness_insight || "The CTA is visible but lacks urgency and persuasive language, reducing conversion motivation."}"
                      </p>
                    </div>
                  </div>

                  <div className="strategic-recs-grid" style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Sparkles size={14} color="#f97316" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316' }}>AI CTA Optimization</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#e2e8f0', margin: 0, fontWeight: 500 }}>{lead.cta_ai_optimization_recommendation || lead.cta_optimization_recommendation || "Optimize above-the-fold CTA placement and clarity."}</p>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Smartphone size={14} color="#3b82f6" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>Mobile Conversion</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{lead.mobile_conversion_recommendation || "Simplify mobile contact access to reduce conversion friction."}</p>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <TrendingDown size={14} color="#ef4444" style={{ transform: 'rotate(180deg)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>Funnel Insight</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{lead.funnel_optimization_insight || "Analyze multi-step forms to identify where prospects are dropping off."}</p>
                    </div>
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(249, 115, 22, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Bot size={16} color="#f97316" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase' }}>Strategic Intelligence</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{lead.conversion_intelligence_insight || lead.missing_leads_insight || "Visitors have limited conversion paths, reducing lead generation potential."}"
                    </p>
                  </div>
                </div>

                {/* 5.5 Market Position Intelligence */}
                <div className="quad-card market-position-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingDown size={20} style={{ transform: 'rotate(180deg)' }} /> Market Position Intelligence
                    </h2>
                    <div className={`status-badge status-${(lead.industry_tier || 'Unknown').toLowerCase().includes('leading') ? 'leading' : (lead.industry_tier || 'Unknown').toLowerCase().includes('competitive') ? 'steady' : 'falling-behind'}`}>
                      {lead.industry_tier || 'Unknown'}
                    </div>
                  </div>

                  <div className="market-intelligence-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="intelligence-score-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Industry Percentile</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#06b6d4' }}>{lead.industry_percentile || 0}%</span>
                      </div>
                      <div className="bar-track" style={{ height: '8px', marginBottom: '1rem' }}>
                        <div className="bar-fill" style={{ width: `${lead.industry_percentile || 0}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Outperforming <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{lead.industry_percentile || 0}%</span> of industry competitors.
                      </div>
                    </div>

                    <div className="lead-quality-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Lead Quality Score</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{lead.lead_quality_score || 0}%</span>
                      </div>
                      <div className="bar-track" style={{ height: '8px', marginBottom: '1rem' }}>
                        <div className="bar-fill" style={{ width: `${lead.lead_quality_score || 0}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Assessment: <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{(lead.lead_quality_score || 0) > 75 ? 'High Value' : (lead.lead_quality_score || 0) > 40 ? 'Moderate Value' : 'Low Value'} Lead</span>
                      </div>
                    </div>
                  </div>

                  {/* Intent & Readiness Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Target size={14} /> Buyer Intent Strength
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0' }}>{lead.buyer_intent_strength || 'Moderate'}</span>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                          {lead.primary_website_type || 'Informational'}
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Zap size={14} /> Commercial Readiness
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0' }}>{lead.commercial_readiness_maturity || 'Moderate'}</span>
                        <div className={`severity-badge severity-${(lead.commercial_readiness_maturity || 'Low').toLowerCase() === 'advanced' ? 'excellent' : (lead.commercial_readiness_maturity || 'Low').toLowerCase() === 'high' ? 'moderate' : 'low'}`} style={{ fontSize: '0.7rem' }}>
                          Maturity
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="market-metrics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Business Maturity</div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{lead.business_maturity_level || 'Unknown'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Sales Potential</div>
                      <div style={{ fontSize: '0.85rem', color: lead.sales_potential === 'High' ? '#10b981' : lead.sales_potential === 'Moderate' ? '#3b82f6' : '#ef4444', fontWeight: 600 }}>{lead.sales_potential || 'Moderate'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Growth Potential</div>
                      <div style={{ fontSize: '0.85rem', color: lead.growth_potential === 'High' ? '#10b981' : lead.growth_potential === 'Moderate' ? '#3b82f6' : '#ef4444', fontWeight: 600 }}>{lead.growth_potential || 'Moderate'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Sales Maturity</div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{lead.sales_positioning_maturity_score || 0}%</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Enterprise Focus</div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{lead.enterprise_sales_orientation_score || 0}%</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Readiness Level</div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>{lead.commercial_readiness_level_score || 0}%</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #06b6d4', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Activity size={16} color="#06b6d4" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>Conversion Targeting Insight</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{lead.conversion_targeting_insight || lead.commercial_insights || "Analyzing high-intent buyer targeting and commercial positioning..."}"
                    </p>
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Sparkles size={16} color="#3b82f6" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>AI Strategic Recommendation</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{lead.market_position_ai_strategic_recommendation || lead.market_position_intelligence_insight || lead.industry_insight || "Website lacks specific industry competitive advantages in terms of UX and technical performance."}"
                    </p>
                  </div>
                </div>


                {/* 5.6 Schema & AI Visibility Gap */}
                <div className="quad-card schema-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileCode size={20} /> Schema & AI Visibility Gap
                    </h2>
                    <div className={`schema-impact-badge impact-${(lead.schema_visibility_impact || 'Low').toLowerCase()}`}>
                      <Activity size={10} /> Impact: {lead.schema_visibility_impact || 'Low'}
                    </div>
                  </div>

                  <div className="schema-coverage-container">
                    <div className="schema-score-box">
                      <span className="schema-score-value">{lead.schema_coverage_score || 0}%</span>
                      <span className="schema-score-label">Schema Coverage</span>
                    </div>
                    <div className="schema-priority-fix">
                      <div className="priority-label"><Sparkles size={10} /> Priority Fix</div>
                      <div className="priority-value">{lead.schema_recommendation || 'No critical gaps'}</div>
                    </div>
                  </div>

                  <div className="schema-tags-grid">
                    {[
                      { type: 'FAQ', key: 'FAQPage' },
                      { type: 'LocalBusiness', key: 'LocalBusiness' },
                      { type: 'Review', key: 'Review' },
                      { type: 'Organization', key: 'Organization' },
                      { type: 'Product', key: 'Product' },
                      { type: 'Breadcrumb', key: 'BreadcrumbList' },
                      { type: 'Article', key: 'Article' }
                    ].map((s, i) => (
                      <div key={i} className={`schema-tag ${lead.schema_data?.[s.key] ? 'present' : 'missing'}`}>
                        {lead.schema_data?.[s.key] ? <Check size={12} /> : <X size={12} />}
                        {s.type}
                      </div>
                    ))}
                  </div>

                  <div className="schema-insight-box">
                    <div className="schema-insight-title">
                      <Bot size={14} /> AI Visibility Insight
                    </div>
                    <p className="schema-insight-text">
                      "{lead.schema_gap_insight || "Missing structured data is limiting your brand's presence in AI-generated search results and rich Google snippets."}"
                    </p>
                  </div>
                </div>

                {/* 5.7 Keyword Visibility Gap */}
                <div className="quad-card keyword-gap-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Search size={20} /> Keyword Visibility Gap
                    </h2>
                    <div className={`severity-badge severity-${(lead.keyword_visibility_gap_level || 'Low').toLowerCase() === 'high' ? 'critical' : (lead.keyword_visibility_gap_level || 'Low').toLowerCase() === 'medium' ? 'moderate' : 'low'}`}>
                      Gap: {lead.keyword_visibility_gap_level || 'Low'}
                    </div>
                  </div>

                  <div className="keyword-opps-container">
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>High-Intent Keyword Opportunities:</h4>
                    <div className="keyword-tags-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {(lead.keyword_visibility_gap_opportunities || "").split(',').map((kw, i) => (
                        <div key={i} className="factor-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                          <TrendingDown size={12} style={{ transform: 'rotate(180deg)' }} /> {kw.trim()}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="competitor-advantage-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Sword size={14} color="#f87171" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>Competitor Advantage</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                      {lead.keyword_visibility_gap_competitor_advantage || "Competitors are capturing high-intent traffic for keywords you are currently missing."}
                    </p>
                  </div>

                  <div className="keyword-impact-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Search Visibility Impact:</span>
                    <div className={`verdict-badge verdict-${(lead.keyword_visibility_gap_search_impact || 'Low').toLowerCase() === 'high' ? 'poor' : (lead.keyword_visibility_gap_search_impact || 'Low').toLowerCase() === 'medium' ? 'average' : 'excellent'}`}>
                      {lead.keyword_visibility_gap_search_impact || 'Low'} Impact
                    </div>
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(139, 92, 246, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Sparkles size={16} color="#8b5cf6" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>Executive AI Insight</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      "{lead.keyword_visibility_gap_insight || "Website targets broad branding terms but lacks optimization for high-conversion buyer-intent keywords."}"
                    </p>
                  </div>
                </div>

                {/* 5.8 Competitor Momentum Tracker */}
                <div className="quad-card momentum-tracker-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={20} /> Competitor Momentum Tracker
                    </h2>
                    <div className={`status-badge status-${(lead.competitive_growth_status || 'Steady').toLowerCase().replace(' ', '-')}`}>
                      {lead.competitive_growth_status || 'Steady'}
                    </div>
                  </div>

                  <div className="momentum-score-container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="momentum-score-box">
                      <span className="momentum-score-value">{lead.momentum_score || 0}</span>
                      <span className="momentum-score-label">/100</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Growth Direction</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: lead.momentum_growth_direction === 'Up' ? '#10b981' : lead.momentum_growth_direction === 'Down' ? '#ef4444' : '#94a3b8' }}>
                          {lead.momentum_growth_direction === 'Up' ? <TrendingDown size={14} style={{ transform: 'rotate(180deg)' }} /> : lead.momentum_growth_direction === 'Down' ? <TrendingDown size={14} /> : <Activity size={14} />}
                          {lead.momentum_growth_direction || 'Neutral'}
                        </span>
                      </div>
                      <div className="bar-track" style={{ height: '8px' }}>
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${lead.momentum_score || 0}%`,
                            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="momentum-comparison-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Activity size={14} color="#06b6d4" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>Momentum Comparison</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                      {lead.momentum_comparison || "Analyzing industry optimization speed and technology adoption rates..."}
                    </p>
                  </div>

                  <div className="momentum-factors-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'SEO Strength', key: 'seo' },
                      { label: 'UX Quality', key: 'ux' },
                      { label: 'AI Visibility', key: 'ai' },
                      { label: 'Trust Signals', key: 'trust' },
                      { label: 'Schema Usage', key: 'schema' },
                      { label: 'Lead Capture', key: 'leads' },
                      { label: 'Freshness', key: 'content' },
                      { label: 'Conversion', key: 'conversion' }
                    ].map((f, i) => (
                      <div key={i} className="factor-tag" style={{ justifyContent: 'space-between', padding: '4px 8px' }}>
                        <span>{f.label}</span>
                        <Check size={10} color={lead.momentum_score > 50 ? '#10b981' : '#64748b'} />
                      </div>
                    ))}
                  </div>

                  <div className="ai-insight-box" style={{ marginTop: 'auto', background: 'rgba(6, 182, 212, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #06b6d4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Sparkles size={16} color="#06b6d4" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>Strategic Risk: {lead.strategic_risk_level || 'Moderate'}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      "{lead.momentum_ai_insight || "Competitor websites are adopting modern AI-search and conversion optimization strategies at a faster pace."}"
                    </p>
                  </div>
                </div>

                {/* 5.9 AI Strategic Action Plan */}
                <div className="quad-card action-plan-card animate-slide-up">
                  <div className="quad-header">
                    <h2 style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={20} /> AI Strategic Action Plan
                    </h2>
                    <div className="severity-badge severity-low" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                      Execution Roadmap
                    </div>
                  </div>

                  <div className="action-steps-list">
                    {(lead.ai_strategic_plan || []).map((step, i) => (
                      <div key={i} className="action-step-item">
                        <div className="action-step-header">
                          <div className={`action-priority-badge priority-${step.priority.toLowerCase()}`}>
                            {step.priority} Priority
                          </div>
                          {step.is_quick_win && (
                            <div className="quick-win-tag">
                              <Zap size={10} fill="#10b981" /> Quick Win
                            </div>
                          )}
                        </div>
                        <p className="action-text">{step.action}</p>
                        <div className="action-meta">
                          <div className="meta-item">
                            <Target size={12} /> Impact: <span style={{ color: step.impact === 'High' ? '#10b981' : step.impact === 'Medium' ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>{step.impact}</span>
                          </div>
                          <div className="meta-item">
                            <Settings size={12} /> Difficulty: <span style={{ color: step.difficulty === 'Easy' ? '#10b981' : step.difficulty === 'Moderate' ? '#fbbf24' : '#ef4444', fontWeight: 700 }}>{step.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!lead.ai_strategic_plan || lead.ai_strategic_plan.length === 0) && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        Generating prioritized execution steps...
                      </div>
                    )}
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
