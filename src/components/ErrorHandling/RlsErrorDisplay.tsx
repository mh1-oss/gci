
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, RefreshCw, LogOut, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { isRlsRecursionError } from "@/services/rls/rlsErrorHandler";

interface RlsErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  className?: string;
  showLogoutButton?: boolean;
  showDetails?: boolean;
}

const RlsErrorDisplay: React.FC<RlsErrorDisplayProps> = ({
  error,
  onRetry,
  className = "",
  showLogoutButton = true,
  showDetails = true
}) => {
  const { logout } = useAuth();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  if (!error) return null;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isRecursion = isRlsRecursionError(error);
  
  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح. يرجى تسجيل الدخول مرة أخرى.",
      });
      window.location.reload();
    } catch (err) {
      console.error("Error logging out:", err);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  // Function to toggle technical details
  const toggleDetails = () => {
    setShowTechnicalDetails(prev => !prev);
  };
  
  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div className="mr-3">
            <AlertTitle>
              {isRecursion 
                ? "خطأ في سياسات قاعدة البيانات"
                : "مشكلة في سياسات قاعدة البيانات (RLS)"}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">{errorMessage}</p>
              
              {showDetails && (
                <>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-red-700 underline"
                    onClick={toggleDetails}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    {showTechnicalDetails ? "إخفاء التفاصيل التقنية" : "عرض التفاصيل التقنية"}
                  </Button>
                  
                  {showTechnicalDetails && (
                    <div className="text-sm mt-2 bg-red-50 p-2 rounded border border-red-200">
                      <p className="mb-1"><strong>تفاصيل المشكلة:</strong> هناك تكرار لانهائي في سياسات الأمان (RLS) للمستخدمين.</p>
                      <p><strong>الجدول المتأثر:</strong> user_roles</p>
                      <p><strong>الحلول الممكنة:</strong></p>
                      <ol className="mr-5 mt-1 space-y-1">
                        <li>تسجيل الخروج وإعادة تسجيل الدخول قد يحل المشكلة مؤقتاً.</li>
                        <li>التواصل مع مدير النظام لإصلاح إعدادات سياسات RLS.</li>
                        <li>استخدام وظائف security definer في قاعدة البيانات لتجنب التكرار اللانهائي.</li>
                      </ol>
                      {isRecursion && (
                        <p className="mt-2 text-xs opacity-75">infinite recursion detected in policy for relation "user_roles"</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </AlertDescription>
          </div>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50 shrink-0"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          )}
          {showLogoutButton && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50 shrink-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default RlsErrorDisplay;
