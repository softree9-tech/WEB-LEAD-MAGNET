import React, { useState, useEffect } from 'react';
import { Clock, Smartphone, UserX, Search, Copy, Check } from 'lucide-react';

const RevenueLeak = ({ lead }) => {
  const { revenue_leak, website } = lead;
  if (!revenue_leak || revenue_leak.total_monthly_leak === 0) return null;

  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let start = 0;
    const end = revenue_leak.total_monthly_leak;
    if (start === end) return;

    let totalDuration = 1500;
    let incrementTime = Math.abs(Math.floor(totalDuration / end));

    let timer = setInterval(() => {
      start += 10; // Increment faster for large numbers
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, Math.max(incrementTime, 10));

    return () => clearInterval(timer);
  }, [revenue_leak.total_monthly_leak]);

  const copyForProspect = () => {
    const topIssues = Object.entries(revenue_leak.breakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([key]) => key.replace('_', ' '));

    const text = `Quick audit of ${website}: We estimate your website is costing ~$${revenue_leak.total_monthly_leak.toLocaleString()}/mo due to: ${topIssues.join(' and ')}. Free 15-min call to fix this?`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="revenue-leak-container" style={{
      background: 'linear-gradient(135deg, #1A0A0F 0%, #0A0A0F 100%)',
      borderBottom: '1px solid #2A0A12',
      padding: '24px',
      marginBottom: '16px',
      borderRadius: '8px 8px 0 0'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8888AA', marginBottom: '8px' }}>
          Estimated Monthly Revenue Leak
        </h2>
        <div style={{ fontSize: '72px', fontWeight: 800, color: '#FF2D55', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          ${count.toLocaleString()}
        </div>
        <p style={{ fontSize: '14px', color: '#8888AA', marginTop: '8px' }}>
          {revenue_leak.disclaimer}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <LeakCard icon={<Clock size={16} />} name="Slow Load" amount={revenue_leak.breakdown.slow_load} />
        <LeakCard icon={<Smartphone size={16} />} name="Mobile UX" amount={revenue_leak.breakdown.mobile_ux} />
        <LeakCard icon={<UserX size={16} />} name="No Lead Capture" amount={revenue_leak.breakdown.no_lead_capture} />
        <LeakCard icon={<Search size={16} />} name="SEO Invisibility" amount={revenue_leak.breakdown.seo_invisibility} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A0A12', paddingTop: '16px' }}>
        <div style={{ fontSize: '12px', color: '#4A4A6A' }}>
          Annual Projection: <span style={{ color: '#FF2D55', fontWeight: 700 }}>${(revenue_leak.total_monthly_leak * 12).toLocaleString()}/year</span>
        </div>
        <button
          onClick={copyForProspect}
          style={{
            background: copied ? '#00D4AA' : '#FF2D55',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy for Prospect'}
        </button>
      </div>
    </div>
  );
};

const LeakCard = ({ icon, name, amount }) => (
  <div style={{ background: '#2A0A12', padding: '12px', borderRadius: '6px', border: '1px solid #3A1018' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8888AA', marginBottom: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
      {icon} {name}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 700, color: '#F0F0FF' }}>
      ${(amount || 0).toLocaleString()}
    </div>
  </div>
);

export default RevenueLeak;
