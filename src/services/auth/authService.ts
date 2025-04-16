
import { checkIsAdmin as utilsCheckIsAdmin } from "@/services/auth/authUtils";

// Export the checkIsAdmin function from authUtils
export const checkIsAdmin = utilsCheckIsAdmin;

// Function to get all users with roles (for admin use)
export const getAllUsersWithRoles = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Use a direct query to the user_roles table instead of RPC call
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
