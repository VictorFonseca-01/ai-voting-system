import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkutcrkiqfjuerzeazcc.supabase.co';
const supabaseAnonKey = 'sb_publishable_XZxqzDP_c3AprBYk6j4yRA_Wg9ixawv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
