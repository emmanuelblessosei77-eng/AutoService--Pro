import { UserRole } from '../App';

export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Initialize with default demo users
const getStoredUsers = (): UserData[] => {
  const stored = localStorage.getItem('registeredUsers');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // If parsing fails, return default users
    }
  }
  // Default demo users
  return [
    { id: '1', name: 'John Customer', email: 'customer@demo.com', password: 'demo', role: 'customer' as UserRole },
    { id: '2', name: 'Mike Mechanic', email: 'mechanic@demo.com', password: 'demo', role: 'mechanic' as UserRole },
    { id: '3', name: 'Admin User', email: 'admin@demo.com', password: 'demo', role: 'admin' as UserRole },
  ];
};

const saveUsers = (users: UserData[]) => {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
};

export const getUserByEmail = (email: string): UserData | undefined => {
  const users = getStoredUsers();
  return users.find(u => u.email === email);
};

export const getUserByEmailAndPassword = (email: string, password: string): UserData | undefined => {
  const users = getStoredUsers();
  return users.find(u => u.email === email && u.password === password);
};

export const addUser = (userData: Omit<UserData, 'id'>): UserData => {
  const users = getStoredUsers();
  const newUser: UserData = {
    ...userData,
    id: Date.now().toString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const emailExists = (email: string): boolean => {
  const users = getStoredUsers();
  return users.some(u => u.email === email);
};

