import { createClient } from '@supabase/supabase-js';

// Supabase credentials (development environment)
const supabaseUrl = 'https://bkzgldizzacqnzqfklxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJremdsZGl6emFjcW56cWZrbHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDcwNTAsImV4cCI6MjA3MDA4MzA1MH0.kZwNqT6LoSstkbpajF2lnEgNrYOoO-3y3vbK2HWZZYk';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get the current authenticated user
 * @returns Object containing user data and error if any
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
};

/**
 * Sign in with email and password
 * @param email User's email
 * @param password User's password
 * @returns Object containing session, user data and error if any
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: { user: null, session: null }, error };
  }
};

/**
 * Sign out the current user
 * @returns Object containing error if any
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};
