import { useState } from 'react';
import SingleLeadForm from './components/SingleLeadForm';
import CSVUpload from './components/CSVUpload';
import LeadResults from './components/LeadResults';
import './App.css';

function App() {
  const [results, setResults] = useState([]);

  const handleSingleResult = (newResult) => {
    // Check if newResult has the output_row or is directly the result
    const processed = newResult.output_row || newResult;
    setResults(prev => [processed, ...prev]);
  };

  const handleBatchResults = (newResults) => {
    setResults(prev => [...newResults, ...prev]);
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <h1>Antigravity Lead Engine</h1>
        <p>AI-Powered Multi-Agent Lead Enrichment & Scoring</p>
      </header>

      <div className="grid-layout">
        <div style={{ display: 'grid', gap: '2rem', alignContent: 'start' }}>
          <SingleLeadForm onResult={handleSingleResult} />
          <CSVUpload onResult={handleBatchResults} />
        </div>
        
        <div style={{ alignContent: 'start' }}>
           <LeadResults leads={results} />
        </div>
      </div>
    </div>
  );
}

export default App;
