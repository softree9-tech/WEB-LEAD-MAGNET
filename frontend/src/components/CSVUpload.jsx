import React, { useState, useRef } from 'react';
import { UploadCloud, File, Loader2 } from 'lucide-react';

export default function CSVUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setElapsed(0);

    // Start elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    // 30 minute timeout — enough for 9 websites
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30 * 60 * 1000);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/process/csv', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const detail = errData?.detail || `Server error: ${res.status}`;
        throw new Error(detail);
      }

      const data = await res.json();
      onResult(data.processed_leads || []);
      setFile(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Try uploading fewer URLs at once.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      clearInterval(timerRef.current);
      setElapsed(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '100%', animationDelay: '0.1s' }}>
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
        style={{ opacity: loading || !file ? 0.5 : 1, padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
        disabled={loading || !file}
      >
        {loading ? <Loader2 className="spinning" size={16} /> : <UploadCloud size={16} />}
        {loading ? ` Analyzing... ${elapsed}s` : ' Upload'}
      </button>

      {error && <div style={{ position: 'absolute', top: '-20px', color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>}
    </div>
  );
}
