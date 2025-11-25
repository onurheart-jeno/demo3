
import { ShiftLog, User } from '../types';

const LOGS_KEY = 'joyshift_logs_v1';
const USERS_KEY = 'joyshift_users_v1';

// --- Shift Log Logic ---

export const getShiftLogs = (): ShiftLog[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveShiftLog = (log: ShiftLog) => {
  const logs = getShiftLogs();
  logs.push(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const updateShiftLog = (updatedLog: ShiftLog) => {
  const logs = getShiftLogs();
  const index = logs.findIndex(l => l.id === updatedLog.id);
  if (index !== -1) {
    logs[index] = updatedLog;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
};

export const getActiveShift = (): ShiftLog | undefined => {
  const logs = getShiftLogs();
  return logs.find(log => log.endTime === null);
};

export const endActiveShift = (timestamp: number) => {
  const logs = getShiftLogs();
  const activeIndex = logs.findIndex(log => log.endTime === null);
  
  if (activeIndex !== -1) {
    logs[activeIndex].endTime = timestamp;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return logs[activeIndex];
  }
  return null;
};

// Helper to calculate duration in human readable format
export const formatDuration = (start: number, end: number): string => {
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// --- User Management Logic ---

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐝', '🐙'];
const COLORS = ['bg-joy-yellow', 'bg-joy-orange', 'bg-joy-blue', 'bg-joy-green', 'bg-joy-purple', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400'];

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const createUser = (name: string): User => {
  const users = getUsers();
  
  // Randomly assign assets
  const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  const newUser: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    avatar: randomAvatar,
    color: randomColor
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const updateUser = (updatedUser: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const deleteUser = (userId: string) => {
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
