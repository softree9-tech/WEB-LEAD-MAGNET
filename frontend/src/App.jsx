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
        <h1>Softree Lead Engine</h1>
        <p>AI-Powered Multi-Agent Lead Enrichment & Scoring</p>
      </header>

      <div className="top-controls animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <SingleLeadForm onResult={handleSingleResult} />
        <CSVUpload onResult={handleBatchResults} />
      </div>

      <div className="results-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <LeadResults leads={results} />
      </div>
    </div>
  );
}

export default App;
