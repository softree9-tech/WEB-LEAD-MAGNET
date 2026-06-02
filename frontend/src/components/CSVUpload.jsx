import React, { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, ShieldAlert } from 'lucide-react';

export default function CSVUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/process`
    : import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/api/process`
      : 'http://localhost:8000/api/process';

  const countRows = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        resolve(Math.max(0, lines.length - 1));
      };
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setProcessedCount(0);
    setSkippedCount(0);
    
    try {
      const rows = await countRows(file);
      setTotalRows(rows);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep partial line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const result = JSON.parse(line);
              if (result.error && !result.website) {
                // Only skip results that are pure error objects without website data
                console.error("Result error:", result.error);
              } else {
                // Track validation-failed rows separately
                if (result.validation_failed) {
                  setSkippedCount(prev => prev + 1);
                }
                // Pass through all results including error_detail results
                // (they now have complete fallback structures from the backend)
                onResult([result]);
                setProcessedCount(prev => prev + 1);
              }
            } catch (e) {
              console.error("Failed to parse stream line:", e);
            }
          }
        }
      }

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ position: 'relative', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', animationDelay: '0.1s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <UploadCloud size={18} color="var(--accent-color)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Batch CSV</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            style={{ fontSize: '0.8rem', flexGrow: 1, color: 'var(--text-secondary)' }}
          />

          {file && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <File size={14} /> {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        <button
          onClick={handleUpload}
          className="primary-btn"
          style={{ opacity: loading || !file ? 0.5 : 1, padding: '0.5rem 1rem', minWidth: '140px', whiteSpace: 'nowrap' }}
          disabled={loading || !file}
        >
          {loading ? <Loader2 className="spinning" size={16} /> : <UploadCloud size={16} />}
          {loading 
            ? totalRows > 0 
              ? ` Analyzing... ${processedCount}/${totalRows}` 
              : ` Analyzing...`
            : ' Upload'}
        </button>
      </div>

      {/* Validation skip info banner */}
      {loading && skippedCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#fbbf24',
          background: 'rgba(251, 191, 36, 0.06)',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          padding: '5px 10px',
          borderRadius: '6px'
        }}>
          <ShieldAlert size={13} />
          <span>{skippedCount} website{skippedCount > 1 ? 's' : ''} failed validation — skipped AI analysis</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#ef4444',
          fontSize: '0.75rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '5px 10px',
          borderRadius: '6px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
