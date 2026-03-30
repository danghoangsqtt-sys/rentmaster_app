
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import OwnerForm from './pages/OwnerForm';
import NotificationsPage from './pages/NotificationsPage';
import Schedule from './pages/Schedule';
import ProfileMain from './pages/ProfileMain';
import ProfileInfo from './pages/ProfileInfo';
import SystemSettings from './pages/SystemSettings';
import LoadingScreen from './components/LoadingScreen';
import { AppProvider } from './data/AppContext';
import { PermissionModal } from './components/PermissionModal';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedTheme = localStorage.getItem('rentMasterTheme');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error("App initialization failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
    
    const permissionsRequested = localStorage.getItem('permissions_requested');
    
    const timer = setTimeout(() => {
      setShowSplash(false);
      window.dispatchEvent(new Event('app-ready'));
      
      if (!permissionsRequested) {
        setShowPermissionModal(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isInitializing || showSplash) {
    return <LoadingScreen />;
  }

  return (
    <AppProvider>
      <Router>
        {showPermissionModal && (
          <PermissionModal 
            onComplete={() => {
              localStorage.setItem('permissions_requested', 'true');
              setShowPermissionModal(false);
            }} 
          />
        )}
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/property/new" element={<PropertyForm />} />
            <Route path="/property/edit/:id" element={<PropertyForm />} />
            <Route path="/owner/new" element={<OwnerForm />} />
            <Route path="/owner/edit/:id" element={<OwnerForm />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfileMain />} />
            <Route path="/profile/info" element={<ProfileInfo />} />
            <Route path="/profile/settings" element={<SystemSettings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
