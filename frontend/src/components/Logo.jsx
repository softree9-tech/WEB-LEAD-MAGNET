import React from 'react';

export default function Logo({ size = 142, className = "" }) {
  return (
    <div className={`softree-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img
        src="/softree_logo.png"
        alt="Softree Technology"
        className="softree-logo-img"
        style={{
          height: `${size}px`,
          width: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}
