
import { supabase } from '../lib/supabase';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export const authService = {
  // Sign Up with Email
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  // Sign In with Email
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Sign Out
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Get Current User
  getCurrentUser: async (): Promise<User | null> => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Listen for Auth Changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user || null);
    });
  }
};
