import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Eye, Search, Filter, Calendar, Trash2, X, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import LeadResults from './LeadResults';
import { fetchLeads, fetchLeadDetails, deleteBulkLeads } from '../api/api';
import Toast from './Toast';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewingReport, setViewingReport] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const closeToast = () => setToast(prev => ({ ...prev, show: false }));
  
  // Bulk Management State
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingBulk, setDeletingBulk] = useState(false);

  const filters = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 1 Year', 'All Time'];

  useEffect(() => {
    loadLeads();
  }, [dateFilter, sourceFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads(dateFilter, searchTerm, sourceFilter);
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear selection when filters change
    setSelectedLeadIds([]);
  }, [dateFilter, searchTerm, sourceFilter]);

  const sourceOptions = ['All Sources', 'GEO Analyzer', 'Public Lead Magnet'];

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
      showToast('Failed to load report.', 'error');
    }
  };

  const handleDownload = (id) => {
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.open(`${baseUrl}/api/leads/download/${id}`, '_blank');
  };

  const handleExport = async () => {
    if (leads.length === 0) {
      showToast("No leads to export.", "error");
      return;
    }

    setExportLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const params = new URLSearchParams({ date_filter: dateFilter });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (sourceFilter && sourceFilter !== 'All Sources') {
        params.append('source_filter', sourceFilter);
      }
      
      const response = await fetch(`${baseUrl}/api/leads/export?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leads_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Export completed successfully', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed. Please try again', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeadIds(leads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(lid => lid !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleBulkExport = async () => {
    if (selectedLeadIds.length === 0) return;
    
    setExportLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      
      const response = await fetch(`${baseUrl}/api/leads/export-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: selectedLeadIds })
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Selected_Leads_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`${selectedLeadIds.length} reports exported successfully`, 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed. Please try again', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (selectedLeadIds.length > 10 && deleteConfirmationText !== 'DELETE') {
      return;
    }

    setDeletingBulk(true);
    try {
      const response = await deleteBulkLeads(selectedLeadIds);
      showToast(`${response.deleted_count} leads deleted successfully`, 'success');
      setDeleteModalOpen(false);
      setDeleteConfirmationText('');
      setSelectedLeadIds([]);
      loadLeads(); // Refresh list
    } catch (error) {
      showToast('Failed to delete selected leads', 'error');
    } finally {
      setDeletingBulk(false);
    }
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
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
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

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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
        
        {/* Divider */}
        <span style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />

        {/* Source Filter Dropdown */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: '6px 32px 6px 12px',
              borderRadius: '20px',
              border: `1px solid ${sourceFilter !== 'All Sources' ? '#FF6B00' : '#e2e8f0'}`,
              background: sourceFilter !== 'All Sources' ? '#FFF0E6' : '#fff',
              color: sourceFilter !== 'All Sources' ? '#FF6B00' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              outline: 'none'
            }}
          >
            {sourceOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: sourceFilter !== 'All Sources' ? '#FF6B00' : '#64748b' }} />
        </div>
      </div>

      {/* Bulk Action Bar + Active Filters — same row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Bulk Action Bar */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '10px 18px',
          background: selectedLeadIds.length > 0 ? '#eff6ff' : '#f8fafc',
          border: `1px solid ${selectedLeadIds.length > 0 ? '#bfdbfe' : '#e2e8f0'}`,
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          gap: '1.25rem'
        }}>
          <span style={{ 
            fontWeight: 600, 
            color: selectedLeadIds.length > 0 ? '#1e40af' : '#64748b',
            fontSize: '0.875rem' 
          }}>
            {selectedLeadIds.length} Selected
          </span>
            
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={handleBulkExport}
              disabled={selectedLeadIds.length === 0 || exportLoading}
              style={{
                padding: '6px 12px',
                background: selectedLeadIds.length > 0 ? 'white' : 'transparent',
                color: selectedLeadIds.length > 0 ? '#1e40af' : '#94a3b8',
                border: `1px solid ${selectedLeadIds.length > 0 ? '#bfdbfe' : '#e2e8f0'}`,
                borderRadius: '4px',
                cursor: (selectedLeadIds.length === 0 || exportLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                opacity: (selectedLeadIds.length === 0 || exportLoading) ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: selectedLeadIds.length > 0 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Download size={16} /> {exportLoading ? 'Exporting...' : 'Export Selected'}
            </button>
            
            <button 
              onClick={() => setDeleteModalOpen(true)}
              disabled={selectedLeadIds.length === 0}
              style={{
                padding: '6px 12px',
                background: selectedLeadIds.length > 0 ? '#ef4444' : 'transparent',
                color: selectedLeadIds.length > 0 ? 'white' : '#94a3b8',
                border: `1px solid ${selectedLeadIds.length > 0 ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '4px',
                cursor: selectedLeadIds.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                opacity: selectedLeadIds.length === 0 ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: selectedLeadIds.length > 0 ? '0 1px 2px rgba(239,68,68,0.2)' : 'none'
              }}
            >
              <Trash2 size={16} /> Delete Selected
            </button>

            <button 
              onClick={loadLeads}
              style={{
                padding: '6px',
                background: 'white',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              title="Refresh Leads"
              aria-label="Refresh leads"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>



        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
          <input 
            type="text" 
            placeholder="Search name, email, website..." 
            aria-label="Search leads"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', minWidth: '220px' }}
          />
          <button type="submit" aria-label="Submit search" style={{ padding: '8px 16px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
              <th style={{ padding: '12px 16px', width: '40px' }}>
                <input 
                  type="checkbox" 
                  aria-label="Select all leads"
                  checked={selectedLeadIds.length === leads.length && leads.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#FF6B00' }}
                />
              </th>
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
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading leads...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No leads found for this period.</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', background: selectedLeadIds.includes(lead.id) ? '#FFF0E6' : 'transparent' }}>
                <td style={{ padding: '12px 16px' }}>
                  <input 
                    type="checkbox" 
                    aria-label={`Select lead ${lead.name || 'Unknown'}`}
                    checked={selectedLeadIds.includes(lead.id)}
                    onChange={() => handleSelectLead(lead.id)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#FF6B00' }}
                  />
                </td>
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
                    <button onClick={() => handleViewReport(lead.id)} style={{ padding: '6px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#475569' }} title="View Report" aria-label="View report">
                      <Eye size={16} />
                    </button>
                    {lead.pdf_path && (
                      <button onClick={() => handleDownload(lead.id)} style={{ padding: '6px', cursor: 'pointer', background: '#FFF0E6', border: '1px solid #FFD1B3', borderRadius: '4px', color: '#FF6B00' }} title="Download PDF" aria-label="Download PDF report">
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '12px',
            maxWidth: '450px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle color="#ef4444" /> Confirm Deletion
              </h3>
              <button onClick={() => setDeleteModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: '#475569', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              You are about to permanently delete <strong>{selectedLeadIds.length}</strong> selected lead{selectedLeadIds.length > 1 ? 's' : ''} and their associated PDF reports. This action cannot be undone.
            </p>

            {selectedLeadIds.length > 10 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                  Please type <strong>DELETE</strong> to confirm:
                </label>
                <input 
                  type="text" 
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                  placeholder="DELETE"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={executeBulkDelete}
                disabled={deletingBulk || (selectedLeadIds.length > 10 && deleteConfirmationText !== 'DELETE')}
                style={{ 
                  padding: '8px 16px', 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 600, 
                  cursor: (deletingBulk || (selectedLeadIds.length > 10 && deleteConfirmationText !== 'DELETE')) ? 'not-allowed' : 'pointer',
                  opacity: (deletingBulk || (selectedLeadIds.length > 10 && deleteConfirmationText !== 'DELETE')) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {deletingBulk ? 'Deleting...' : 'Yes, Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
