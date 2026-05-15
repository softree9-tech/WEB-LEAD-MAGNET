import { useState, useEffect } from 'react';
import SingleLeadForm from './components/SingleLeadForm';
import CSVUpload from './components/CSVUpload';
import LeadResults from './components/LeadResults';
import './App.css';

function App() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const keepAlive = () => {
      fetch(`${apiUrl}/health`).catch(() => {});
    };
    const interval = setInterval(keepAlive, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const handleSingleResult = (newResult) => {
    const processed = newResult.output_row || newResult;
    setResults(prev => [processed, ...prev]);
  };

  const handleBatchResults = (newResults) => {
    setResults(prev => [...newResults, ...prev]);
  };

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        {/* Sidebar Menu */}
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme shadow-sm">
          <div className="app-brand demo py-4 px-4">
            <a href="/" className="app-brand-link gap-2">
              <span className="app-brand-logo demo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <circle cx="16" cy="16" r="16" fill="#696cff" />
                   <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="app-brand-text demo menu-text fw-bolder ms-2 text-capitalize fs-4" style={{ letterSpacing: '-0.5px' }}>ProspectIQ</span>
            </a>
          </div>

          <div className="menu-inner-shadow"></div>

          <ul className="menu-inner py-1">
            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Main Menu</span>
            </li>
            <li className="menu-item active">
              <a href="/" className="menu-link">
                <i className="menu-icon tf-icons bx bx-home-circle"></i>
                <div className="text-truncate">Dashboard</div>
              </a>
            </li>
            <li className="menu-item">
              <a href="#" className="menu-link">
                <i className="menu-icon tf-icons bx bx-user"></i>
                <div className="text-truncate">My Leads</div>
              </a>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Settings</span>
            </li>
            <li className="menu-item">
              <a href="#" className="menu-link">
                <i className="menu-icon tf-icons bx bx-cog"></i>
                <div className="text-truncate">Config</div>
              </a>
            </li>
          </ul>
        </aside>

        {/* Layout page */}
        <div className="layout-page">
          {/* Top Navbar */}
          <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar" style={{ zIndex: 10 }}>
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
              <a className="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
                <i className="bx bx-menu bx-sm"></i>
              </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center w-100" id="navbar-collapse">
              <div className="row w-100 align-items-center">
                <div className="col-md-5">
                   <SingleLeadForm onResult={handleSingleResult} />
                </div>
                <div className="col-md-1 text-center d-none d-md-block">
                   <div className="vr h-100 mx-auto" style={{ height: '30px' }}></div>
                </div>
                <div className="col-md-6">
                   <CSVUpload onResult={handleBatchResults} />
                </div>
              </div>
            </div>
          </nav>

          {/* Content wrapper */}
          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <div className="row mb-4">
                 <div className="col-12">
                    <h4 className="fw-bold py-3 mb-0">Lead Generation <span className="text-muted fw-light">/ Analytics Dashboard</span></h4>
                 </div>
              </div>

              <LeadResults leads={results} />
            </div>

            {/* Footer */}
            <footer className="content-footer footer bg-footer-theme">
              <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
                <div className="mb-2 mb-md-0 small">
                  © {new Date().getFullYear()}, <strong>ProspectIQ Lead Engine</strong>. Built for Digital Agencies.
                </div>
                <div>
                   <a href="#" className="footer-link me-4 small">Documentation</a>
                   <a href="#" className="footer-link small">Support</a>
                </div>
              </div>
            </footer>

            <div className="content-backdrop fade"></div>
          </div>
        </div>
      </div>
      <div className="layout-overlay layout-menu-toggle"></div>
    </div>
  );
}

export default App;
