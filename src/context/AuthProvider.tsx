import { useEffect, useState, type ReactNode } from 'react';
import {
  getAuthState,
  initAuth,
  signIn,
  signOut,
  subscribe,
  type AuthState,
} from '../services/googleSheets/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribe(setState);
    void initAuth();
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
