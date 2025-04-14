
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pingDatabase } from "@/integrations/supabase/client";
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // Use the pingDatabase function from supabase client
      const connectionResult = await pingDatabase();
      
      if (!connectionResult.ok) {
        console.error('Supabase connection error:', connectionResult.error);
        setConnectionStatus('disconnected');
        setError(`خطأ في الاتصال بقاعدة البيانات: ${connectionResult.error || 'سبب غير معروف'}`);
      } else {
        console.log('Supabase connection successful');
        setConnectionStatus('connected');
        
        // If we're connected but there's a warning about RLS issues
        if (connectionResult.warning) {
          if (connectionResult.warning.includes('RLS policy') || 
              connectionResult.warning.includes('user_roles')) {
            toast({
              title: "تحذير",
              description: "تم الاتصال بقاعدة البيانات ولكن هناك مشكلة في إعدادات الأمان (RLS)",
              variant: "default",
            });
          }
        }
        
        setError(null);
      }
    } catch (err: any) {
      console.error('Failed to check connection:', err);
      
      // Special handling for RLS issues which may happen during connection testing
      if (isRlsPolicyError(err)) {
        toast({
          title: "تحذير",
          description: "تم الاتصال بقاعدة البيانات ولكن هناك مشكلة في إعدادات الأمان (RLS)",
          variant: "default",
        });
        
        // We're connected, but with RLS issues
        setConnectionStatus('connected');
        setError("مشكلة في سياسات قاعدة البيانات (RLS). قد تواجه صعوبات في بعض العمليات.");
      } else {
        setConnectionStatus('disconnected');
        setError('تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى في وقت لاحق.');
      }
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
