
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { 
  getAllUsersWithRoles, 
  getUserRoles, 
  assignRoleToUser, 
  removeRoleFromUser 
} from '@/services/auth/authService';
import { toast } from '@/hooks/use-toast';
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';

export interface UserRole {
  user_id: string;
  role: string;
}

export const useUserRoles = () => {
  const [usersWithRoles, setUsersWithRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsersWithRoles = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getAllUsersWithRoles();
      
      if (error) {
        if (isRlsPolicyError(error)) {
          setError("Permission denied: Unable to fetch user roles due to security policy restrictions.");
          toast({
            title: "سياسة الأمان",
            description: "تعذر جلب بيانات أدوار المستخدمين بسبب قيود سياسة الأمان.",
            variant: "destructive",
          });
        } else {
          setError(`Error fetching users with roles: ${error.message || String(error)}`);
        }
        return;
      }
      
      setUsersWithRoles(data || []);
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      setError(null);
      const { error } = await assignRoleToUser(userId, role);
      
      if (error) {
        if (isRlsPolicyError(error)) {
          setError("Permission denied: Unable to assign role due to security policy restrictions.");
          toast({
            title: "خطأ في سياسة الأمان",
            description: "تعذر تعيين الدور بسبب قيود سياسة الأمان.",
            variant: "destructive",
          });
        } else {
          setError(`Error assigning role: ${error.message || String(error)}`);
        }
        return false;
      }
      
      toast({
        title: "تم بنجاح",
        description: "تم تعيين الدور بنجاح",
      });
      
      // Refresh the list
      fetchUsersWithRoles();
      return true;
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  const removeRole = async (userId: string, role: string) => {
    try {
      setError(null);
      const { error } = await removeRoleFromUser(userId, role);
      
      if (error) {
        if (isRlsPolicyError(error)) {
          setError("Permission denied: Unable to remove role due to security policy restrictions.");
          toast({
            title: "خطأ في سياسة الأمان",
            description: "تعذر إزالة الدور بسبب قيود سياسة الأمان.",
            variant: "destructive",
          });
        } else {
          setError(`Error removing role: ${error.message || String(error)}`);
        }
        return false;
      }
      
      toast({
        title: "تم بنجاح",
        description: "تم إزالة الدور بنجاح",
      });
      
      // Refresh the list
      fetchUsersWithRoles();
      return true;
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersWithRoles();
    }
  }, [user]);

  return {
    usersWithRoles,
    loading,
    error,
    fetchUsersWithRoles,
    assignRole,
    removeRole
  };
};
