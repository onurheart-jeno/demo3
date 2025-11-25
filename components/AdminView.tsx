import React, { useEffect, useState } from 'react';
import { ShiftLog, User } from '../types';
import { getShiftLogs, formatDuration, getUsers } from '../services/storageService';
import { generateAdminReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AdminViewProps {
  onBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onBack, isDarkMode, toggleDarkMode }) => {
  const [logs, setLogs] = useState<ShiftLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sort logs by newest first
    const data = getShiftLogs().sort((a, b) => b.startTime - a.startTime);
    setLogs(data);
    setUsers(getUsers());
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    const result = await generateAdminReport(logs, users);
    setReport(result);
    setLoading(false);
  };

  // Group by user for total hours calculation
  const getUserStats = () => {
    const stats: Record<string, number> = {};
    logs.forEach(log => {
      const end = log.endTime || Date.now();
      const duration = end - log.startTime;
      stats[log.userId] = (stats[log.userId] || 0) + duration;
    });
    return Object.entries(stats).map(([userId, totalMs]) => {
      const user = users.find(u => u.id === userId);
      return {
        name: user?.name || 'Unknown',
        avatar: user?.avatar || '👤',
        totalTime: formatDuration(0, totalMs)
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-joy-dark p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-bold transition-colors">
            ← Back
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manager Hub 📊</h1>
             <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-white dark:bg-joy-cardDark shadow-sm hover:scale-105 transition-transform"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
          </div>
        </div>

        {/* AI Action Area */}
        <div className="bg-gradient-to-r from-joy-purple to-joy-blue rounded-3xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span>✨</span> AI Daily Insight
            </h2>
            <p className="text-white/80 mb-4 text-sm max-w-md">
              Get a smart summary of today's rotational performance, gaps, and payroll estimates.
            </p>
            
            {!report && (
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-white text-joy-purple font-bold py-2 px-6 rounded-full shadow-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-joy-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  "Generate Report"
                )}
              </button>
            )}

            {report && (
              <div className="bg-white/10 rounded-xl p-4 mt-4 backdrop-blur-sm border border-white/20">
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-line leading-relaxed">
                    {report}
                  </div>
                </div>
                <button onClick={() => setReport(null)} className="text-xs text-white/60 mt-4 hover:text-white underline">
                  Close Report
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           {/* Total Hours Stats */}
           <div className="bg-white dark:bg-joy-cardDark rounded-3xl shadow-sm p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Total Hours Worked</h3>
            <div className="space-y-3">
              {getUserStats().map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{stat.avatar}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{stat.name}</span>
                  </div>
                  <span className="font-bold text-joy-green">{stat.totalTime}</span>
                </div>
              ))}
              {getUserStats().length === 0 && <p className="text-gray-400 dark:text-gray-500 italic">No data yet.</p>}
            </div>
          </div>

          {/* Detailed Logs */}
          <div className="bg-white dark:bg-joy-cardDark rounded-3xl shadow-sm p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Shift History</h3>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
              {logs.map((log) => {
                 const isOngoing = log.endTime === null;
                 const duration = isOngoing ? 'Active' : formatDuration(log.startTime, log.endTime!);
                 const user = users.find(u => u.id === log.userId);

                 return (
                   <div key={log.id} className="flex flex-col p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span>{user?.avatar || '👤'}</span>
                          <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{log.userName}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOngoing ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {duration}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                         <span>In: {new Date(log.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                         <span>Out: {log.endTime ? new Date(log.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}</span>
                      </div>
                   </div>
                 );
              })}
              {logs.length === 0 && <p className="text-gray-400 dark:text-gray-500 italic">No shifts recorded.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminView;