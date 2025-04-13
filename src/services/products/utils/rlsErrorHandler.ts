
/**
 * Utility functions to handle RLS policy errors
 */

/**
 * Checks if an error is related to RLS policy infinite recursion
 */
export const isRlsInfiniteRecursionError = (error: any): boolean => {
  return !!(error?.message && (
    error.message.includes("infinite recursion") || 
    error.message.includes("policy for relation") ||
    error.message.includes("user_roles")
  ));
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
      hasRlsIssue: pingResult.warning?.includes('RLS policy'),
      error: pingResult.error || null,
      message: pingResult.warning || null
    };
  } catch (error) {
    console.error('Error checking database connectivity:', error);
    return {
      isConnected: false,
      hasRlsIssue: isRlsInfiniteRecursionError(error),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check database connection'
    };
  }
};

/**
 * Display more informative error message for RLS policy issues
 */
export const getRlsErrorMessage = (): string => {
  return "سياسة قاعدة البيانات تواجه مشكلة متكررة. نحن نستخدم البيانات المحلية بدلاً من ذلك. يرجى التواصل مع مدير النظام.";
};
