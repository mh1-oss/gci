
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/services/auth/authUtils";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Check admin status safely
  const updateAdminStatus = useCallback(async () => {
    try {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      console.log('Checking admin status for user:', user.id);
      const isUserAdmin = await checkIsAdmin();
      console.log('User admin status:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    console.log('Setting up auth listener');
    
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession?.user?.id);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Use setTimeout to avoid Supabase auth deadlocks
        setTimeout(() => {
          updateAdminStatus();
          setLoading(false);
        }, 0);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => subscription.unsubscribe();
  }, [updateAdminStatus]);

  // Update admin status whenever user changes
  useEffect(() => {
    if (user) {
      // Use setTimeout to avoid Supabase auth deadlocks
      setTimeout(() => {
        updateAdminStatus();
      }, 0);
    }
  }, [user, updateAdminStatus]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    loading
  };
};
