
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

  // Check admin status safely with retry mechanism
  const updateAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    try {
      console.log('Checking admin status for user:', user.id);
      
      // Use a simpler approach without setTimeout to check admin status
      const isUserAdmin = await checkIsAdmin();
      console.log('User admin status:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      
      // Retry mechanism for admin check
      if (retryCount < 3) {
        console.log(`Retrying admin check (${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        
        // Use setTimeout for retry with increasing delay
        setTimeout(async () => {
          try {
            const isUserAdmin = await checkIsAdmin();
            setIsAdmin(isUserAdmin);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setIsAdmin(false);
          }
        }, 1000 * (retryCount + 1)); // Increasing backoff delay
      } else {
        // After 3 retries, notify user of the issue
        toast({
          title: "Authentication Issue",
          description: "Could not verify admin privileges. Some features may be limited.",
          variant: "destructive",
        });
        setIsAdmin(false);
      }
    }
  }, [user, retryCount]);

  // Initialize auth state
  useEffect(() => {
    console.log('Setting up auth listener');
    let authSubscription;
    
    try {
      // First, set up the auth state listener
      const { data } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.id);
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
      );
      
      authSubscription = data.subscription;
      
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
          
          // Delay admin check slightly to avoid race conditions
          setTimeout(() => {
            setLoading(false);
          }, 500);
        } catch (error) {
          console.error('Error initializing auth:', error);
          setLoading(false);
        }
      };
      
      initializeAuth();
    } catch (error) {
      console.error('Error setting up auth:', error);
      setLoading(false);
    }
    
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Update admin status whenever user changes
  useEffect(() => {
    if (user) {
      updateAdminStatus();
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
