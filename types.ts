
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
