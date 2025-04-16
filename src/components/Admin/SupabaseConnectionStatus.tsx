
import React, { useEffect, useState } from 'react';
import { Loader2, Database, AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const SupabaseConnectionStatus: React.FC<{
  onRetry?: () => void;
  showAsAlert?: boolean;
}> = ({ onRetry, showAsAlert = false }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'warning' | 'error'>('checking');
  const [message, setMessage] = useState<string | null>(null);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Function to check connection
  const checkConnection = async () => {
    setStatus('checking');
    try {
      const { pingDatabase } = await import('@/integrations/supabase/client');
      const result = await pingDatabase();
      
      if (!result.ok) {
        console.error('Database connection failed:', result.error);
        setStatus('error');
        setMessage(result.error || 'لا يمكن الاتصال بقاعدة البيانات');
      } else if (result.warning) {
        console.warn('Database connected with warning:', result.warning);
        setStatus('warning');
        setMessage(result.warning);
      } else {
        console.log('Database connected successfully');
        setStatus('connected');
        setMessage(null);
      }
    } catch (error) {
      console.error('Error checking database connection:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'خطأ غير معروف');
    }
  };

  // Handle retry button click
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      checkConnection();
    }
  };

  // Conditional content based on status
  const getStatusContent = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-4 w-4 mr-2 animate-spin" />,
          text: 'جاري التحقق من الاتصال...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
      case 'connected':
        return {
          icon: <CheckCircle className="h-4 w-4 mr-2" />,
          text: 'متصل بقاعدة البيانات',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4 mr-2" />,
          text: message || 'متصل مع تحذيرات',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-700'
        };
      case 'error':
        return {
          icon: <WifiOff className="h-4 w-4 mr-2" />,
          text: message || 'غير متصل بقاعدة البيانات',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
    }
  };

  const content = getStatusContent();

  if (showAsAlert) {
    return (
      <Alert 
        className={`${content.bgColor} ${content.borderColor} mb-4 flex justify-between items-center`}
      >
        <div className="flex items-center">
          {content.icon}
          <span className={content.textColor}>{content.text}</span>
        </div>
        {(status === 'error' || status === 'warning') && (
          <Button 
            variant="outline" 
            size="sm"
            className={`border-none ${content.textColor} hover:bg-opacity-20 hover:bg-black`} 
            onClick={handleRetry}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            إعادة المحاولة
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <div className={`flex items-center justify-between rounded-md p-2 mb-4 ${content.bgColor} ${content.borderColor}`}>
      <div className="flex items-center">
        <Database className="h-4 w-4 mr-2 text-gray-600" />
        <span className={`${content.textColor} text-sm font-medium`}>{content.text}</span>
      </div>
      {(status === 'error' || status === 'warning') && (
        <Button
          variant="ghost"
          size="sm"
          className={`${content.textColor} hover:bg-opacity-20 hover:bg-black p-1 h-8`}
          onClick={handleRetry}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">إعادة المحاولة</span>
        </Button>
      )}
    </div>
  );
};

export default SupabaseConnectionStatus;
