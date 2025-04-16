
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
