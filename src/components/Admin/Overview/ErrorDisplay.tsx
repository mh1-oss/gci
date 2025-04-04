
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, WifiOff, Database, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorDisplayProps {
  error: string | null;
  onRefresh: () => void;
}

const ErrorDisplay = ({ error, onRefresh }: ErrorDisplayProps) => {
  if (!error) return null;
  
  // Check for different types of errors
  const isInfiniteRecursionError = 
    error.includes("infinite recursion") || 
    error.includes("deadlock") ||
    error.includes("policy") && 
    error.includes("user_roles");

  // Check for aggregate function error
  const isAggregateError = 
    error.toLowerCase().includes("aggregate") || 
    error.includes("42P17") || 
    error.includes("functions is not allowed");
  
  // Check for connection errors
  const isConnectionError = 
    error.includes("Failed to fetch") || 
    error.includes("NetworkError") ||
    error.includes("FetchError") ||
    error.includes("connection") ||
    error.includes("اتصال") ||
    error.includes("Network request failed");

  // Check for permission errors
  const isPermissionError =
    error.includes("permission denied") ||
    error.includes("not authorized") ||
    error.includes("403") ||
    error.includes("no access");

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isConnectionError ? (
              <WifiOff className="h-5 w-5" />
            ) : isAggregateError ? (
              <Database className="h-5 w-5" />
            ) : isPermissionError ? (
              <LockKeyhole className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <h3 className="font-bold">
              {isConnectionError ? "خطأ في الاتصال" : 
              isAggregateError ? "خطأ في استعلام قاعدة البيانات" : 
              isInfiniteRecursionError ? "خطأ في سياسات قاعدة البيانات" : 
              isPermissionError ? "خطأ في الصلاحيات" :
              "Error Loading Data"}
            </h3>
          </div>
          
          {isConnectionError ? (
            <div>
              <p className="mb-2">لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
              <p className="mb-2">Cannot connect to the database. Please check your internet connection and try again.</p>
              <p className="text-sm bg-amber-50 p-2 border border-amber-200 rounded">
                <strong>Technical details:</strong> {error}
              </p>
            </div>
          ) : isInfiniteRecursionError ? (
            <div>
              <p className="mb-2">هناك مشكلة في إعدادات الأمان لقاعدة البيانات. يرجى تحديث الصفحة للمحاولة مرة أخرى.</p>
              <p className="mb-2">There is a permissions issue with the database policy configuration.</p>
              <p className="mb-2">Try refreshing the page or signing out and back in. If the problem persists, contact your administrator.</p>
              <p className="text-sm bg-amber-50 p-2 border border-amber-200 rounded">
                <strong>Technical details:</strong> {error}
              </p>
            </div>
          ) : isAggregateError ? (
            <div>
              <p className="mb-2">هناك مشكلة في استخدام دوال إحصائية في استعلام قاعدة البيانات.</p>
              <p className="mb-2">There is an issue with the database query using aggregate functions.</p>
              <p className="mb-2">This might be caused by a configuration restriction or permission issue with Row Level Security (RLS).</p>
              <p className="text-sm bg-amber-50 p-2 border border-amber-200 rounded">
                <strong>Technical details:</strong> {error}
              </p>
            </div>
          ) : isPermissionError ? (
            <div>
              <p className="mb-2">ليس لديك صلاحية كافية للوصول إلى هذه البيانات.</p>
              <p className="mb-2">You do not have sufficient permissions to access this data.</p>
              <p className="mb-2">Please try signing out and signing back in, or contact your administrator.</p>
              <p className="text-sm bg-amber-50 p-2 border border-amber-200 rounded">
                <strong>Technical details:</strong> {error}
              </p>
            </div>
          ) : (
            <p>{error}</p>
          )}
        </div>
        <Button 
          onClick={onRefresh}
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isConnectionError ? "إعادة المحاولة" : "Refresh"}
        </Button>
      </div>
      
      {isConnectionError && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="font-medium mb-2">اقتراحات الحل:</p>
          <ol className="list-decimal mr-5 space-y-1 text-sm" dir="rtl">
            <li>تأكد من اتصالك بالإنترنت</li>
            <li>تحقق من صلاحية مفاتيح الوصول لقاعدة البيانات</li>
            <li>قم بتحديث الصفحة وإعادة المحاولة</li>
          </ol>
        </div>
      )}
      
      {isInfiniteRecursionError && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="font-medium mb-2">الحلول المقترحة:</p>
          <ol className="list-decimal mr-5 space-y-1 text-sm" dir="rtl">
            <li>قم بتحديث الصفحة وإعادة المحاولة</li>
            <li>قم بتسجيل الخروج ثم تسجيل الدخول مرة أخرى</li>
            <li>تواصل مع مدير النظام إذا استمرت المشكلة</li>
          </ol>
          <p className="font-medium mb-2 mt-4">Recommended solution:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Refresh the page and try again</li>
            <li>Try logging out and logging back in</li>
            <li>Contact your system administrator if the issue persists</li>
          </ol>
        </div>
      )}
      
      {isAggregateError && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="font-medium mb-2">الحلول المقترحة:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm" dir="rtl">
            <li>استخدم استعلامات بسيطة بدلاً من الدوال الإحصائية</li>
            <li>تحقق من صلاحيات الوصول لقاعدة البيانات</li>
            <li>قم بتسجيل الدخول مرة أخرى إذا كان ذلك ممكناً</li>
          </ol>
          <p className="font-medium mb-2 mt-4">Recommended solutions:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Use simple queries instead of aggregate functions</li>
            <li>Check that your Supabase RLS policies are correctly configured</li>
            <li>Try logging in again if possible</li>
          </ol>
        </div>
      )}
      
      {isPermissionError && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="font-medium mb-2">الحلول المقترحة:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm" dir="rtl">
            <li>قم بتسجيل الخروج ثم تسجيل الدخول مرة أخرى</li>
            <li>تحقق من صلاحيات حسابك مع مدير النظام</li>
          </ol>
          <p className="font-medium mb-2 mt-4">Recommended solutions:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Sign out and sign back in</li>
            <li>Verify your account permissions with your administrator</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
