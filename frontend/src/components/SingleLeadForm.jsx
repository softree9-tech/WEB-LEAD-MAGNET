import React, { useState } from 'react';
import { Globe, Sparkles, Loader2 } from 'lucide-react';
import { processSingleLead } from "../api/api"

export default function SingleLeadForm({ onResult }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // try {
    //   const res = await fetch('http://localhost:8000/api/process/single', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       name: 'Unknown',
    //       email: 'unknown@example.com',
    //       company: 'Unknown',
    //       role: 'Unknown',
    //       website: url
    //     })
    //   });

    //   if (!res.ok) throw new Error('Analysis failed');

    //   const data = await res.json();
    //   onResult(data);
    //   setUrl('');
    // } catch (err) {
    //   setError(err.message);
    // } finally {
    //   setLoading(false);
    // }
    try {
      const data = await processSingleLead({
        name: 'Unknown',
        email: 'unknown@example.com',
        company: 'Unknown',
        role: 'Unknown',
        website: url
      });

      onResult(data);
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
        <Globe size={18} color="var(--accent-color)" />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Analyze Website</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, margin: 0, width: '100%' }}>
        <input
          required
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-field"
          placeholder="https://acme.com"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(15, 23, 42, 0.9)', flexGrow: 1, margin: 0 }}
        />
        <button type="submit" className="primary-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1, padding: '0.5rem 1rem', whiteSpace: 'nowrap', minWidth: '130px' }}>
          {loading ? <Loader2 className="spinning" size={16} /> : <Sparkles size={16} />}
          {loading ? ' Analyzing...' : ' Analyze'}
        </button>
      </form>

      {error && <div style={{ position: 'absolute', top: '-20px', color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>}
    </div>
  );
}
