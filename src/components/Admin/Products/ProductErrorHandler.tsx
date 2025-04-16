
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff, RefreshCw, Database, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { isRlsRecursionError } from "@/services/rls/rlsErrorHandler";

interface ProductErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  className?: string;
  showLogoutOption?: boolean;
}

const ProductErrorHandler: React.FC<ProductErrorHandlerProps> = ({
  error,
  onRetry,
  className = "",
  showLogoutOption = false,
}) => {
  const { logout } = useAuth();

  if (!error) return null;

  // Enhanced error type detection
  const errorString = String(error);
  const isRlsPolicyError = 
    isRlsRecursionError(error) || 
    errorString.includes("infinite recursion") || 
    errorString.includes("policy for relation") ||
    errorString.includes("سياسات") || 
    errorString.includes("policy") || 
    errorString.includes("user_roles");
                          
  const isConnectionError = 
    errorString.includes("اتصال") || 
    errorString.includes("connection") || 
    errorString.includes("network");
                           
  const isCrudError = 
    errorString.includes("إنشاء") || 
    errorString.includes("تحديث") || 
    errorString.includes("حذف") ||
    errorString.includes("create") ||
    errorString.includes("update") ||
    errorString.includes("delete");

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          {isConnectionError ? (
            <WifiOff className="h-4 w-4 mt-0.5" />
          ) : isRlsPolicyError ? (
            <Database className="h-4 w-4 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5" />
          )}
          <div className="mr-3">
            <AlertTitle>
              {isConnectionError
                ? "خطأ في الاتصال بقاعدة البيانات"
                : isRlsPolicyError
                ? "خطأ في سياسات قاعدة البيانات"
                : isCrudError
                ? "خطأ في إدارة المنتجات" 
                : "خطأ"}
            </AlertTitle>
            <AlertDescription>
              <p>{errorString}</p>
              {isRlsPolicyError && (
                <div className="text-sm mt-2 bg-red-50 p-2 rounded border border-red-200">
                  <p><strong>التفاصيل التقنية:</strong> يبدو أن هناك مشكلة في تكوين سياسات الأمان (RLS) لجدول user_roles.</p>
                  <p className="mt-1">يرجى التواصل مع مدير النظام لحل هذه المشكلة.</p>
                </div>
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
          
          {showLogoutOption && isRlsPolicyError && (
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

export default ProductErrorHandler;
