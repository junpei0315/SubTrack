import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthDeepLink } from '@/hooks/use-auth-deep-link';
import { getCurrentSession } from '@/src/application/getCurrentSession';
import { signInWithEmail as signInWithEmailUseCase } from '@/src/application/signInWithEmail';
import { signInWithGoogle as signInWithGoogleUseCase } from '@/src/application/signInWithGoogle';
import { signOut as signOutUseCase } from '@/src/application/signOut';
import { signUpWithEmail as signUpWithEmailUseCase } from '@/src/application/signUpWithEmail';
import type { AuthSession } from '@/src/domain/auth';
import { authRepositorySupabase } from '@/src/infrastructure/supabase/authRepositorySupabase';
import type { SignUpResult } from '@/src/ports/authRepository';

interface AuthContextValue {
  session: AuthSession | null;
  /** 起動時のセッション復元が完了するまで true。 */
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<SignUpResult>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const repository = authRepositorySupabase;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useAuthDeepLink();

  useEffect(() => {
    let isMounted = true;

    void getCurrentSession(repository)
      .then((current) => {
        if (isMounted) {
          setSession(current);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const unsubscribe = repository.onAuthStateChange((next) => {
      if (isMounted) {
        setSession(next);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(
    (email: string, password: string) => signInWithEmailUseCase(repository, email, password),
    []
  );

  const signUpWithEmail = useCallback(
    (email: string, password: string) => signUpWithEmailUseCase(repository, email, password),
    []
  );

  const signInWithGoogle = useCallback(() => signInWithGoogleUseCase(repository), []);

  const signOut = useCallback(() => signOutUseCase(repository), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [session, isLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth は AuthProvider の内側で使用してください');
  }
  return context;
}
