
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { checkDatabaseConnectivity } from "@/services/products/utils/rlsErrorHandler";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatabaseIcon, RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SupabaseConnectionStatusProps {
  showWhenConnected?: boolean;
}

const SupabaseConnectionStatus = ({ showWhenConnected = false }: SupabaseConnectionStatusProps) => {
  const { toast } = useToast();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['supabaseConnectionStatus'],
    queryFn: checkDatabaseConnectivity,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const handleRefresh = async () => {
    toast({
      title: "جاري التحقق من الاتصال",
      description: "يتم التحقق من حالة الاتصال بقاعدة البيانات...",
    });
    
    try {
      await refetch();
      toast({
        title: data?.isConnected ? "تم الاتصال بنجاح" : "فشل الاتصال",
        description: data?.isConnected 
          ? data?.hasRlsIssue 
            ? "تم الاتصال بقاعدة البيانات مع وجود تحذيرات" 
            : "تم الاتصال بقاعدة البيانات بنجاح" 
          : "تعذر الاتصال بقاعدة البيانات",
        variant: data?.isConnected ? "default" : "destructive",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التحقق من الاتصال",
        variant: "destructive",
      });
    }
  };
  
  // If connection is good and we don't need to show the status, return null
  if (data?.isConnected && !data?.hasRlsIssue && !showWhenConnected) {
    return null;
  }
  
  if (isLoading) {
    return (
      <Alert className="mb-4 bg-gray-50">
        <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        <AlertTitle>جاري التحقق من الاتصال</AlertTitle>
        <AlertDescription>
          يرجى الانتظار بينما نتحقق من حالة الاتصال بقاعدة البيانات...
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!data?.isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>خطأ في الاتصال بقاعدة البيانات</AlertTitle>
        <AlertDescription className="flex flex-col">
          <p className="mb-2">تعذر الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
          {data?.error && (
            <p className="text-sm bg-red-100 p-2 rounded mb-4">
              <strong>معلومات تقنية:</strong> {data.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="mt-2"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (data?.hasRlsIssue) {
    return (
      <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
        <DatabaseIcon className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">تحذير بشأن قاعدة البيانات</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p className="mb-2">
            تم الاتصال بقاعدة البيانات ولكن هناك مشكلة في سياسات الأمان (RLS).
            نحن نستخدم البيانات المحلية حاليًا لضمان استمرار عمل التطبيق.
          </p>
          <p className="text-sm bg-amber-100 p-2 rounded mb-4">
            <strong>معلومات تقنية:</strong> تم اكتشاف تكرار لانهائي في سياسة الجدول user_roles.
            هذه المشكلة تتطلب إعادة تكوين سياسات RLS للجدول.
          </p>
          <div className="flex justify-end">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="mt-2 border-amber-300 text-amber-700"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              إعادة التحقق
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (data?.isConnected && showWhenConnected) {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <DatabaseIcon className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">تم الاتصال بقاعدة البيانات</AlertTitle>
        <AlertDescription className="text-green-700">
          تم الاتصال بقاعدة البيانات بنجاح.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default SupabaseConnectionStatus;
