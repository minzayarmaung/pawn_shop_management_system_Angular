// models/user.model.ts
export interface User {
  id?: number;
  username: string;
  password?: string; // Don't include in responses from backend
  role: 'ADMIN' | 'STAFF';
}
