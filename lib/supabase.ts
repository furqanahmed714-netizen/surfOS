import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface SnakeScore {
  id: string;
  user_id: string;
  score: number;
  created_at: string;
  profiles?: Profile;
}

export interface BrickBreakerScore {
  id: string;
  user_id: string;
  score: number;
  level: number;
  created_at: string;
  profiles?: Profile;
}
