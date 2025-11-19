import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import Devices from './pages/Devices';
import ZoneDetail from './pages/zoneDetail';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Zones from './pages/Zones';
import PlantDetail from './pages/PlantDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes with New Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/plants" element={
              <ProtectedRoute>
                <Layout>
                  <Plants />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/plants/:plantId" element={
              <ProtectedRoute>
                <Layout>
                  <PlantDetail />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/zones" element={
              <ProtectedRoute>
                <Layout>
                  <Zones />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/zones/:zoneId" element={
              <ProtectedRoute>
                <Layout>
                  <ZoneDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/devices" element={
              <ProtectedRoute>
                <Layout>
                  <Devices />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Redirect to dashboard by default */}
            <Route path="/" element={<Navigate to="/" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <a href="/" className="text-green-500 hover:text-green-600 font-medium">
                    ← Back to Dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;