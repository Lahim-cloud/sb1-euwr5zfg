import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Provide fallback values or handle the error gracefully
  // For example, you could disable Supabase features or use mock data
  // return null; // Or throw an error, depending on your needs
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
