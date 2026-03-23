import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://nkutcrkiqfjuerzeazcc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_XZxqzDP_c3AprBYk6j4yRA_Wg9ixawv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
