import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../firebase';
import { getUserProfile } from '../lib/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getUserProfile(currentUser.uid);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile: async () => {
        if (!auth.currentUser) return null;
        const latest = await getUserProfile(auth.currentUser.uid);
        setProfile(latest);
        return latest;
      },
      register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      logout: () => signOut(auth),
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
