import React from 'react';
import { User } from '../types';
import { ChatIcon, VaultIcon, ToolkitIcon, GroupsIcon, LogoutIcon, EditIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

type View = 'chat' | 'memory-vault' | 'truthvsmyth' | 'support-groups';

interface SidebarProps {
  user: User;
  currentView: View;
  isCollapsed: boolean;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  onEditProfile: () => void;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentView,
  isCollapsed,
  onViewChange,
  onLogout,
  onEditProfile,
  onToggle,
}) => {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: ChatIcon },
    { id: 'memory-vault', label: 'Memory Vault', icon: VaultIcon },
    { id: 'truthvsmyth', label: 'Truth vs. Myth', icon: ToolkitIcon },
    { id: 'support-groups', label: 'Support Groups', icon: GroupsIcon },
  ];

  const getNavItemClass = (view: View) =>
    `flex items-center p-3 my-2 rounded-lg cursor-pointer transition-colors ${
      currentView === view
        ? 'bg-teal-600 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    } ${isCollapsed ? 'justify-center' : ''}`;

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-56 md:w-64'
      }`}
    >
       <div className={`flex items-center p-4 border-b border-gray-700 ${isCollapsed ? 'justify-center' : ''}`}>
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.nickname}`}
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
        {!isCollapsed && (
          <div className="ml-3">
            <p className="font-semibold">{user.nickname}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={getNavItemClass(item.id as View)}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-6 h-6" />
            {!isCollapsed && <span className="ml-4">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-700">
        <button
          onClick={onEditProfile}
          className={`flex items-center w-full p-3 my-1 rounded-lg cursor-pointer transition-colors text-gray-300 hover:bg-gray-700 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? "Edit Profile" : undefined}
        >
          <EditIcon size={20} />
          {!isCollapsed && <span className="ml-4">Edit Profile</span>}
        </button>
        <button
          onClick={onLogout}
          className={`flex items-center w-full p-3 my-1 rounded-lg cursor-pointer transition-colors text-gray-300 hover:bg-gray-700 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogoutIcon />
          {!isCollapsed && <span className="ml-4">Logout</span>}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 bg-gray-700 hover:bg-teal-600 text-white p-2 rounded-full focus:outline-none z-10 shadow-lg border-2 border-gray-900"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRightIcon size={16}/> : <ChevronLeftIcon size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;