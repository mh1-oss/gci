
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oirorkrrvxumhjhvrucm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcm9ya3Jydnh1bWhqaHZydWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTEyNDUsImV4cCI6MjA1ODc2NzI0NX0.HGmW3Sk-iAMvjWUAaAXD4DWwN_aFulsckAHuNPCU0yU";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? localStorage : undefined
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper function to check connection to Supabase
export const pingDatabase = async () => {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('products').select('count()', { count: 'exact' }).limit(1);
    const end = Date.now();
    
    if (error) {
      console.error("Database ping failed:", error);
      return { ok: false, latency: 0, error: error.message };
    }
    
    return { ok: true, latency: end - start, data };
  } catch (err) {
    console.error("Unexpected error during database ping:", err);
    return { ok: false, latency: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// Helper function to check if we have an active session
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};
