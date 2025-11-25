import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import UserSelect from './components/UserSelect';
import Dashboard from './components/Dashboard';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.USER_SELECT);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Check system preference or local storage for initial dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      document.body.style.backgroundColor = '#1F2937'; // joy-dark
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      document.body.style.backgroundColor = '#F7F9FC'; // joy-bg
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    setCurrentView(AppView.DASHBOARD);
  };

  const navigateToAdmin = () => {
    setCurrentView(AppView.ADMIN);
  };

  const handleBackToHome = () => {
    setCurrentView(AppView.USER_SELECT);
    setCurrentUser(null);
  };

  return (
    <div className={`font-sans antialiased min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-joy-dark text-white' : 'bg-joy-bg text-gray-900'}`}>
      {currentView === AppView.USER_SELECT && (
        <UserSelect 
          onSelect={handleUserSelect} 
          onAdminClick={navigateToAdmin}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}

      {currentView === AppView.DASHBOARD && currentUser && (
        <Dashboard 
          currentUser={currentUser} 
          onBack={handleBackToHome}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}

      {currentView === AppView.ADMIN && (
        <AdminView 
          onBack={handleBackToHome} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
};

export default App;