
import { checkIsAdmin as utilsCheckIsAdmin } from "@/services/auth/authUtils";

// Export the checkIsAdmin function from authUtils
export const checkIsAdmin = utilsCheckIsAdmin;

// Add a function to get all users with roles (for admin use)
export const getAllUsersWithRoles = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Use a direct query instead of RPC to work around TypeScript constraints
    // This avoids the TypeScript error since we're not using the rpc method
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting users with roles:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error getting users with roles:', error);
    return { data: null, error };
  }
};
