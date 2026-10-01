import { createContext, useContext } from 'react';
import type { AuthState } from '../services/googleSheets/auth';

export interface AuthContextValue extends AuthState {
  signIn: () => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
