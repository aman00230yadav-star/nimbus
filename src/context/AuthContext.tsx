import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isDemoUser: boolean;
  signInAsDemo: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  isDemoUser: false,
  signInAsDemo: () => {},
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      setIsDemoUser(false);
    } catch (err: any) {
      console.warn('Google Sign-in failed or closed:', err);
      // If popup was blocked or closed by user, give clear guidance
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Browser popup was blocked. Please allow popups.');
      } else {
        setError(err?.message || 'Authentication failed.');
      }
    }
  };

  const signOut = async () => {
    try {
      if (isDemoUser) {
        setIsDemoUser(false);
        setUser(null);
      } else {
        await signOutUser();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const signInAsDemo = () => {
    setIsDemoUser(true);
    // Create a mock user representation for frictionless offline/demo exploration
    setUser({
      uid: 'demo-operator-101',
      email: 'rohitdagar0023@gmail.com',
      displayName: 'Security Operator (Auditor)',
      photoURL: '',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'demo-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      providerId: 'google.com',
    } as FirebaseUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isDemoUser, signInAsDemo, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
