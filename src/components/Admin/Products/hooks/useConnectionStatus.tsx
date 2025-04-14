
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkDatabaseConnectivity } from "@/services/products/utils/rlsErrorHandler";

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      const connectionResult = await checkDatabaseConnectivity();
      
      if (!connectionResult.isConnected) {
        console.error('Supabase connection error:', connectionResult.error);
        setConnectionStatus('disconnected');
        setError(`خطأ في الاتصال بقاعدة البيانات: ${connectionResult.error}`);
      } else {
        console.log('Supabase connection successful');
        setConnectionStatus('connected');
        
        if (connectionResult.hasRlsIssue) {
          toast({
            title: "تحذير",
            description: "تم الاتصال بقاعدة البيانات ولكن هناك مشكلة في إعدادات الأمان",
            variant: "default",
          });
        }
        
        setError(null);
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
      setConnectionStatus('disconnected');
      setError('تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى في وقت لاحق.');
    }
  };
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  return {
    connectionStatus,
    error,
    checkConnection,
    setError
  };
};
