import { useState } from 'react';
import { Globe, Loader2, Sparkles } from 'lucide-react';
import { processSingleLead } from '../api/api';

export default function SingleLeadForm({ onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // The backend still expects all fields in the JSON payload, so we pass empty strings for the removed ones
    const payload = {
        name: '',
        email: '',
        company: '',
        role: '',
        website: url
    };
    
    try {
      const result = await processSingleLead(payload);
      onResult(result);
      
      // Keep URL or clear it? Clearing it is good UX
      setUrl('');
    } catch (err) {
      setError('Failed to analyze website. Please check your backend connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Globe size={24} color="var(--accent-color)" />
        Analyze Website
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Enter any prospect's website URL below. Our Vision Agent will screenshot it, scrape the text, and generate a customized cold email pain point.
      </p>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error-color)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
           <input 
             required 
             type="url" 
             id="website" 
             name="website" 
             value={url} 
             onChange={(e) => setUrl(e.target.value)} 
             className="input-field" 
             placeholder="https://acme.com" 
             style={{ padding: '1rem', fontSize: '1.1rem', background: 'rgba(15, 23, 42, 0.9)' }}
           />
        </div>

        <button type="submit" className="primary-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1, padding: '1rem' }}>
          {loading ? <Loader2 className="spinning" size={20} /> : <Sparkles size={20} />}
          {loading ? 'Initializing Deep Vision Analysis...' : 'Analyze Website'}
        </button>
      </form>

      <style>{`
        .spinning {
           animation: spin 1s linear infinite;
        }
        @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
