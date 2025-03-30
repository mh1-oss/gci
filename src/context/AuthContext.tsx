
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast"; // Import standalone toast function, not the hook
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  // Check if a user has admin role
  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      // Make a simple query rather than using a complex RPC
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return data !== null;
    } catch (error) {
      console.error('Unexpected error checking admin role:', error);
      return false;
    }
  };
  
  // Setup auth listener and initialize state
  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Check admin status if user is logged in
        if (newSession?.user) {
          // Use setTimeout to avoid Supabase auth deadlock issues
          setTimeout(async () => {
            const isUserAdmin = await checkIsAdmin(newSession.user.id);
            setIsAdmin(isUserAdmin);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          const isUserAdmin = await checkIsAdmin(initialSession.user.id);
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        toast({
          title: "فشل تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (!data.user) {
        console.error('No user returned after login');
        toast({
          title: "فشل تسجيل الدخول",
          description: "لم يتم العثور على المستخدم",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Login successful, checking admin status');
      const isUserAdmin = await checkIsAdmin(data.user.id);
      setIsAdmin(isUserAdmin);
      
      return true;
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      toast({
        title: "تم تسجيل الخروج",
        description: "لقد تم تسجيل خروجك بنجاح.",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
