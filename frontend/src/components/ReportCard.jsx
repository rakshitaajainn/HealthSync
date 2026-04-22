import React, { useState } from 'react';

function ReportCard({ report, onDelete, onAnalyze }) {
  const [showText, setShowText] = useState(false);
  const [busyAction, setBusyAction] = useState('');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAnalyze = async () => {
    setBusyAction('analyze');
    try {
      await onAnalyze(report._id);
    } finally {
      setBusyAction('');
    }
  };

  const handleDelete = async () => {
    setBusyAction('delete');
    try {
      await onDelete(report._id);
    } finally {
      setBusyAction('');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    return <span className={`badge badge-${s}`}>{s}</span>;
  };

  return (
    <div className="report-card">
      <div className="report-card-header">
        <div>
          <div className="report-file-name">{report.fileName}</div>
          <div className="report-meta">
            <span>📅 {formatDate(report.uploadDate)}</span>
            <span>📂 {report.reportType?.replace('_', ' ') || 'Unknown'}</span>
          </div>
        </div>
        {getStatusBadge(report.status)}
      </div>

      {report.description && (
        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
          {report.description}
        </p>
      )}

      {(report.extractedText || report.summary) && (
        <div className="report-text-box">
          <strong>Summary / Extracted Data:</strong>
          <div className="mt-1">
            {report.summary || report.extractedText?.slice(0, 300)}
            {report.extractedText?.length > 300 && !report.summary && '...'}
          </div>
          
          {showText && report.extractedText && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <strong>Full Extraction:</strong>
              <div className="mt-1">{report.extractedText}</div>
            </div>
          )}

          {report.extractedText && (
            <button
              type="button"
              onClick={() => setShowText(!showText)}
              className="btn-link mt-1"
            >
              {showText ? 'Show Less' : 'Show Full Text'}
            </button>
          )}
        </div>
      )}

      <div className="report-actions">
        {report.status !== 'analyzed' && (
          <button 
            onClick={handleAnalyze} 
            className="btn btn-sm btn-primary" 
            disabled={busyAction !== ''}
          >
            {busyAction === 'analyze' ? 'Analyzing...' : 'Analyze Now'}
          </button>
        )}
        <button 
          onClick={handleDelete} 
          className="btn btn-sm btn-ghost" 
          disabled={busyAction !== ''}
          style={{ color: 'var(--accent-danger)' }}
        >
          {busyAction === 'delete' ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

export default ReportCard;
