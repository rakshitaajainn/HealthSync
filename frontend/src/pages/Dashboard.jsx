import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reportAPI, aiAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import ReportCard from '../components/ReportCard';
import StateNotice from '../components/StateNotice';
import Card from '../components/Card';

function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [token, navigate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportAPI.getReports();
      setReports(response.data.reports || []);
    } catch (error) {
      setError(getErrorMessage(error, 'Unable to load reports.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportAPI.deleteReport(reportId);
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      } catch (error) {
        setError(getErrorMessage(error, 'Deletion failed.'));
      }
    }
  };

  const handleAnalyze = async (reportId) => {
    try {
      await aiAPI.analyzeReport(reportId);
      fetchReports();
    } catch (error) {
      setError(getErrorMessage(error, 'Analysis failed.'));
    }
  };

  if (!token) return null;

  const analyzedCount = reports.filter(r => r.status === 'analyzed').length;

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <span className="font-bold text-success">{user?.name || 'User'}</span>! Here's your health summary.</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn btn-primary">
          + Upload New Report
        </button>
      </header>

      <section className="stats-grid">
        <Card 
          title="Total Reports" 
          value={reports.length} 
          icon="📄" 
          iconColor="blue" 
          subtitle="Medical documents"
        />
        <Card 
          title="Analyzed" 
          value={analyzedCount} 
          icon="🧠" 
          iconColor="green" 
          subtitle="AI powered insights"
        />
        <Card 
          title="Blood Group" 
          value={user?.bloodGroup || 'N/A'} 
          icon="🩸" 
          iconColor="purple" 
          subtitle="Primary marker"
        />
        <Card 
          title="Age" 
          value={user?.age ?? 'N/A'} 
          icon="👤" 
          iconColor="orange" 
          subtitle="Years old"
        />
      </section>

      <div className="flex justify-between items-center mb-2">
        <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>Recent Reports</h2>
        <button onClick={() => navigate('/reports')} className="btn-link">View All</button>
      </div>

      <section>
        {loading ? (
          <StateNotice variant="loading" title="Loading reports" />
        ) : error ? (
          <StateNotice 
            variant="error" 
            title="Something went wrong" 
            message={error} 
            actionLabel="Try again" 
            onAction={fetchReports} 
          />
        ) : reports.length === 0 ? (
          <StateNotice 
            title="No reports yet" 
            message="Upload your medical reports to get AI-driven health insights." 
            actionLabel="Upload First Report" 
            onAction={() => navigate('/upload')} 
          />
        ) : (
          <div className="reports-grid">
            {reports.slice(0, 4).map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onDelete={handleDelete}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;

