import React, { useState, useEffect } from 'react';
import { User, ShiftLog } from '../types';
import { getActiveShift, saveShiftLog, endActiveShift } from '../services/storageService';

interface DashboardProps {
  currentUser: User;
  onBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onBack, isDarkMode, toggleDarkMode }) => {
  const [activeShift, setActiveShift] = useState<ShiftLog | undefined>(undefined);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer for clock display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    // Initial fetch of active shift
    const existing = getActiveShift();
    setActiveShift(existing);
    return () => clearInterval(timer);
  }, []);

  const handleStartShift = () => {
    const existing = getActiveShift();
    if (existing) {
      if (existing.userId === currentUser.id) {
        // Already working
        alert("You are already clocked in! 🎉");
        return;
      }
      // Someone else is working
      setShowOverrideModal(true);
    } else {
      // No one working, start fresh
      performClockIn();
    }
  };

  const performClockIn = () => {
    // If we are overriding, end the previous shift first
    if (activeShift) {
      endActiveShift(Date.now());
    }

    const newShift: ShiftLog = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.name,
      startTime: Date.now(),
      endTime: null,
    };
    saveShiftLog(newShift);
    setActiveShift(newShift);
    setShowOverrideModal(false);
  };

  const handleEndShift = () => {
    endActiveShift(Date.now());
    setActiveShift(undefined);
  };

  const isWorking = activeShift?.userId === currentUser.id;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-joy-dark transition-colors duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white/80 dark:bg-joy-dark/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-sm font-semibold transition-colors">
          ← Change User
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentUser.avatar}</span>
            <span className="font-bold text-gray-800 dark:text-white">{currentUser.name}</span>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6 justify-center">
        
        {/* Status Card */}
        <div className={`w-full max-w-md rounded-3xl p-8 mb-8 text-center shadow-xl transition-all duration-500 ${activeShift ? 'bg-joy-blue text-white' : 'bg-gray-100 dark:bg-joy-cardDark text-gray-400 dark:text-gray-500'}`}>
          <div className="text-6xl font-light mb-2 font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="font-medium text-lg uppercase tracking-widest opacity-80">
            {activeShift 
              ? (isWorking ? "You are on duty" : `${activeShift.userName} is on duty`) 
              : "No one is on duty"}
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-md space-y-4">
          {!isWorking && (
            <button
              onClick={handleStartShift}
              className="w-full py-6 rounded-2xl bg-joy-green hover:bg-green-500 text-white font-bold text-2xl shadow-joy-green/50 shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3"
            >
              <span>⏰</span> Start Shift
            </button>
          )}

          {isWorking && (
             <button
             onClick={handleEndShift}
             className="w-full py-6 rounded-2xl bg-joy-orange hover:bg-red-500 text-white font-bold text-2xl shadow-joy-orange/50 shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3"
           >
             <span>👋</span> Clock Out
           </button>
          )}
        </div>
        
        <p className="mt-8 text-center text-gray-400 dark:text-gray-500 text-sm max-w-xs leading-relaxed">
          {activeShift 
            ? "Rotational shift is active. Taking over will automatically end the previous person's shift." 
            : "Ready to start? Tap the button above to begin tracking hours."}
        </p>
      </div>

      {/* Override Modal */}
      {showOverrideModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-joy-cardDark rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-bounce-in ring-1 ring-black/5">
            <div className="text-center mb-6">
              <span className="text-6xl block mb-4">⚠️</span>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Take Over Shift?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-bold text-joy-blue">{activeShift.userName}</span> is currently working since {new Date(activeShift.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Starting your shift will automatically clock them out.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowOverrideModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={performClockIn}
                className="flex-1 py-3 rounded-xl bg-joy-yellow font-bold text-gray-800 hover:brightness-95 transition-all shadow-lg shadow-joy-yellow/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;