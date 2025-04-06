
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff, Database, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface DatabaseConnectionErrorProps {
  message?: string;
  retryFn?: () => void;
  showHomeLink?: boolean;
}

const DatabaseConnectionError: React.FC<DatabaseConnectionErrorProps> = ({ 
  message = "تعذر الاتصال بقاعدة البيانات",
  retryFn,
  showHomeLink = true
}) => {
  const handleRetry = () => {
    if (retryFn) {
      retryFn();
    } else {
      // Default behavior if no retry function is provided
      window.location.reload();
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-100 text-center">
      <WifiOff className="h-16 w-16 mx-auto text-red-500 mb-4" />
      
      <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في الاتصال بقاعدة البيانات</h2>
      
      <p className="text-gray-600 mb-6">
        {message}
        <br />
        <span className="text-sm text-gray-500 block mt-2">
          يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
        </span>
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          onClick={handleRetry}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="ml-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
        
        {showHomeLink && (
          <Link to="/">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="font-medium mb-2 text-sm">معلومات تقنية:</p>
        <div className="bg-gray-50 p-3 rounded text-sm text-left">
          <p className="mb-1"><strong>الخطأ:</strong> مشكلة في سياسات RLS في قاعدة البيانات</p>
          <p><strong>الجدول المتأثر:</strong> user_roles</p>
          <p className="mt-1">يتم اكتشاف تكرار لانهائي في سياسة الوصول لجدول user_roles.</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionError;
