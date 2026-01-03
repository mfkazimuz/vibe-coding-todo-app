import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Priority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  task: string;
  description?: string;
  completed: boolean;
  deadline?: string;
  priority: Priority;
  created_at: string;
}
