import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ykwcfwdikuiduhchwtqb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrd2Nmd2Rpa3VpZHVoY2h3dHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDg0NzQsImV4cCI6MjA4ODM4NDQ3NH0.dgvAaIUC5YAW53ygWNORr1YnDeQy_4_KBI-n5PJK130';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);