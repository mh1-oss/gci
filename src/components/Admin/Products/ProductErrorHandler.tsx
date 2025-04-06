
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff, RefreshCw, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

const ProductErrorHandler: React.FC<ProductErrorHandlerProps> = ({
  error,
  onRetry,
  className = "",
}) => {
  if (!error) return null;

  // Check for different error types
  const isRlsPolicyError = error.includes("سياسات") || 
                          error.includes("infinite recursion") || 
                          error.includes("policy") || 
                          error.includes("user_roles");
                          
  const isConnectionError = error.includes("اتصال") || 
                           error.includes("connection") || 
                           error.includes("network");
                           
  const isCrudError = error.includes("إنشاء") || 
                     error.includes("تحديث") || 
                     error.includes("حذف") ||
                     error.includes("create") ||
                     error.includes("update") ||
                     error.includes("delete");

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
                ? "مشكلة في سياسات قاعدة البيانات"
                : isCrudError
                ? "خطأ في إدارة المنتجات" 
                : "خطأ"}
            </AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              {isRlsPolicyError && (
                <p className="text-sm mt-2 bg-red-50 p-2 rounded">
                  <strong>التفاصيل التقنية:</strong> يبدو أن هناك مشكلة في تكوين سياسات الأمان (RLS) لجدول user_roles.
                  يرجى التواصل مع مدير النظام لحل هذه المشكلة.
                </p>
              )}
            </AlertDescription>
          </div>
        </div>

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
      </div>
    </Alert>
  );
};

export default ProductErrorHandler;
