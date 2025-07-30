import { create } from 'zustand';

const allowedAccounts = [
  { email: 'mei@gmail.com', password: 'r' },
  { email: 'sam@gmail.com', password: 'raizen' },
  { email: 'rv@gmail.com', password: 'raizen' },
];

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  login: (email, password) => {
    const found = allowedAccounts.find(
      (acc) => acc.email === email && acc.password === password
    );
    if (found) {
      const user = { email };
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user });
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null });
  },
}));
