import React from 'react';

export default function Logo({ size = 36, className = "" }) {
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
          // If the text in the logo is black, this filter turns the black text to white/silver
          // while preserving the red/orange color of the logo mark.
          // We can apply it via a CSS class.
        }} 
      />
    </div>
  );
}
