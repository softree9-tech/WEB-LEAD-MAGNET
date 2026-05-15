import React, { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CSVUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ completed: 0, total: 0 });
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStatus({ completed: 0, total: 0 });
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/process/csv-async`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setStatus({ completed: 0, total: data.total });

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

      eventSource.onerror = () => {
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
    <div className="card h-100 shadow-none border-0 bg-transparent">
      <div className="card-body p-0 d-flex flex-column justify-content-center h-100">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 text-primary fw-bold text-nowrap">
            <UploadCloud size={18} />
            <span className="d-none d-sm-inline small uppercase tracking-wider">Batch CSV</span>
          </div>

          <div className="input-group input-group-sm">
            <input
              type="file"
              className="form-control"
              accept=".csv"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? <Loader2 className="spinning" size={14} /> : <UploadCloud size={14} />}
              <span className="ms-2 d-none d-md-inline">{loading ? 'Processing' : 'Upload'}</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-2">
            <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '10px' }}>
              <span>Analysing {status.completed} of {status.total} leads...</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && <div className="text-danger small mt-1" style={{ fontSize: '10px' }}><AlertCircle size={10} className="me-1" /> {error}</div>}
        {!loading && status.total > 0 && status.completed === status.total && (
          <div className="text-success small mt-1" style={{ fontSize: '10px' }}><CheckCircle size={10} className="me-1" /> Batch processed!</div>
        )}
      </div>
    </div>
  );
}
