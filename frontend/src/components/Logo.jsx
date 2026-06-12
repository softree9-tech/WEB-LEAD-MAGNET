import React from 'react';

export default function Logo({ size = 32, className = "" }) {
  return (
    <div className={`softree-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <img
        src="/softree_icon.png"
        alt="Softree Technology Logo"
        className="softree-logo-img"
        style={{
          height: `${size}px`,
          width: 'auto',
          display: 'block',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
        <strong style={{
          fontSize: '1.1rem',
          fontWeight: 900,
          letterSpacing: '0.5px',
          marginBottom: '1px',
          color: '#000000',
          display: 'inline-block'
        }}>SOFTREE</strong>
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 1000,
          letterSpacing: '0.5px',
          color: '#000000',
          display: 'inline-block'
        }}>TECHNOLOGY</span>
      </div>
    </div>
  );
}
