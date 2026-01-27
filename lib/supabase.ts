
import { createClient } from '@supabase/supabase-js';

// 1. Credentials provided by you
const HARDCODED_URL = 'https://azafwaycrxnucncavhms.supabase.co';
const HARDCODED_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6YWZ3YXljcnhudWNuY2F2aG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODY1NjEsImV4cCI6MjA4NTA2MjU2MX0.jw08Bop4qXVQ-Iyz00jHTNjUmPl-hcT2i9qRG9X1mDg';

// 2. Access environment variables safely, falling back to your provided credentials
// We use (import.meta as any) to avoid TypeScript errors if types aren't fully set up
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || HARDCODED_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || HARDCODED_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
