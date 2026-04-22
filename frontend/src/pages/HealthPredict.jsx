import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import StateNotice from '../components/StateNotice';
import Card from '../components/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function HealthPredict() {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    systolic: '',
    diastolic: '',
    sleepHours: '',
    dietQuality: 'average',
    activityLevel: 'moderate',
  });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { age, weight, height, systolic, diastolic } = formData;
    if (!age || !weight || !height || !systolic || !diastolic) {
      return 'Basic vitals are required for prediction.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await aiAPI.predictHealth({
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        systolic: Number(formData.systolic),
        diastolic: Number(formData.diastolic),
        sleepHours: formData.sleepHours ? Number(formData.sleepHours) : null,
      });
      setResult(response.data.data || response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Prediction failed.'));
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? {
    labels: ['Risk Score'],
    datasets: [{
      label: 'Health Risk Score',
      data: [result.riskScore || 0],
      backgroundColor: 'rgba(79, 142, 247, 0.7)',
      borderColor: '#4f8ef7',
      borderWidth: 1,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } } }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Health Risk Predictor</h1>
          <p className="page-subtitle">AI-driven analysis based on your vitals and lifestyle.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <Card title="Input Vitals">
          {error && <StateNotice variant="error" message={error} />}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age (Years)</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Sleep (Hours)</label>
                <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Systolic BP</label>
                <input type="number" name="systolic" value={formData.systolic} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Diastolic BP</label>
                <input type="number" name="diastolic" value={formData.diastolic} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Diet Quality</label>
                <select name="dietQuality" value={formData.dietQuality} onChange={handleChange} className="form-select">
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="form-select">
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-1">
              {loading ? 'Analyzing Data...' : 'Calculate Risk'}
            </button>
          </form>
        </Card>

        <div>
          {!result && !loading && (
            <StateNotice 
              title="Ready for Analysis" 
              message="Enter your current health data to see your AI-predicted risk score and personalized recommendations."
            />
          )}

          {loading && <StateNotice variant="loading" title="Processing Prediction" message="Our AI models are analyzing your markers against clinical datasets." />}

          {result && (
            <div className="flex flex-direction-column gap-2">
              <Card title="Analysis Result">
                <div className="flex items-center gap-2 mb-2">
                  <div className="card-value" style={{ color: result.riskScore > 60 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                    {result.riskScore}%
                  </div>
                  <div>
                    <div className="font-bold">Risk Score</div>
                    <div className={`badge badge-${result.riskLevel?.toLowerCase() === 'high' ? 'error' : result.riskLevel?.toLowerCase() === 'medium' ? 'pending' : 'analyzed'}`}>
                      {result.riskLevel || 'Normal'}
                    </div>
                  </div>
                </div>

                <div style={{ height: '180px', margin: '1rem 0' }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </Card>

              {result.recommendations && result.recommendations.length > 0 && (
                <Card title="AI Recommendations" icon="💡" iconColor="orange">
                  <ul className="mt-1" style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="mb-1">{rec}</li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HealthPredict;

