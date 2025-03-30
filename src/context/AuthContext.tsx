
import React, { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast"; 
import { useAuthState } from "@/hooks/useAuthState";
import { loginUser, logoutUser } from "@/services/auth/authUtils";

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
  const { 
    user, 
    session, 
    isAuthenticated, 
    isAdmin, 
    loading 
  } = useAuthState();
  
  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await loginUser(email, password);
    
    if (!result.success) {
      toast({
        title: "فشل تسجيل الدخول",
        description: result.error || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
      return false;
    }
    
    if (!result.isAdmin) {
      toast({
        title: "تم تسجيل الدخول",
        description: "لكن ليس لديك صلاحيات إدارية",
        variant: "destructive",
      });
    }
    
    return true;
  };
  
  const logout = async (): Promise<void> => {
    const result = await logoutUser();
    
    if (result.success) {
      toast({
        title: "تم تسجيل الخروج",
        description: "لقد تم تسجيل خروجك بنجاح.",
      });
    } else {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };
  
  const value = {
    user,
    session,
    isAuthenticated,
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
