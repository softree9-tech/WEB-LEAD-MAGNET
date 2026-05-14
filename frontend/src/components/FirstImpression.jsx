import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react';

const FirstImpression = ({ lead }) => {
  const { first_impression } = lead;
  if (!first_impression) return null;

  const [ringOffset, setRingOffset] = useState(251.2); // Circumference for r=40
  const score = first_impression.score;

  useEffect(() => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 10) * circumference;
    const timer = setTimeout(() => setRingOffset(offset), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (s) => {
    if (s <= 3) return '#FF2D55';
    if (s <= 6) return '#FF6B35';
    if (s <= 8) return '#FFB800';
    return '#00D4AA';
  };

  return (
    <div style={{ background: '#0A0A0F', padding: '24px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #1A1A24' }}>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Score Ring */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1A1A24" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke={getScoreColor(score)}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#F0F0FF' }}>{score}</div>
              <div style={{ fontSize: '10px', color: '#8888AA', textTransform: 'uppercase' }}>/ 10</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#8888AA', marginTop: '8px', letterSpacing: '0.1em' }}>
            First Impression
          </div>
        </div>

        {/* Verdict */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{
            background: '#111118',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: `4px solid ${getScoreColor(score)}`,
            fontStyle: 'italic',
            fontSize: '18px',
            color: '#F0F0FF',
            marginBottom: '16px'
          }}>
            "{first_impression.verdict}"
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#FF2D55', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} /> Trust Killers
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {first_impression.trust_killers.map((k, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#8888AA', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <XCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> {k}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#00D4AA', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Trust Builders
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {first_impression.trust_builders.length > 0 ? (
                  first_impression.trust_builders.map((b, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#8888AA', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> {b}
                    </li>
                  ))
                ) : (
                  <li style={{ fontSize: '13px', color: '#4A4A6A', fontStyle: 'italic' }}>None detected</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Would Contact Banner */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        borderRadius: '6px',
        background: first_impression.would_contact ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 45, 85, 0.1)',
        border: `1px solid ${first_impression.would_contact ? 'rgba(0, 212, 170, 0.2)' : 'rgba(255, 45, 85, 0.2)'}`,
        color: first_impression.would_contact ? '#00D4AA' : '#FF2D55',
        fontSize: '14px',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        {first_impression.would_contact ? (
          "✓ Passes minimum bar — but competitors likely score higher"
        ) : (
          "⚠ A typical visitor would NOT contact this business based on first impression"
        )}
      </div>
    </div>
  );
};

export default FirstImpression;
