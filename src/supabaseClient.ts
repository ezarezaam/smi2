import { createClient } from '@supabase/supabase-js';

// Supabase credentials (development environment)
const supabaseUrl = 'https://bkzgldizzacqnzqfklxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJremdsZGl6emFjcW56cWZrbHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDcwNTAsImV4cCI6MjA3MDA4MzA1MH0.kZwNqT6LoSstkbpajF2lnEgNrYOoO-3y3vbK2HWZZYk';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
