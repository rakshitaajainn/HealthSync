import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { emergencyAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import QRCodeComponent from '../components/QRCode';
import StateNotice from '../components/StateNotice';
import Card from '../components/Card';

function EmergencyView() {
  const { user, token } = useContext(AuthContext);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      setError('Unable to resolve user ID');
      setLoading(false);
      return;
    }

    const fetchEmergencyInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await emergencyAPI.getEmergencyInfo(userId);
        setEmergencyInfo(response.data.data);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, 'Failed to load emergency information'));
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyInfo();
  }, [token, user, navigate]);

  if (!token) return null;

  const userId = user?._id || user?.id;
  const apiBaseUrl = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
  const emergencyProfileUrl = `${apiBaseUrl}/api/emergency/${userId}`;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title text-danger">🚨 Emergency Information</h1>
          <p className="page-subtitle">Critical medical details for first responders.</p>
        </div>
      </div>

      {loading ? (
        <StateNotice variant="loading" title="Loading emergency profile" />
      ) : error ? (
        <StateNotice
          variant="error"
          title="Profile unavailable"
          message={error}
          actionLabel="Dashboard"
          onAction={() => navigate('/')}
        />
      ) : emergencyInfo ? (
        <div className="cards-row">
          <Card title="Personal Information" icon="👤" iconColor="blue">
            <div className="mt-1">
              <div className="mb-1"><strong>Name:</strong> {emergencyInfo.name || 'N/A'}</div>
              <div className="mb-1"><strong>Age:</strong> {emergencyInfo.age ?? 'N/A'}</div>
              <div className="mb-1"><strong>Blood Group:</strong> <span className="text-danger font-bold">{emergencyInfo.bloodGroup || 'Unknown'}</span></div>
              <div className="mb-1"><strong>Allergies:</strong> <span className="text-warning">{emergencyInfo.allergies?.length ? emergencyInfo.allergies.join(', ') : 'None listed'}</span></div>
              {emergencyInfo.phone && <div className="mb-1"><strong>Phone:</strong> {emergencyInfo.phone}</div>}
            </div>
          </Card>

          <Card title="Emergency Contact" icon="📞" iconColor="green">
            <div className="mt-1">
              <div className="mb-1"><strong>Name:</strong> {emergencyInfo.emergencyContact?.name || 'Not provided'}</div>
              <div className="mb-1"><strong>Phone:</strong> {emergencyInfo.emergencyContact?.phone || 'Not provided'}</div>
            </div>
          </Card>

          <Card title="Medical Summary" icon="📋" iconColor="purple">
            <div className="report-text-box mt-1">
              {emergencyInfo.medicalHistorySummary || 'No medical history provided.'}
            </div>
          </Card>

          <Card title="Digital Access" subtitle="Scan for full emergency profile" className="text-center">
            <div className="mt-2 mb-2 flex justify-center">
              <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <QRCodeComponent value={emergencyProfileUrl} viewLink={emergencyProfileUrl} size={200} />
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              First responders can scan this code to see your critical medical summary instantly.
            </p>
          </Card>

          <div className="alert alert-error">
            <div>
              <strong>Important:</strong> Keep this information current. Ensure your emergency contact is reachable.
            </div>
          </div>

          <div className="flex gap-1 mt-1">
            <button onClick={() => navigate('/upload')} className="btn btn-primary flex-1">
              Upload Latest
            </button>
            <button onClick={() => navigate('/profile')} className="btn btn-ghost flex-1">
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <StateNotice
          title="No profile data"
          message="Complete your profile to generate an emergency access summary."
        />
      )}
    </div>
  );
}

export default EmergencyView;
