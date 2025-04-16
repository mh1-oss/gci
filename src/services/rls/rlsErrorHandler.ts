
// Function to check if an error is related to RLS policies
export const isRlsPolicyError = (error: any): boolean => {
  if (!error) return false;
  
  const errorString = typeof error === 'string' 
    ? error.toLowerCase() 
    : error.message 
      ? error.message.toLowerCase() 
      : String(error).toLowerCase();
  
  return (
    errorString.includes('policy') ||
    errorString.includes('policies') ||
    errorString.includes('permission denied') ||
    errorString.includes('rls') ||
    errorString.includes('row level security') ||
    errorString.includes('recursive') ||
    errorString.includes('recursion') ||
    errorString.includes('user_roles')
  );
};

// Function to check if an error is specifically an infinite recursion in RLS
export const isRlsRecursionError = (error: any): boolean => {
  if (!error) return false;
  
  const errorString = typeof error === 'string' 
    ? error.toLowerCase() 
    : error.message 
      ? error.message.toLowerCase() 
      : String(error).toLowerCase();
  
  return (
    errorString.includes('infinite recursion') ||
    errorString.includes('recursion detected') ||
    (errorString.includes('recursion') && errorString.includes('user_roles'))
  );
};

/**
 * Creates a standardized error object for RLS policy violations
 * @param operation The database operation that was attempted ('create', 'read', 'update', 'delete', 'fetch')
 * @returns Error object with appropriate message
 */
export const createRlsError = (operation: 'create' | 'read' | 'update' | 'delete' | 'fetch'): Error => {
  const operationMap = {
    create: 'إنشاء',
    read: 'قراءة',
    update: 'تحديث',
    delete: 'حذف',
    fetch: 'جلب'
  };

  const arabicOperation = operationMap[operation] || operation;
  
  const error = new Error(
    `خطأ في سياسات الأمان (RLS): ليس لديك صلاحية ${arabicOperation} هذا العنصر. يرجى التحقق من إعدادات الأمان الخاصة بك.`
  );
  
  // Add a property to easily identify this as an RLS error
  (error as any).isRlsError = true;
  
  return error;
};

/**
 * Get a user-friendly error message for RLS policy violations
 * @param error The error object
 * @returns User-friendly error message
 */
export const getRlsErrorMessage = (error: any): string => {
  if (!isRlsPolicyError(error)) {
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
  
  if (isRlsRecursionError(error)) {
    return 'حدثت مشكلة في سياسات الأمان (RLS): تكرار لانهائي. يرجى الاتصال بمسؤول النظام.';
  }
  
  return 'ليس لديك الصلاحيات الكافية لإجراء هذه العملية. يرجى التحقق من إعدادات الأمان الخاصة بك.';
};

// Function to check database connectivity and detect RLS issues
export const checkDatabaseConnectivity = async (): Promise<{ 
  isConnected: boolean; 
  hasRlsIssue: boolean;
  error: string | null;
  message: string | null;
}> => {
  try {
    // Import supabase client dynamically to avoid circular dependencies
    const { pingDatabase } = await import('@/integrations/supabase/client');
    
    // Attempt to ping the database
    const pingResult = await pingDatabase();
    
    if (!pingResult.ok) {
      return { 
        isConnected: false,
        hasRlsIssue: false,
        error: pingResult.error || "Could not connect to database", 
        message: null
      };
    }
    
    // Check if there's an RLS issue warning
    const hasRlsIssue = !!pingResult.warning && 
      (pingResult.warning.includes('RLS') || 
       pingResult.warning.includes('policy') ||
       pingResult.warning.includes('permission'));
    
    return {
      isConnected: true,
      hasRlsIssue,
      error: null,
      message: hasRlsIssue ? "Connected but with RLS policy issues" : null
    };
    
  } catch (error) {
    console.error("Error checking database connectivity:", error);
    
    return {
      isConnected: false,
      hasRlsIssue: false,
      error: error instanceof Error ? error.message : "Unknown error checking connectivity",
      message: null
    };
  }
};
