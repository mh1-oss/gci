
import { checkIsAdmin as utilsCheckIsAdmin } from "@/services/auth/authUtils";
import { supabase } from "@/integrations/supabase/client";

// Export the checkIsAdmin function from authUtils
export const checkIsAdmin = utilsCheckIsAdmin;

// Function to get all users with roles (for admin use)
export const getAllUsersWithRoles = async () => {
  try {
    // Use a direct query to the user_roles table 
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

// Function to assign a role to a user
export const assignRoleToUser = async (userId: string, role: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role },
        { onConflict: 'user_id,role' }
      );

    if (error) {
      console.error('Error assigning role to user:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error assigning role to user:', error);
    return { data: null, error };
  }
};

// Function to remove a role from a user
export const removeRoleFromUser = async (userId: string, role: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      console.error('Error removing role from user:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error removing role from user:', error);
    return { data: null, error };
  }
};

// Function to get user roles for a specific user
export const getUserRoles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user roles:', error);
      return { data: null, error };
    }

    return { data: data?.map(item => item.role) || [], error: null };
  } catch (error) {
    console.error('Unexpected error getting user roles:', error);
    return { data: null, error };
  }
};
