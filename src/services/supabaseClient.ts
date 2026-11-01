import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL ||
  'https://cclporgmzhtaskzuydzv.supabase.co';

const SUPABASE_ANON_KEY =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbHBvcmdtemh0YXNrenV5ZHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTA2MTQsImV4cCI6MjEwOTA2NjYxNH0.I9OY0oBD1URjTXeIklTGi5fCtgV3HKG5Y3rqKG1qsWk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
