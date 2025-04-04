
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

// Check if a user has admin role using multiple methods for reliability
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    // First try the most reliable method: is_admin_safe RPC function
    const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin_safe');
    
    if (!isAdminError) {
      console.log('Admin check via is_admin_safe:', isAdminData);
      return !!isAdminData;
    }
    
    console.warn('Primary admin check failed, trying fallback...', isAdminError);
    
    // Fallback method 1: Try the original is_admin function
    const { data: originalAdminData, error: originalAdminError } = await supabase.rpc('is_admin');
    
    if (!originalAdminError) {
      console.log('Admin check via is_admin:', originalAdminData);
      return !!originalAdminData;
    }
    
    console.warn('Secondary admin check failed, trying direct query...', originalAdminError);
    
    // Fallback method 2: Direct query as last resort
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
      
    if (roleError) {
      console.error('Final fallback query failed:', roleError);
      return false;
    }
    
    return roleData && roleData.length > 0;
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
    
    // Use a simpler approach to check admin status
    let isUserAdmin = false;
    try {
      isUserAdmin = await checkIsAdmin();
      console.log('Is user admin?', isUserAdmin);
    } catch (adminError) {
      console.error('Error checking admin status:', adminError);
      // Continue without admin privileges
    }
    
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
