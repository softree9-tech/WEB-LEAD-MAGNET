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

    try {
      const data = await processSingleLead({
        name: 'Prospect',
        email: 'prospect@example.com',
        company: url.replace(/^https?:\/\//i, '').split('/')[0],
        role: 'Owner',
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
    <div className="card h-100 shadow-none border-0 bg-transparent">
      <div className="card-body p-0 d-flex align-items-center gap-3 h-100">
        <div className="d-flex align-items-center gap-2 text-primary fw-bold text-nowrap">
          <Globe size={18} />
          <span className="d-none d-sm-inline small uppercase tracking-wider">Analyze Website</span>
        </div>

        <form onSubmit={handleSubmit} className="d-flex gap-2 flex-grow-1">
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="form-control form-control-sm border-2"
            placeholder="Enter website URL (e.g. https://example.com)"
            style={{ borderRadius: '8px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm px-4" disabled={loading}>
            {loading ? <Loader2 className="spinning me-2" size={14} /> : <Sparkles className="me-2" size={14} />}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {error && <div className="position-absolute text-danger x-small" style={{ top: '-15px' }}>{error}</div>}
      </div>
    </div>
  );
}
