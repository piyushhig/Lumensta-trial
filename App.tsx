import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import MemoryVault from './components/MemoryVault';
import TruthvsMyth from './components/StigmaToolkit';
import SupportGroups from './components/SupportGroups';
import LoginScreen from './components/LoginScreen';
import EditProfileModal from './components/EditProfileModal';
import { User } from './types';
import { getUser, saveUser, logoutUser } from './services/authService';
import { startChat } from './services/geminiService';

type View = 'chat' | 'memory-vault' | 'truthvsmyth' | 'support-groups';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    const existingUser = getUser();
    if (existingUser) {
      setUser(existingUser);
      startChat(existingUser.language);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    saveUser(newUser);
    setUser(newUser);
    startChat(newUser.language);
  };
  
  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };
  
  const handleSaveProfile = (updatedUser: User) => {
      saveUser(updatedUser);
      setUser(updatedUser);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <Chat />;
      case 'memory-vault':
        return <MemoryVault />;
      case 'truthvsmyth':
        return <TruthvsMyth />;
      case 'support-groups':
        return <SupportGroups />;
      default:
        return <Chat />;
    }
  };

  return (
    <div className="h-screen bg-gray-800 text-white">
      <Sidebar
        user={user}
        currentView={currentView}
        isCollapsed={isSidebarCollapsed}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onEditProfile={() => setIsEditingProfile(true)}
        onToggle={() => setIsSidebarCollapsed(prev => !prev)}
      />
      <main
        className={`h-full transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'pl-20' : 'pl-56 md:pl-64'}`}
      >
        {renderView()}
      </main>
      {isEditingProfile && (
        <EditProfileModal
            user={user}
            onClose={() => setIsEditingProfile(false)}
            onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}

export default App;