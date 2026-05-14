import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile, UserProfile } from './firestore';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  setProfile: (p: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  authReady: false,
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
    return onAuthStateChanged(auth, async (u) => {
      setAuthReady(false);
      setUser(u);
      if (!u) {
        setProfile(null);
        setAuthReady(true);
        return;
      }
      try {
        const timeout = new Promise<null>((r) => setTimeout(() => r(null), 5000));
        const p = await Promise.race([getUserProfile(u.uid), timeout]);
        setProfile(p);
      } catch {
        setProfile(null);
      }
      setAuthReady(true);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, authReady, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
