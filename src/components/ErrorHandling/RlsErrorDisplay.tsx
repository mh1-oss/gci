
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface RlsErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  className?: string;
  showLogoutButton?: boolean;
}

const RlsErrorDisplay: React.FC<RlsErrorDisplayProps> = ({
  error,
  onRetry,
  className = "",
  showLogoutButton = true
}) => {
  const { logout } = useAuth();
  
  if (!error) return null;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isRecursion = errorMessage.includes("infinite recursion") || errorMessage.includes("42P17");
  
  const handleLogout = async () => {
    await logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح. يرجى تسجيل الدخول مرة أخرى."
    });
    window.location.reload();
  };
  
  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Database className="h-4 w-4 mt-0.5" />
          <div className="mr-3">
            <AlertTitle>
              {isRecursion 
                ? "مشكلة في تكرار سياسات قاعدة البيانات"
                : "مشكلة في سياسات قاعدة البيانات (RLS)"}
            </AlertTitle>
            <AlertDescription>
              <p>{errorMessage}</p>
              <div className="text-sm mt-2 bg-red-50 p-2 rounded">
                <p className="mb-1"><strong>تفاصيل المشكلة:</strong> هناك مشكلة في سياسات الأمان (RLS) للمستخدمين.</p>
                <p><strong>الحلول الممكنة:</strong></p>
                <ol className="mr-5 mt-1 space-y-1">
                  <li>إعادة تسجيل الدخول قد يحل المشكلة مؤقتاً.</li>
                  <li>التواصل مع مدير النظام لإصلاح سياسات RLS.</li>
                </ol>
                {isRecursion && (
                  <p className="mt-2 text-xs opacity-75">خطأ: تكرار لانهائي في سياسة RLS لجدول user_roles</p>
                )}
              </div>
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
              تسجيل الخروج
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default RlsErrorDisplay;
