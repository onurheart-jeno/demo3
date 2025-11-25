import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser } from '../services/storageService';

interface UserSelectProps {
  onSelect: (user: User) => void;
  onAdminClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const UserSelect: React.FC<UserSelectProps> = ({ onSelect, onAdminClick, isDarkMode, toggleDarkMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const newUser = createUser(newName);
      setUsers(getUsers()); // Refresh list
      setNewName('');
      setIsCreating(false);
      onSelect(newUser); // Auto select
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-joy-cardDark shadow-md hover:scale-110 transition-transform text-xl"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold dark:text-white text-gray-800 mb-2">JoyShift 🚀</h1>
        <p className="dark:text-gray-400 text-gray-500 mb-8 text-lg">Who is starting their shift?</p>
        
        {/* User Grid */}
        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={`${user.color} hover:brightness-110 active:scale-95 transition-all duration-200 p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center aspect-square relative group`}
            >
              <span className="text-5xl mb-3 drop-shadow-sm transform group-hover:scale-110 transition-transform">{user.avatar}</span>
              <span className="text-white font-bold text-xl tracking-wide shadow-black drop-shadow-md break-words w-full px-2 leading-tight">
                {user.name}
              </span>
            </button>
          ))}

          {/* Add New User Button / Form */}
          {isCreating ? (
            <div className="bg-white dark:bg-joy-cardDark border-2 border-dashed border-joy-blue p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center aspect-square animate-fade-in">
              <form onSubmit={handleCreateUser} className="w-full flex flex-col items-center">
                <input
                  type="text"
                  autoFocus
                  placeholder="Your Name"
                  className="w-full text-center text-lg font-bold border-b-2 border-joy-blue outline-none bg-transparent dark:text-white text-gray-800 placeholder-gray-400 mb-4 pb-2"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={12}
                />
                <div className="flex gap-2 w-full">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newName.trim()}
                    className="flex-1 py-2 bg-joy-blue text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 text-sm"
                  >
                    Join
                  </button>
                </div>
              </form>
            </div>
          ) : (
             <button
              onClick={() => setIsCreating(true)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-300 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center aspect-square transition-all"
            >
              <span className="text-4xl mb-2">+</span>
              <span className="font-bold">New User</span>
            </button>
          )}
        </div>

        <button 
          onClick={onAdminClick}
          className="mt-12 text-gray-400 dark:text-gray-500 text-sm underline hover:text-joy-blue dark:hover:text-joy-blue"
        >
          Manager Access
        </button>
      </div>
    </div>
  );
};

export default UserSelect;