
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Auth functions
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }
    
    // Use a direct query instead of RPC to avoid recursion issues
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
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
