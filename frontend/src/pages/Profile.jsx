import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../services/errorUtils';
import Card from '../components/Card';
import StateNotice from '../components/StateNotice';

function Profile() {
  const { user, login } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    bloodGroup: '',
    allergies: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        const profileData = response.data.user || response.data;
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          age: profileData.age || '',
          bloodGroup: profileData.bloodGroup || '',
          allergies: profileData.allergies || '',
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load profile.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data.user || response.data;
      
      login(updatedUser, localStorage.getItem('token'));
      
      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        age: updatedUser.age || '',
        bloodGroup: updatedUser.bloodGroup || '',
        allergies: updatedUser.allergies || '',
      });
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <StateNotice variant="loading" title="Loading profile..." />
      </div>
    );
  }

  const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : '👤';

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information and health metadata.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 className="profile-name">{formData.name}</h2>
            <p className="profile-email">{formData.email}</p>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost mt-1">
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && <StateNotice variant="error" message={error} />}
        {successMsg && <StateNotice variant="success" message={successMsg} />}

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <input
                  type="text"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. O+, A-"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. Peanuts, Penicillin"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-1 mt-2">
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Profile;

