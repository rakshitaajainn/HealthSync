import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { reportAPI, aiAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import ReportCard from '../components/ReportCard';
import StateNotice from '../components/StateNotice';

function Reports() {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [token]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportAPI.getReports();
      setReports(response.data.reports || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load reports.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Delete this report permanently?')) {
      try {
        await reportAPI.deleteReport(reportId);
        setReports(prev => prev.filter(r => r._id !== reportId));
      } catch (err) {
        alert(getErrorMessage(err, 'Failed to delete report.'));
      }
    }
  };

  const handleAnalyze = async (reportId) => {
    try {
      await aiAPI.analyzeReport(reportId);
      fetchReports();
    } catch (err) {
      alert(getErrorMessage(err, 'Analysis failed.'));
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return (r.status || 'pending').toLowerCase() === filter;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Health Reports</h1>
          <p className="page-subtitle">View and manage your uploaded medical documents.</p>
        </div>
        
        <div className="flex gap-1">
          <select 
            className="form-select" 
            style={{ width: 'auto' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
            <option value="analyzed">Analyzed</option>
          </select>
          <button onClick={fetchReports} className="btn btn-ghost" title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <StateNotice variant="loading" title="Fetching reports..." />
      ) : error ? (
        <StateNotice 
          variant="error" 
          title="Error loading reports" 
          message={error} 
          actionLabel="Retry"
          onAction={fetchReports}
        />
      ) : filteredReports.length === 0 ? (
        <StateNotice 
          title={filter === 'all' ? "No reports found" : `No ${filter} reports`}
          message={filter === 'all' ? "Start by uploading your first medical report." : "Try changing the filter."}
        />
      ) : (
        <div className="reports-grid">
          {filteredReports.map(report => (
            <ReportCard 
              key={report._id} 
              report={report} 
              onDelete={handleDelete}
              onAnalyze={handleAnalyze}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;
