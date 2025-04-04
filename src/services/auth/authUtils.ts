
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Type definitions
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

// Check if a user has admin role using the is_admin() security definer function
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    // Use the security definer function to prevent recursion issues
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin role:', error);
      
      // Fallback method with direct query if the RPC fails due to recursion
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        // Get roles directly, avoiding RPC function
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');
          
        if (roleError) {
          console.error('Fallback query error:', roleError);
          return false;
        }
        
        return roleData && roleData.length > 0;
      } catch (fallbackError) {
        console.error('Fallback check failed:', fallbackError);
        return false;
      }
    }
    
    return !!data; // Convert to boolean
  } catch (error) {
    console.error('Unexpected error checking admin role:', error);
    return false;
  }
};

// Login function
export const loginUser = async (email: string, password: string): Promise<{
  success: boolean;
  isAdmin?: boolean;
  error?: string;
}> => {
  try {
    console.log('Attempting login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login error:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    if (!data.user) {
      console.error('No user returned after login');
      return { 
        success: false, 
        error: "No user found" 
      };
    }
    
    console.log('Login successful, checking admin status');
    
    // Add delay to prevent deadlocks with session updates
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check admin status safely to avoid deadlocks
    const isUserAdmin = await checkIsAdmin();
    console.log('Is user admin?', isUserAdmin);
    
    return { 
      success: true, 
      isAdmin: isUserAdmin 
    };
    
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return { 
      success: false, 
      error: "An unexpected error occurred" 
    };
  }
};

// Logout function
export const logoutUser = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error during logout:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    return { 
      success: false, 
      error: "An unexpected error occurred" 
    };
  }
};

// Get the current session
export const getCurrentSession = async (): Promise<{
  session: Session | null;
  user: User | null;
}> => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    session,
    user: session?.user ?? null
  };
};
