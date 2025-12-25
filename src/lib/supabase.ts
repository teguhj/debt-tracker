import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface Debt {
  id: string;
  user_id: string;
  name: string;
  principal: number;
  balance: number;
  interest_rate: number;
  payment_date: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  debt_id: string;
  amount: number;
  date: string;
  created_at: string;
}
