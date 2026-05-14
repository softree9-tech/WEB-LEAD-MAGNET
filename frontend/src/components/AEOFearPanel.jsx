import React from 'react';
import { Bot, User, AlertCircle, CheckCircle, Search } from 'lucide-react';

const AEOFearPanel = ({ lead }) => {
  const { aeo_competitive_probe, aeo_score, aeo_status, aeo_improvement, website } = lead;
  if (!aeo_competitive_probe) return null;

  const domain = website.replace(/^https?:\/\//i, '').split('/')[0];

  return (
    <div className="aeo-fear-panel" style={{ background: '#0A0A0F', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1A1A24', marginBottom: '16px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1A1A24', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F0F0FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} color="#7C3AED" /> What AI Recommends When Customers Search
        </h3>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888AA', textTransform: 'uppercase' }}>
          AI Visibility Score: <span style={{ color: aeo_score > 70 ? '#00D4AA' : aeo_score > 40 ? '#FFB800' : '#FF2D55' }}>{aeo_score}%</span>
        </div>
      </div>

      <div style={{ padding: '20px', background: '#0D0D14' }}>
        {/* Simulated Chat Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* User Bubble */}
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#2A2A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={16} color="#8888AA" />
            </div>
            <div style={{ background: '#2A2A3A', padding: '10px 14px', borderRadius: '0 12px 12px 12px', color: '#F0F0FF', fontSize: '13px', lineHeight: 1.5 }}>
              {aeo_competitive_probe.question}
            </div>
          </div>

          {/* AI Bubble */}
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '90%' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} color="white" />
            </div>
            <div style={{ background: '#1A1A24', padding: '14px', borderRadius: '0 12px 12px 12px', color: '#F0F0FF', fontSize: '13px', lineHeight: 1.6, border: '1px solid #2A2A3A', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
              {aeo_competitive_probe.response}
            </div>
          </div>

        </div>

        {/* Verdict Banner */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          borderRadius: '8px',
          background: aeo_competitive_probe.mentioned ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 45, 85, 0.1)',
          border: `1px solid ${aeo_competitive_probe.mentioned ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 45, 85, 0.2)'}`,
          color: aeo_competitive_probe.mentioned ? '#00D4AA' : '#FF2D55',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '13px',
          animation: aeo_competitive_probe.mentioned ? 'none' : 'pulse-red-banner 2s infinite'
        }}>
          {aeo_competitive_probe.mentioned ? (
            <><CheckCircle size={16} /> ✓ {domain} appears in AI recommendations</>
          ) : (
            <><AlertCircle size={16} /> 🚨 {domain} was NOT recommended. Competitors were.</>
          )}
        </div>

        {/* Stats and Action */}
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#111118', padding: '12px', borderRadius: '8px', border: '1px solid #1A1A24' }}>
            <div style={{ fontSize: '10px', color: '#8888AA', textTransform: 'uppercase', marginBottom: '8px' }}>Visibility Status</div>
            <div style={{ fontSize: '12px', color: '#F0F0FF', lineHeight: 1.4 }}>{aeo_status}</div>
          </div>
          <div style={{ background: '#111118', padding: '12px', borderRadius: '8px', border: '1px solid #1A1A24' }}>
            <div style={{ fontSize: '10px', color: '#8888AA', textTransform: 'uppercase', marginBottom: '8px' }}>Action Item</div>
            <div style={{ fontSize: '12px', color: '#00D4AA', lineHeight: 1.4 }}>{aeo_improvement}</div>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#4A4A6A', textAlign: 'center' }}>
          "50% of search queries will go to AI assistants by the end of 2026." — Gartner
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-red-banner {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); background: rgba(255, 45, 85, 0.2); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default AEOFearPanel;
