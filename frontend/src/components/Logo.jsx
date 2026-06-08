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
          fontSize: '1.25rem', 
          fontWeight: 900, 
          letterSpacing: '-0.5px', 
          marginBottom: '2px',
          background: 'linear-gradient(90deg, #FF6B00, #0a0a1a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>SOFTREE</strong>
        <span style={{ 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          letterSpacing: '1px',
          background: 'linear-gradient(90deg, #FF6B00, #0a0a1a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>TECHNOLOGY</span>
      </div>
    </div>
  );
}
