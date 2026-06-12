import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SingleLeadForm from './components/SingleLeadForm';
import CSVUpload from './components/CSVUpload';
import LeadResults from './components/LeadResults';
import PublicAnalyze from './pages/PublicAnalyze';
import GeoLanding from './pages/GeoLanding';
import LeadManagement from './components/LeadManagement';
import './App.css';

function Dashboard() {
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'manual'

  const handleSingleResult = (newResult) => {
    // Check if newResult has the output_row or is directly the result
    const processed = newResult.output_row || newResult;
    setResults(prev => [processed, ...prev]);
  };

  const handleBatchResults = (newResults) => {
    // Filter out any malformed results that might cause rendering crashes
    const validResults = (newResults || []).filter(r => r && typeof r === 'object' && r.website);
    if (validResults.length > 0) {
      setResults(prev => [...validResults, ...prev]);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in" style={{ paddingBottom: '0' }}>
        <h1>Softree Lead Engine</h1>
        <p>AI-Powered Multi-Agent Lead Enrichment & Scoring</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => setActiveTab('leads')}
            style={{
              padding: '10px 20px', background: activeTab === 'leads' ? '#1e293b' : 'transparent',
              color: activeTab === 'leads' ? 'white' : '#64748b', border: 'none', borderRadius: '8px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Lead Management
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '10px 20px', background: activeTab === 'manual' ? '#1e293b' : 'transparent',
              color: activeTab === 'manual' ? 'white' : '#64748b', border: 'none', borderRadius: '8px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Manual Testing & Batch
          </button>
        </div>
      </header>
 
      {activeTab === 'leads' ? (
        <LeadManagement />
      ) : (
        <>
          <div className="top-controls animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <SingleLeadForm onResult={handleSingleResult} />
            <CSVUpload onResult={handleBatchResults} />
          </div>
     
          <div className="results-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <LeadResults leads={results} />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicAnalyze />} />
        <Route path="/geo" element={<GeoLanding />} />
        <Route path="/analyzer" element={<Dashboard />} />
        <Route path="/analyzer/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
