import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { reportAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import StateNotice from '../components/StateNotice';
import Card from '../components/Card';
import UploadBox from '../components/UploadBox';

function UploadReport() {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    file: null,
    reportType: 'blood_test',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedReport, setUploadedReport] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const navigate = useNavigate();

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFileSelect = (e) => {
    const nextFile = e.target.files[0];
    setError('');

    if (!nextFile) {
      setFormData((prev) => ({ ...prev, file: null }));
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(nextFile.type)) {
      setError('Please upload a valid Document or Image file (PDF, PNG, JPG, GIF).');
      return;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      setError('File size must be 10MB or less.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file: nextFile,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pollReportStatus = async (reportId) => {
    setOcrLoading(true);
    let attempts = 0;
    const maxAttempts = 12;
    const intervalMs = 3000;

    while (attempts < maxAttempts && isMounted.current) {
      try {
        const response = await reportAPI.getReport(reportId);
        const report = response.data.report;
        if (!isMounted.current) break;
        setUploadedReport(report);

        if (report.extractedText || report.status === 'processed' || report.status === 'analyzed' || report.status === 'error') {
          break;
        }
      } catch (pollError) {
        console.error('Error polling report status:', pollError);
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    if (isMounted.current) {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadedReport(null);

    if (!formData.file) {
      setError('Please select a report file before uploading.');
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('file', formData.file);
      form.append('reportType', formData.reportType);
      form.append('description', formData.description);
      form.append('tags', formData.tags);

      const response = await reportAPI.uploadReport(form);
      const createdReport = response.data.report;
      setUploadedReport(createdReport);
      pollReportStatus(createdReport._id || createdReport.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Health Report</h1>
          <p className="page-subtitle">Upload your medical documents for AI analysis and extraction.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <Card>
          {error && <StateNotice variant="error" message={error} />}

          <form onSubmit={handleSubmit}>
            <UploadBox 
              onFileSelect={handleFileSelect} 
              selectedFile={formData.file} 
              loading={loading}
            />

            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="blood_test">Blood Test</option>
                <option value="xray">X-Ray</option>
                <option value="ct_scan">CT Scan</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="ecg">ECG</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any specific context or doctor's notes"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. urgent, follow-up, routine"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.file}
              className="btn btn-primary btn-full mt-1"
            >
              {loading ? 'Processing Upload...' : 'Upload & Analyze'}
            </button>
          </form>
        </Card>

        <div>
          {!uploadedReport && !loading && (
            <StateNotice
              title="Ready to Start?"
              message="Your report will be processed using OCR to extract key medical data. This information is used to build your health timeline."
            />
          )}

          {uploadedReport && (
            <Card title="Upload Progress" subtitle={uploadedReport.fileName}>
              <div className="mb-2">
                <strong>Status:</strong> 
                <span className={`badge badge-${uploadedReport.status || 'pending'} ml-1`}>
                  {uploadedReport.status || 'pending'}
                </span>
              </div>
              
              <div>
                <strong>AI Extraction:</strong>
                {ocrLoading ? (
                  <StateNotice
                    variant="loading"
                    title="Analyzing document"
                    message="Our AI is currently reading and extracting data from your report. This usually takes 10-20 seconds."
                  />
                ) : uploadedReport.extractedText ? (
                  <div className="report-text-box mt-1" style={{ maxHeight: '400px' }}>
                    {uploadedReport.extractedText}
                  </div>
                ) : (
                  <StateNotice
                    title="Extraction Pending"
                    message="The file is uploaded. Extraction will start shortly."
                  />
                )}
              </div>
              
              {uploadedReport.status === 'processed' && (
                <button 
                  onClick={() => navigate('/')} 
                  className="btn btn-success btn-full mt-3"
                >
                  View in Dashboard
                </button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadReport;

