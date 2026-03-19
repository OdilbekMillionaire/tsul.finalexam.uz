
import { supabase } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { AppUser } from '../types';

// Map Supabase user to AppUser
const fromSupabase = (u: { id: string; email?: string | null } | null): AppUser | null => {
  if (!u) return null;
  return { id: u.id, email: u.email ?? null, provider: 'email' };
};

// Map Firebase user to AppUser
const fromFirebase = (u: { uid: string; email: string | null; displayName: string | null; photoURL: string | null } | null): AppUser | null => {
  if (!u) return null;
  return { id: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL, provider: 'google' };
};

export const authService = {
  // Sign Up with Email (Supabase)
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  // Sign In with Email (Supabase)
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  // Sign In with Google (Firebase)
  signInWithGoogle: async (): Promise<AppUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    return fromFirebase(result.user)!;
  },

  // Sign Out (both)
  signOut: async () => {
    await Promise.allSettled([
      supabase.auth.signOut(),
      firebaseSignOut(auth),
    ]);
  },

  // Get current user (checks Firebase first, then Supabase)
  getCurrentUser: async (): Promise<AppUser | null> => {
    if (auth.currentUser) return fromFirebase(auth.currentUser);
    const { data } = await supabase.auth.getUser();
    return fromSupabase(data.user);
  },

  // Listen for auth changes from both providers
  onAuthStateChange: (callback: (user: AppUser | null) => void) => {
    // Firebase listener
    const unsubFirebase = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(fromFirebase(firebaseUser));
      }
    });

    // Supabase listener (only fires if not already handled by Firebase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!auth.currentUser) {
          callback(fromSupabase(session?.user ?? null));
        }
      }
    );

    // Return combined unsubscribe
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            unsubFirebase();
            subscription.unsubscribe();
          }
        }
      }
    };
  }
};
