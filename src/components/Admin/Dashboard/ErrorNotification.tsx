
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';
import RlsErrorDisplay from '@/components/ErrorHandling/RlsErrorDisplay';

interface ErrorNotificationProps {
  error: Error | null;
  onRefresh: () => void;
}

const ErrorNotification = ({ error, onRefresh }: ErrorNotificationProps) => {
  if (!error) return null;

  return isRlsPolicyError(error) ? (
    <RlsErrorDisplay
      error={error}
      onRetry={onRefresh}
    />
  ) : (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold mb-2">خطأ في تحميل البيانات</h3>
          <p>{error instanceof Error ? error.message : "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم"}</p>
        </div>
        <Button 
          onClick={onRefresh}
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>
    </div>
  );
};

export default ErrorNotification;
