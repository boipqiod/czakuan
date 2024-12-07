import {User} from '@/types/user';
import {create} from 'zustand';

interface AuthStore {
  user?: User;
  login: (user: User) => void;
  logout: () => void;
  isLogin: boolean;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: undefined,
  login: user => set({user, isLogin: true}),
  logout: () => set({user: undefined, isLogin: false}),
  isLogin: false,
}));
