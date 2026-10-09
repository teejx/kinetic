import React, { useState } from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import { LogView } from './components/views/LogView';
import { HistoryView } from './components/views/HistoryView';
import { RoutinesView } from './components/views/RoutinesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ProfileView } from './components/views/ProfileView';
import { AuthView } from './components/views/AuthView';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('log');
  const { activeUser, isAuthenticated } = useFitness();

  // If user is not authenticated, show Login & Registration screen
  if (!isAuthenticated || !activeUser) {
    return <AuthView />;
  }

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'log':
        return (
          <LogView
            onNavigateToRoutines={() => setActiveTab('routines')}
          />
        );
      case 'history':
        return <HistoryView />;
      case 'routines':
        return <RoutinesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black/95 flex justify-center">
      <div className="w-full max-w-lg min-h-[100dvh] bg-background shadow-2xl relative flex flex-col">
        <Navbar onNavigateToProfile={() => setActiveTab('profile')} />

        <main className="flex-1 w-full">
          {renderCurrentView()}
        </main>

        <RestTimerOverlay />

        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FitnessProvider>
      <AppContent />
    </FitnessProvider>
  );
}
