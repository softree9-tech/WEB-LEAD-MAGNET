import { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, X } from 'lucide-react';
import { processCSV } from '../api/api';

export default function CSVUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    setError('');
    if (file && file.name.endsWith('.csv')) {
      setFile(file);
    } else {
      setError('Please upload a valid .csv file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const result = await processCSV(file);
      onResult(result.processed_leads || []);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError('Failed to process CSV. Make sure your backed is running and file format is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', animationDelay: '0.1s' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UploadCloud size={24} color="var(--accent-color)" />
        Batch Process CSV
      </h2>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error-color)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {!file ? (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'var(--input-bg)'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <UploadCloud size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ margin: '0 0 0.5rem', fontWeight: '500' }}>Drop your CSV file here</p>
          <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>or click to browse</p>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div style={{ 
          background: 'var(--input-bg)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                <File color="var(--accent-color)" size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontWeight: '500', wordBreak: 'break-all' }}>{file.name}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)} 
              disabled={loading}
              style={{ background: 'transparent', padding: '0.5rem', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>
          
          <button 
            onClick={handleUpload} 
            className="primary-btn" 
            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? <Loader2 className="spinning" size={20} /> : <UploadCloud size={20} />}
            {loading ? 'Processing File...' : 'Upload & Process'}
          </button>
        </div>
      )}

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
