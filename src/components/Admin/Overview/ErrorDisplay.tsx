
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorDisplayProps {
  error: string | null;
  onRefresh: () => void;
}

const ErrorDisplay = ({ error, onRefresh }: ErrorDisplayProps) => {
  if (!error) return null;
  
  // Check for different types of errors
  const isInfiniteRecursionError = 
    error.includes("infinite recursion") && 
    error.includes("policy") && 
    error.includes("user_roles");

  // Check for aggregate function error
  const isAggregateError = error.includes("aggregate functions is not allowed");
  
  // Check for connection errors
  const isConnectionError = 
    error.includes("Failed to fetch") || 
    error.includes("NetworkError") ||
    error.includes("FetchError") ||
    error.includes("connection") ||
    error.includes("اتصال") ||
    error.includes("Network request failed");

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-bold">
              {isConnectionError ? "خطأ في الاتصال" : "Error Loading Data"}
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
              <p className="mb-2">There is a permissions issue with the database policy configuration.</p>
              <p className="mb-2">This is likely caused by a recursive policy on the user_roles table that needs to be fixed.</p>
              <p className="text-sm bg-amber-50 p-2 border border-amber-200 rounded">
                <strong>Technical details:</strong> {error}
              </p>
            </div>
          ) : isAggregateError ? (
            <div>
              <p className="mb-2">There is an issue with the database query using aggregate functions.</p>
              <p className="mb-2">This might be caused by a configuration restriction or permission issue.</p>
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
          <p className="font-medium mb-2">Recommended solution:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>A database administrator needs to update the RLS policies on the user_roles table.</li>
            <li>The policy should be rewritten using a security definer function instead of a direct query.</li>
            <li>This will prevent the recursive loop that's causing this error.</li>
          </ol>
        </div>
      )}
      
      {isAggregateError && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="font-medium mb-2">Recommended solutions:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>Check your database connection and network connectivity.</li>
            <li>Verify that your Supabase RLS policies are correctly configured.</li>
            <li>Make sure you're properly authenticated if the resource requires authentication.</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
