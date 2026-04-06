import { supabase } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { AppUser } from '../types';

// Map Supabase user to AppUser
const fromSupabase = (u: { id: string; email?: string | null; user_metadata?: any } | null): AppUser | null => {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email ?? null,
    displayName: u.user_metadata?.full_name || u.user_metadata?.name || null,
    photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
    provider: u.user_metadata?.iss?.includes('google') ? 'google' : 'email',
  };
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

  // Sign In with Google (Supabase OAuth — replaces Firebase popup)
  signInWithGoogle: async (): Promise<AppUser> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    // Returns placeholder — actual user set by onAuthStateChange after redirect
    return { id: '', email: null, provider: 'google' };
  },

  // Sign Out (Supabase only)
  signOut: async () => {
    await supabase.auth.signOut();
  },

  // Get current user
  getCurrentUser: async (): Promise<AppUser | null> => {
    const { data } = await supabase.auth.getUser();
    return fromSupabase(data.user);
  },

  // Listen for auth changes (Supabase only)
  onAuthStateChange: (callback: (user: AppUser | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        callback(fromSupabase(session?.user ?? null));
      }
    );

    return {
      data: {
        subscription: {
          unsubscribe: () => subscription.unsubscribe(),
        },
      },
    };
  },
};
