import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/services/auth/authUtils";
import { toast } from "@/hooks/use-toast";

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
  const [retryCount, setRetryCount] = useState(0);

  // Check admin status safely without retries
  const updateAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    try {
      console.log('Checking admin status for user:', user.id);
      const isUserAdmin = await checkIsAdmin();
      console.log('User admin status:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      
      // Only show toast for RLS errors if we're not in the initial loading
      if (!loading && error instanceof Error && error.message.includes('RLS')) {
        toast({
          title: "RLS Policy Error",
          description: "There was an issue checking your admin privileges. Please try logging out and back in.",
          variant: "destructive",
        });
      }
    }
  }, [user, loading]);

  // Initialize auth state
  useEffect(() => {
    console.log('Setting up auth listener');
    
    // First, set up the auth state listener
    const { data } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );
    
    const authSubscription = data.subscription;
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log('Initial session:', initialSession.user?.id);
          setSession(initialSession);
          setUser(initialSession.user ?? null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Update admin status whenever user changes
  useEffect(() => {
    if (user) {
      // Use a slight delay to avoid potential race conditions
      const timer = setTimeout(() => {
        updateAdminStatus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsAdmin(false);
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
