import React from 'react';
import { History, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const SiteDecay = ({ lead }) => {
  const { site_age } = lead;
  if (!site_age || !site_age.wayback_available) return null;

  const { decay_level, site_age_years, days_since_update, first_seen_year } = site_age;

  const getDecayColor = (level) => {
    switch (level) {
      case 'active': return '#00D4AA';
      case 'stale': return '#FFB800';
      case 'aging': return '#FF6B35';
      case 'abandoned': return '#FF2D55';
      default: return '#8888AA';
    }
  };

  const fearStatements = {
    abandoned: "🚨 Inactive for 1+ year. Google demotes abandoned sites. Rankings decaying now.",
    aging: "⚠ 6+ months without updates signals neglect to Google and visitors.",
    stale: "Signs of staleness detected. Regular updates are critical for rankings.",
    active: "✓ Recent activity detected — positive signal for Google."
  };

  return (
    <div style={{ background: '#0A0A0F', padding: '20px', borderRadius: '12px', border: '1px solid #1A1A24', marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#8888AA', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={14} /> Site Decay Timeline
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          padding: '4px 8px',
          borderRadius: '4px',
          background: `${getDecayColor(decay_level)}20`,
          color: getDecayColor(decay_level),
          textTransform: 'uppercase',
          border: `1px solid ${getDecayColor(decay_level)}40`
        }}>
          Status: {decay_level}
        </div>
      </div>

      {/* Decay Meter */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {['active', 'stale', 'aging', 'abandoned'].map(level => (
          <div key={level} style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            background: decay_level === level ? getDecayColor(level) : '#1A1A24',
            boxShadow: decay_level === level ? `0 0 10px ${getDecayColor(level)}80` : 'none',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      {/* Age Timeline */}
      <div style={{ position: 'relative', height: '40px', marginBottom: '20px' }}>
        <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '2px', background: '#1A1A24' }} />

        {/* First Seen */}
        <div style={{ position: 'absolute', left: 0, top: 0, textAlign: 'center', transform: 'translateX(-50%)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8888AA', margin: '6px auto' }} />
          <div style={{ fontSize: '10px', color: '#4A4A6A' }}>First Seen: {first_seen_year}</div>
        </div>

        {/* Last Updated */}
        <div style={{ position: 'absolute', left: '60%', top: 0, textAlign: 'center', transform: 'translateX(-50%)' }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: getDecayColor(decay_level),
            margin: '4px auto',
            animation: decay_level === 'abandoned' || decay_level === 'aging' ? 'pulse-red 2s infinite' : 'none'
          }} />
          <div style={{ fontSize: '10px', color: '#F0F0FF' }}>Updated {days_since_update}d ago</div>
        </div>

        {/* Today */}
        <div style={{ position: 'absolute', right: 0, top: 0, textAlign: 'center', transform: 'translateX(50%)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D4AA', margin: '6px auto' }} />
          <div style={{ fontSize: '10px', color: '#4A4A6A' }}>Today</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: '#111118', padding: '12px', borderRadius: '8px', border: '1px solid #1A1A24' }}>
          <div style={{ fontSize: '10px', color: '#8888AA', marginBottom: '4px' }}>Site Age</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#F0F0FF' }}>{site_age_years} Years</div>
        </div>
        <div style={{ background: '#111118', padding: '12px', borderRadius: '8px', border: '1px solid #1A1A24' }}>
          <div style={{ fontSize: '10px', color: '#8888AA', marginBottom: '4px' }}>Inactivity Period</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: getDecayColor(decay_level) }}>{days_since_update} Days</div>
        </div>
      </div>

      <div style={{
        padding: '12px',
        borderRadius: '8px',
        background: `${getDecayColor(decay_level)}10`,
        borderLeft: `3px solid ${getDecayColor(decay_level)}`,
        fontSize: '13px',
        color: '#F0F0FF',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {decay_level === 'active' ? <CheckCircle size={16} color="#00D4AA" /> : <AlertCircle size={16} color={getDecayColor(decay_level)} />}
        {fearStatements[decay_level]}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(255, 45, 85, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 45, 85, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 45, 85, 0); }
        }
      `}} />
    </div>
  );
};

export default SiteDecay;
