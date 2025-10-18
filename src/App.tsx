import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { LandingPage } from './components/LandingPage';
import { PublicClaimForm } from './components/PublicClaimForm';
import { Header } from './components/Header';
import { OperativeDashboard } from './components/OperativeDashboard';
import { SurveyorDashboard } from './components/SurveyorDashboard';
import { SolicitorDashboard } from './components/SolicitorDashboard';

type View = 'landing' | 'claim' | 'auth';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    if (currentView === 'auth') {
      return <AuthForm onBack={() => setCurrentView('landing')} />;
    }
    if (currentView === 'claim') {
      return <PublicClaimForm onBack={() => setCurrentView('landing')} />;
    }
    return (
      <LandingPage
        onGetStarted={() => setCurrentView('claim')}
        onPortalLogin={() => setCurrentView('auth')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {(profile.role === 'tenant' || profile.role === 'operative') && <OperativeDashboard />}
      {profile.role === 'surveyor' && <SurveyorDashboard />}
      {profile.role === 'solicitor' && <SolicitorDashboard />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
