export interface User {
  id: string;
  name: string;
  avatar: string; // Emoji
  color: string;
}

export interface ShiftLog {
  id: string;
  userId: string;
  userName: string; // Denormalized for simpler display
  startTime: number; // Timestamp
  endTime: number | null; // Null if currently active
}

export enum AppView {
  USER_SELECT = 'USER_SELECT',
  DASHBOARD = 'DASHBOARD',
  ADMIN = 'ADMIN',
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice', avatar: '🦊', color: 'bg-joy-orange' },
  { id: '2', name: 'Bob', avatar: '🐼', color: 'bg-joy-blue' },
  { id: '3', name: 'Charlie', avatar: '🦁', color: 'bg-joy-yellow' },
  { id: '4', name: 'Diana', avatar: '🦄', color: 'bg-joy-purple' },
  { id: '5', name: 'Eve', avatar: '🐸', color: 'bg-joy-green' },
];