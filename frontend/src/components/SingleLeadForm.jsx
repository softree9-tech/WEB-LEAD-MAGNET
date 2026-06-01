import React, { useState } from 'react';
import { Globe, Sparkles, Loader2, Sword } from 'lucide-react';
import { processSingleLead, processBattle } from "../api/api"

export default function SingleLeadForm({ onResult }) {
  const [url, setUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let data;
      if (isBattleMode && competitorUrl) {
        data = await processBattle({
          primary_website: url,
          competitor_website: competitorUrl
        });
      } else {
        data = await processSingleLead({
          name: 'Unknown',
          email: 'unknown@example.com',
          company: 'Unknown',
          role: 'Unknown',
          website: url
        });
      }

      onResult(data);
      setUrl('');
      setCompetitorUrl('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <Globe size={18} color="var(--accent-color)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Analyze Website</span>
        </div>
        
        <button 
          onClick={() => setIsBattleMode(!isBattleMode)}
          aria-pressed={isBattleMode}
          className={`action-btn ${isBattleMode ? 'active' : ''}`}
          style={{ 
            fontSize: '0.75rem', 
            padding: '4px 8px', 
            background: isBattleMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
            color: isBattleMode ? '#ef4444' : 'var(--text-secondary)',
            border: `1px solid ${isBattleMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Sword size={12} />
          {isBattleMode ? 'Competitor Mode Active' : 'Add Competitor Battle'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: isBattleMode ? 'column' : 'row', gap: '0.5rem', margin: 0, width: '100%' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, flexDirection: isBattleMode ? 'column' : 'row' }}>
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-field"
            aria-label={isBattleMode ? "Primary Website URL" : "Website URL to Analyze"}
            placeholder={isBattleMode ? "Primary Website (https://acme.com)" : "https://acme.com"}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(15, 23, 42, 0.9)', flexGrow: 1, margin: 0 }}
          />
          
          {isBattleMode && (
            <input
              required
              type="url"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              className="input-field animate-slide-up"
              aria-label="Competitor Website URL"
              placeholder="Competitor Website (https://competitor.com)"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(15, 23, 42, 0.9)', flexGrow: 1, margin: 0, borderColor: 'rgba(239, 68, 68, 0.3)' }}
            />
          )}
        </div>

        <button type="submit" className="primary-btn" disabled={loading} style={{ 
          opacity: loading ? 0.7 : 1, 
          padding: '0.5rem 1rem', 
          whiteSpace: 'nowrap', 
          minWidth: isBattleMode ? '100%' : '130px',
          background: isBattleMode ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'var(--accent-gradient)',
          boxShadow: isBattleMode ? '0 4px 15px rgba(239, 68, 68, 0.3)' : 'var(--accent-shadow)'
        }}>
          {loading ? <Loader2 className="spinning" size={16} /> : (isBattleMode ? <Sword size={16} /> : <Sparkles size={16} />)}
          {loading ? ' Analyzing...' : (isBattleMode ? ' Start Competitor Battle' : ' Analyze')}
        </button>
      </form>

      {error && <div role="alert" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}
