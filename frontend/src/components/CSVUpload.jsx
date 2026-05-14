import React, { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CSVUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState({ completed: 0, total: 0 });
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setJobId(null);
    setStatus({ completed: 0, total: 0 });
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Call the NEW async endpoint
      const response = await fetch(`${API_BASE_URL}/api/process/csv-async`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setJobId(data.job_id);
      setStatus({ completed: 0, total: data.total });

      // Connect to SSE stream
      const eventSource = new EventSource(`${API_BASE_URL}/api/jobs/${data.job_id}/stream`);

      eventSource.addEventListener('result', (event) => {
        const result = JSON.parse(event.data);
        onResult([result]);
      });

      eventSource.addEventListener('progress', (event) => {
        const progress = JSON.parse(event.data);
        setStatus({ completed: progress.completed, total: progress.total });
      });

      eventSource.addEventListener('done', (event) => {
        const finalStatus = JSON.parse(event.data);
        setStatus({ completed: finalStatus.completed, total: finalStatus.total });
        setLoading(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        eventSource.close();
      });

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        // Don't necessarily stop loading, as the job might still be running on server
        // but we've lost connection. In a real app, we'd try to reconnect.
        if (eventSource.readyState === EventSource.CLOSED) {
           setError("Connection lost. Job may still be processing.");
           setLoading(false);
        }
      };

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const progressPercent = status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ position: 'relative', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', animationDelay: '0.1s', minWidth: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
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
            disabled={loading}
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
          style={{ opacity: loading || !file ? 0.5 : 1, padding: '0.5rem 1rem', minWidth: '120px', whiteSpace: 'nowrap' }}
          disabled={loading || !file}
        >
          {loading ? <Loader2 className="spinning" size={16} /> : <UploadCloud size={16} />}
          {loading ? ' Processing' : ' Upload'}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span>Processing leads...</span>
            <span>{status.completed} / {status.total} ({progressPercent}%)</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                width: `${progressPercent}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}

      {!loading && status.total > 0 && status.completed === status.total && (
        <div style={{ color: '#10b981', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={12} /> Batch complete! {status.total} sites analyzed.
        </div>
      )}
    </div>
  );
}
