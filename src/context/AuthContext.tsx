
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check for saved auth on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  // Simple login function (in a real app, this would make an API call)
  const login = async (username: string, password: string): Promise<boolean> => {
    // Demo admin credentials
    if (username === "admin" && password === "admin123") {
      const adminUser = {
        id: "1",
        username: "admin",
        isAdmin: true
      };
      
      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));
      toast({
        title: "Login successful",
        description: "Welcome back, Admin!",
        variant: "default",
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  };
  
  const value = {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.isAdmin || false,
    login,
    logout
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
