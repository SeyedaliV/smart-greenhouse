import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import Devices from './pages/Devices';
import Troubleshooting from './pages/Troubleshooting';
import Logs from './pages/Logs';
import ZoneDetail from './pages/zoneDetail';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Zones from './pages/Zones';
import PlantDetail from './pages/PlantDetail';
import { Toaster } from 'react-hot-toast';
import { initRealtimeListeners } from './services/realtime';

function App() {
  useEffect(() => {
    initRealtimeListeners();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: Infinity,
              className:
                'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-lg text-sm',
            }}
          />
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

            <Route path="/troubleshooting" element={
              <ProtectedRoute>
                <Layout>
                  <Troubleshooting />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/logs" element={
              <ProtectedRoute>
                <Layout>
                  <Logs />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Redirect to dashboard by default */}
            <Route path="/" element={<Navigate to="/" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-zinc-900 mb-4">404</h1>
                  <p className="text-zinc-600 mb-4">Page not found</p>
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