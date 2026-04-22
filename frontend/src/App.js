import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import Reports from './pages/Reports';
import EmergencyView from './pages/EmergencyView';
import HealthPredict from './pages/HealthPredict';
import PersonalDetails from './pages/PersonalDetails';
import Profile from './pages/Profile';

import './styles.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-main">
          <Navbar />
          <div className="app-layout">
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="*" element={<Sidebar />} />
              </Route>
            </Routes>
            
            <main style={{ flex: 1 }}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/personal-details" element={<PersonalDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/upload" element={<UploadReport />} />
                  <Route path="/predict" element={<HealthPredict />} />
                  <Route path="/emergency" element={<EmergencyView />} />
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
