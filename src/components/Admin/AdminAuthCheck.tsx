
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { checkDatabaseConnectivity } from "@/services/products/utils/rlsErrorHandler";
import DatabaseConnectionError from "../ErrorHandling/DatabaseConnectionError";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck = ({ children }: AdminAuthCheckProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [dbCheckDone, setDbCheckDone] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbHasRlsIssue, setDbHasRlsIssue] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated and admin
    if (!loading && !isAuthenticated) {
      navigate("/login");
    } else if (!loading && isAuthenticated && !isAdmin) {
      navigate("/"); // Redirect non-admin users
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  // Check database connection
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const result = await checkDatabaseConnectivity();
        console.log("Database connection result:", result);
        
        if (!result.isConnected) {
          setDbError(result.error || "تعذر الاتصال بقاعدة البيانات");
        } else if (result.hasRlsIssue) {
          // We can still continue with RLS issues, just log it
          setDbHasRlsIssue(true);
          console.log("Database connection has RLS issues but is functional");
        }
        
        setDbCheckDone(true);
      } catch (error) {
        console.error("Error checking database connection:", error);
        setDbError("حدث خطأ غير متوقع أثناء التحقق من اتصال قاعدة البيانات");
        setDbCheckDone(true);
      }
    };

    if (isAuthenticated && isAdmin && !dbCheckDone) {
      checkDbConnection();
    }
  }, [isAuthenticated, isAdmin, dbCheckDone]);

  // Show loading state
  if (loading || (isAuthenticated && isAdmin && !dbCheckDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show database error if there's a critical connection issue
  if (dbError && dbCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <DatabaseConnectionError 
            message={dbError}
            retryFn={() => {
              setDbCheckDone(false);
              setDbError(null);
            }}
          />
        </div>
      </div>
    );
  }

  // If user is admin and authenticated (and db is ok or has manageable issues)
  if (isAuthenticated && isAdmin) {
    return <>{children}</>;
  }

  return null;
};

export default AdminAuthCheck;
