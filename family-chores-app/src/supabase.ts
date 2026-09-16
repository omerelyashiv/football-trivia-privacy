import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ifayzexhenihnjnmnivc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYXl6ZXhoZW5paG5qbm1uaXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTQwNjcsImV4cCI6MjEwNTEzMDA2N30.Gx1wMISU7MsrsrTLr9gtQd6VyY6CDO2x9XfK640xFeI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const FAMILY_TABLE = 'chores_app_family_data';
