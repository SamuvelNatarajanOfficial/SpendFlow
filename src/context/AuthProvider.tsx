import { useEffect, useState, type ReactNode } from 'react';
import {
  getAuthState,
  initAuth,
  signIn,
  signOut as signOutOfGoogle,
  subscribe,
  type AuthState,
} from '../services/googleSheets/auth';
import { signOutLocally } from '../services/localAuth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribe(setState);
    void initAuth();
    return unsubscribe;
  }, []);

  // Ends both steps — the local gate and the Google session — landing back
  // on the static login screen. Distinct from the plain `signOut` below
  // (which `AccessDeniedScreen` uses to retry with a different Google
  // account): that one shouldn't force re-entering the static password just
  // to pick a different account.
  function signOutCompletely() {
    signOutOfGoogle();
    signOutLocally();
    window.location.reload();
  }

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signOut: signOutOfGoogle, signOutCompletely }}
    >
      {children}
    </AuthContext.Provider>
  );
}
