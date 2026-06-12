import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Eye, Search, Filter, Calendar } from 'lucide-react';
import LeadResults from './LeadResults';
import { fetchLeads, fetchLeadDetails } from '../api/api';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewingReport, setViewingReport] = useState(false);

  const filters = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 1 Year', 'All Time'];

  useEffect(() => {
    loadLeads();
  }, [dateFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads(dateFilter, searchTerm);
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadLeads();
  };

  const handleViewReport = async (id) => {
    try {
      const details = await fetchLeadDetails(id);
      setSelectedLead(details.json_data);
      setViewingReport(true);
    } catch (err) {
      console.error('Failed to fetch report details', err);
      alert('Failed to load report.');
    }
  };

  const handleDownload = (id) => {
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.open(`${baseUrl}/api/leads/download/${id}`, '_blank');
  };

  if (viewingReport && selectedLead) {
    return (
      <div className="lead-management-container">
        <button onClick={() => setViewingReport(false)} style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 16px', background: '#FF6B00', color: 'white', border: 'none', borderRadius: '4px' }}>
          &larr; Back to Leads
        </button>
        <LeadResults leads={[selectedLead]} />
      </div>
    );
  }

  // Analytics Cards
  const totalLeads = leads.length;
  const geoLeads = leads.filter(l => l.source === 'GEO Analyzer').length;
  const publicLeads = leads.filter(l => l.source !== 'GEO Analyzer').length;

  return (
    <div className="lead-management-container animate-fade-in" style={{ marginTop: '2rem', background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>Lead Management</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Total Leads</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{totalLeads}</div>
        </div>
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>GEO Leads</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{geoLeads}</div>
        </div>
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Public Leads</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{publicLeads}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: `1px solid ${dateFilter === f ? '#FF6B00' : '#e2e8f0'}`,
                background: dateFilter === f ? '#FFF0E6' : '#fff',
                color: dateFilter === f ? '#FF6B00' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {f}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Search name, email, website..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', minWidth: '250px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Name / Email</th>
              <th style={{ padding: '12px 16px' }}>Website</th>
              <th style={{ padding: '12px 16px' }}>Source</th>
              <th style={{ padding: '12px 16px' }}>Visibility</th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading leads...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No leads found for this period.</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
                  {new Date(lead.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}<br/>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 'normal' }}>{new Date(lead.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{lead.name || 'Unknown'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{lead.email}</div>
                </td>
                <td style={{ padding: '12px 16px', color: '#3b82f6' }}>
                  <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {lead.website}
                  </a>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: lead.source === 'GEO Analyzer' ? '#ecfdf5' : '#eff6ff',
                    color: lead.source === 'GEO Analyzer' ? '#059669' : '#2563eb'
                  }}>
                    {lead.source}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                  {lead.visibility_score}/100
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleViewReport(lead.id)} style={{ padding: '6px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#475569' }} title="View Report">
                      <Eye size={16} />
                    </button>
                    {lead.pdf_path && (
                      <button onClick={() => handleDownload(lead.id)} style={{ padding: '6px', cursor: 'pointer', background: '#FFF0E6', border: '1px solid #FFD1B3', borderRadius: '4px', color: '#FF6B00' }} title="Download PDF">
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
