import React, { useState } from 'react';
import {
  LayoutDashboard, AlertTriangle, TrendingUp, FileText, Sparkles, FileCode,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import Logo from './Logo';
import '../ViewportDashboard.css';

/**
 * ViewportDashboard
 * 
 * Wraps LeadResults card sections into a multi-screen viewport-based
 * navigation shell. Each screen groups related analytics cards.
 */

const SCREEN_CONFIG = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    title: 'Executive Presence & Overview',
  },
  {
    id: 'top-issues',
    label: 'Top Issues',
    icon: AlertTriangle,
    title: 'Critical UX & Revenue Issues',
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: TrendingUp,
    title: 'Conversion & Market Opportunities',
  },
  {
    id: 'detailed-analysis',
    label: 'Detailed Analysis',
    icon: FileText,
    title: 'Trust, SEO & Schema Analysis',
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    icon: Sparkles,
    title: 'Strategic Action Plan',
  },
  {
    id: 'technical-insights',
    label: 'Technical Insights',
    icon: FileCode,
    title: 'AI Search Visibility & Momentum',
  }
];

export default function ViewportDashboard({ children, hasBattleCard = false, website = '' }) {
  const [activeScreen, setActiveScreen] = useState(0);

  // Parse children into named sections
  const childArray = React.Children.toArray(children);

  // Map section IDs to child indices
  const offset = hasBattleCard ? 1 : 0;
  const battleCard = hasBattleCard ? childArray[0] : null;

  const sectionMap = {
    'executive-presence': childArray[offset + 0],    // Executive Presence Intelligence
    'mobile-walkthrough': childArray[offset + 1],     // Mobile Experience Walkthrough
    'ux-scorecard': childArray[offset + 2],           // Rebranding UX Scorecard
    'trust-intelligence': childArray[offset + 3],     // AI Trust Intelligence
    'seo-score': childArray[offset + 4],              // Google SEO Score
    'revenue-impact': childArray[offset + 5],         // Revenue Impact Forecast
    'conversion-opportunity': childArray[offset + 6], // Conversion Opportunity Intelligence
    'market-position': childArray[offset + 7],        // Market Position Intelligence
    'schema-gap': childArray[offset + 8],             // Schema & AI Visibility Gap
    'keyword-gap': childArray[offset + 9],            // Keyword Visibility Gap
    'momentum-tracker': childArray[offset + 10],      // Competitor Momentum Tracker
    'action-plan': childArray[offset + 11],           // AI Strategic Action Plan
    'ai-search-visibility': childArray[offset + 12],  // AI Search Visibility & Ranking
  };

  const screens = [
    {
      ...SCREEN_CONFIG[0],
      cards: [
        { section: sectionMap['executive-presence'], grid: 'full' },
        { section: sectionMap['mobile-walkthrough'], grid: 'full' },
      ]
    },
    {
      ...SCREEN_CONFIG[1],
      cards: [
        { section: sectionMap['ux-scorecard'], grid: 'half' },
        { section: sectionMap['revenue-impact'], grid: 'half' },
      ]
    },
    {
      ...SCREEN_CONFIG[2],
      cards: [
        { section: sectionMap['conversion-opportunity'], grid: 'full' },
        { section: sectionMap['market-position'], grid: 'full' },
      ]
    },
    {
      ...SCREEN_CONFIG[3],
      cards: [
        { section: sectionMap['trust-intelligence'], grid: 'half' },
        { section: sectionMap['seo-score'], grid: 'half' },
        { section: sectionMap['schema-gap'], grid: 'full' },
      ]
    },
    {
      ...SCREEN_CONFIG[4],
      cards: [
        { section: sectionMap['keyword-gap'], grid: 'half' },
        { section: sectionMap['action-plan'], grid: 'half' },
      ]
    },
    {
      ...SCREEN_CONFIG[5],
      cards: [
        { section: sectionMap['ai-search-visibility'], grid: 'full' },
        { section: sectionMap['momentum-tracker'], grid: 'full' },
      ]
    }
  ];

  const currentScreen = screens[activeScreen];
  const Icon = SCREEN_CONFIG[activeScreen].icon;

  const displayWebsite = website ? website.replace(/^https?:\/\//i, '').replace(/\/$/, '') : 'example.com';

  return (
    <div className="viewport-dashboard-shell">
      {/* ── EXPANDED SIDEBAR NAV ── */}
      <nav className="vp-sidebar" aria-label="Dashboard Navigation">
        <div className="vp-sidebar-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size={28} />
        </div>

        <div className="vp-sidebar-domain-card">
          <div className="domain-label">AUDIT REPORT</div>
          <div className="domain-url" title={website}>{displayWebsite}</div>
        </div>

        <div className="vp-nav-list">
          {SCREEN_CONFIG.map((screen, idx) => {
            const NavIcon = screen.icon;
            const isActive = activeScreen === idx;
            return (
              <button
                key={screen.id}
                className={`vp-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveScreen(idx)}
                aria-label={screen.label}
              >
                <NavIcon size={18} className="vp-nav-icon" />
                <span className="vp-nav-label">{screen.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="vp-main-area">
        {/* Battle card always on screen 1 if present */}
        {activeScreen === 0 && battleCard && (
          <div style={{ marginBottom: '1.5rem' }}>
            {battleCard}
          </div>
        )}

        {/* Screen Header */}
        <div className="vp-screen-header">
          <div className="vp-screen-title">
            <span className="screen-num">{activeScreen + 1}</span>
            <Icon size={16} style={{ color: '#FF6B00' }} />
            {currentScreen.title}
          </div>
          <div className="vp-screen-pagination">
            <button
              onClick={() => setActiveScreen(prev => Math.max(0, prev - 1))}
              disabled={activeScreen === 0}
              aria-label="Previous screen"
            >
              <ChevronLeft size={14} />
            </button>
            <span>{activeScreen + 1} / {screens.length}</span>
            <button
              onClick={() => setActiveScreen(prev => Math.min(screens.length - 1, prev + 1))}
              disabled={activeScreen === screens.length - 1}
              aria-label="Next screen"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Screen Content */}
        <div className="vp-screen" key={activeScreen}>
          {currentScreen.cards.some(c => c.grid === 'half') ? (
            <div className="vp-card-grid-2">
              {currentScreen.cards.map((card, i) => (
                <div key={i} className={card.grid === 'full' ? 'vp-card-full' : ''}>
                  {card.section}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {currentScreen.cards.map((card, i) => (
                <div key={i}>{card.section}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
