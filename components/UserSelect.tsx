
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser, updateUser, deleteUser } from '../services/storageService';

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
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const loadedUsers = getUsers();
    setUsers(loadedUsers);
    // If no users, automatically show create form
    if (loadedUsers.length === 0) {
      setIsCreating(true);
    }
  }, []);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const newUser = createUser(newName);
      refreshUsers();
      setNewName('');
      setIsCreating(false);
      onSelect(newUser); // Auto select
    }
  };

  const startEditing = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setEditingId(user.id);
    setEditName(user.name);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim() && editingId) {
      const userToUpdate = users.find(u => u.id === editingId);
      if (userToUpdate) {
        updateUser({ ...userToUpdate, name: editName.trim() });
        refreshUsers();
        setEditingId(null);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
      const remaining = getUsers();
      setUsers(remaining);
      setEditingId(null);
      if (remaining.length === 0) setIsCreating(true);
    }
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-joy-cardDark shadow-md hover:scale-110 transition-transform text-xl z-20"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold dark:text-white text-gray-800 mb-2">JoyShift 🚀</h1>
        <p className="dark:text-gray-400 text-gray-500 mb-8 text-lg">Who is starting their shift?</p>
        
        {/* User Grid */}
        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          {users.map((user) => {
            const isEditing = editingId === user.id;

            return (
              <div
                key={user.id}
                onClick={() => !isEditing && onSelect(user)}
                className={`${user.color} relative hover:brightness-110 transition-all duration-200 p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center aspect-square group cursor-pointer ${isEditing ? 'brightness-105 ring-4 ring-white/50' : 'active:scale-95'}`}
              >
                {!isEditing && (
                  <button 
                    onClick={(e) => startEditing(e, user)}
                    className="absolute top-2 right-2 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit Name"
                  >
                    ✏️
                  </button>
                )}

                {isEditing ? (
                  <div className="w-full flex flex-col items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-center bg-white/20 text-white placeholder-white/70 rounded-lg py-1 px-2 outline-none font-bold"
                      autoFocus
                    />
                    <div className="flex gap-2 w-full mt-1">
                      <button onClick={saveEdit} className="flex-1 bg-white/20 hover:bg-white/40 text-white rounded-lg py-1 text-xs font-bold">Save</button>
                      <button onClick={(e) => handleDelete(e, user.id)} className="flex-1 bg-red-500/50 hover:bg-red-500/70 text-white rounded-lg py-1 text-xs font-bold">Del</button>
                    </div>
                    <button onClick={cancelEdit} className="text-xs text-white/70 hover:text-white mt-1 underline">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="text-5xl mb-3 drop-shadow-sm transform group-hover:scale-110 transition-transform">{user.avatar}</span>
                    <span className="text-white font-bold text-xl tracking-wide shadow-black drop-shadow-md break-words w-full px-2 leading-tight">
                      {user.name}
                    </span>
                  </>
                )}
              </div>
            );
          })}

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
                    onClick={() => users.length > 0 && setIsCreating(false)}
                    className="flex-1 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {users.length > 0 ? 'Cancel' : 'Clear'}
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
