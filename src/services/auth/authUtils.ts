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

// Check if a user has admin role using our improved security definer function
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    // First try the most reliable method: check_admin_status function (using our new secure function)
    const { data: isAdminData, error: isAdminError } = await supabase.rpc('check_admin_status');
    
    if (!isAdminError) {
      console.log('Admin check via check_admin_status:', isAdminData);
      return !!isAdminData;
    }
    
    console.warn('Primary admin check failed, trying fallback...', isAdminError);
    
    // Try our is_admin function as a first fallback 
    const { data: isAdminFallback, error: fallbackError } = await supabase.rpc('is_admin');
    
    if (!fallbackError) {
      console.log('Admin check via is_admin:', isAdminFallback);
      return !!isAdminFallback;
    }
    
    console.warn('Second admin check failed, trying final fallback...', fallbackError);
    
    // Fallback method: Direct query as last resort
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (roleError) {
      console.error('Final fallback query failed:', roleError);
      return false;
    }
    
    return !!roleData;
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
