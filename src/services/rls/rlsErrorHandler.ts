
/**
 * Centralized error handler for Row Level Security (RLS) policy issues
 */

// Constants for error messages
export const RLS_ERROR_MESSAGES = {
  GENERAL: "مشكلة في سياسات قاعدة البيانات. يرجى التحقق من إعدادات الأمان أو التواصل مع مدير النظام.",
  USER_ROLES: "تم اكتشاف مشكلة في سياسات الأدوار وصلاحيات المستخدمين. يرجى التواصل مع مدير النظام.",
  CREATE: "تعذر إنشاء العنصر بسبب مشكلة في سياسات قاعدة البيانات.",
  UPDATE: "تعذر تحديث العنصر بسبب مشكلة في سياسات قاعدة البيانات.",
  DELETE: "تعذر حذف العنصر بسبب مشكلة في سياسات قاعدة البيانات.",
  FETCH: "تعذر جلب البيانات بسبب مشكلة في سياسات قاعدة البيانات."
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
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.toString();
  
  return !!(errorMessage && (
    errorMessage.includes("infinite recursion") || 
    errorMessage.includes("policy for relation") ||
    errorMessage.includes("user_roles") ||
    errorMessage.includes("row-level security") ||
    errorMessage.includes("permission denied") ||
    errorMessage.includes("RLS") ||
    (error.code && (error.code === "42P17" || error.code === "42501"))
  ));
};

/**
 * Check if an error is specifically related to infinite recursion in RLS policies
 * @param error Any error object
 * @returns boolean indicating if it's an RLS infinite recursion error
 */
export const isRlsRecursionError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.toString();
  
  return !!(errorMessage && (
    errorMessage.includes("infinite recursion") ||
    (error.code && error.code === "42P17")
  ));
};

/**
 * Get appropriate error message based on the RLS error type
 * @param type Type of operation that caused the RLS error
 * @returns Localized error message
 */
export const getRlsErrorMessage = (type: RlsErrorType = 'general'): string => {
  return RLS_ERROR_MESSAGES[type.toUpperCase() as keyof typeof RLS_ERROR_MESSAGES] || RLS_ERROR_MESSAGES.GENERAL;
};

/**
 * Create an Error object with appropriate message for RLS policy issues
 * @param type Type of operation that caused the RLS error
 * @returns Error object with localized message
 */
export const createRlsError = (type: RlsErrorType = 'general'): Error => {
  return new Error(getRlsErrorMessage(type));
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
