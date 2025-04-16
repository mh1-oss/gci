
import { checkIsAdmin as utilsCheckIsAdmin } from "@/services/auth/authUtils";

// Export the checkIsAdmin function from authUtils
export const checkIsAdmin = utilsCheckIsAdmin;

// Add a function to get all users with roles (for admin use)
export const getAllUsersWithRoles = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.rpc('get_all_users_with_roles');
    
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
