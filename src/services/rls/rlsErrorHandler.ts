
/**
 * Centralized error handler for Row Level Security (RLS) policy issues
 */

// Constants for error messages
export const RLS_ERROR_MESSAGES = {
  GENERAL: "مشكلة في سياسات قاعدة البيانات. نعرض البيانات المخزنة محلياً.",
  USER_ROLES: "تم اكتشاف مشكلة في سياسات الأدوار وصلاحيات المستخدمين.",
  CREATE: "تعذر إنشاء العنصر بسبب مشكلة في سياسات قاعدة البيانات.",
  UPDATE: "تعذر تحديث العنصر بسبب مشكلة في سياسات قاعدة البيانات.",
  DELETE: "تعذر حذف العنصر بسبب مشكلة في سياسات قاعدة البيانات.",
  FETCH: "تعذر جلب البيانات من قاعدة البيانات. نعرض البيانات المخزنة محلياً."
};

// Error types
export type RlsErrorType = 'create' | 'update' | 'delete' | 'fetch' | 'general' | 'user_roles';

/**
 * Check if an error is related to RLS policy issues
 * @param error Any error object
 * @returns boolean indicating if it's an RLS policy error
 */
export const isRlsPolicyError = (error: any): boolean => {
  if (!error) return false;
  
  // Convert error to string safely
  const errorString = typeof error === 'string' 
    ? error 
    : error.message || error.error || JSON.stringify(error);
  
  const errorMessage = errorString.toLowerCase();
  
  // Extended pattern matching for RLS policy errors
  return (
    errorMessage.includes("infinite recursion") || 
    errorMessage.includes("policy for relation") ||
    errorMessage.includes("user_roles") ||
    errorMessage.includes("row-level security") ||
    errorMessage.includes("permission denied") ||
    errorMessage.includes("rls") ||
    errorMessage.includes("policy") ||
    errorMessage.includes("violates row-level") ||
    (error.code && (
      error.code === "42P17" || // Infinite recursion code
      error.code === "42501" || // Permission denied code
      error.code === "P0001" && errorMessage.includes("policy") // PL/pgSQL error raising policy issues
    ))
  );
};

/**
 * Check if an error is specifically related to infinite recursion in RLS policies
 * @param error Any error object
 * @returns boolean indicating if it's an RLS infinite recursion error
 */
export const isRlsRecursionError = (error: any): boolean => {
  if (!error) return false;
  
  // Convert error to string safely
  const errorString = typeof error === 'string' 
    ? error 
    : error.message || error.error || JSON.stringify(error);
    
  const errorMessage = errorString.toLowerCase();
  
  // More comprehensive detection for recursion errors
  return (
    errorMessage.includes("infinite recursion") ||
    errorMessage.includes("policy for relation") ||
    errorMessage.includes("user_roles") ||
    (error.code && error.code === "42P17")
  );
};

/**
 * Get appropriate error message based on the RLS error type
 * @param type Type of operation that caused the RLS error
 * @returns Localized error message
 */
export const getRlsErrorMessage = (type: RlsErrorType = 'general'): string => {
  const key = type.toUpperCase() as keyof typeof RLS_ERROR_MESSAGES;
  return RLS_ERROR_MESSAGES[key] || RLS_ERROR_MESSAGES.GENERAL;
};

/**
 * Create an Error object with appropriate message for RLS policy issues
 * @param type Type of operation that caused the RLS error
 * @returns Error object with localized message
 */
export const createRlsError = (type: RlsErrorType = 'general'): Error => {
  const error = new Error(getRlsErrorMessage(type));
  // Add a property to identify this as an RLS error
  Object.defineProperty(error, 'isRlsError', { value: true });
  return error;
};

/**
 * Handle RLS errors with appropriate fallback behavior
 * @param error The caught error
 * @param errorType Type of operation causing the error
 * @param fallbackFn Optional fallback function to execute on RLS error
 * @throws Re-throws error if not an RLS error
 */
export const handleRlsError = async <T>(
  error: any, 
  errorType: RlsErrorType,
  fallbackFn?: () => Promise<T>
): Promise<T | null> => {
  if (isRlsPolicyError(error)) {
    console.warn(`RLS policy error during ${errorType} operation:`, error);
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw createRlsError(errorType);
  }
  
  // Re-throw if not an RLS error
  throw error;
};

/**
 * Handles database connectivity check with RLS error awareness
 * @returns Object with connection status and any relevant messages
 */
export const checkDatabaseConnectivity = async () => {
  try {
    const { pingDatabase } = await import('@/integrations/supabase/client');
    const pingResult = await pingDatabase();
    
    return {
      isConnected: pingResult.ok,
      hasRlsIssue: pingResult.warning?.includes('RLS policy') || 
                   pingResult.warning?.includes('policy configuration'),
      error: pingResult.error || null,
      message: pingResult.warning || null
    };
  } catch (error) {
    console.error('Error checking database connectivity:', error);
    return {
      isConnected: false,
      hasRlsIssue: isRlsPolicyError(error),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check database connection'
    };
  }
};
