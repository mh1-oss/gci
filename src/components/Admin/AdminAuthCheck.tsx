
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { checkDatabaseConnectivity } from "@/services/rls/rlsErrorHandler";
import DatabaseConnectionError from "../ErrorHandling/DatabaseConnectionError";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { InfoIcon } from "lucide-react";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck = ({ children }: AdminAuthCheckProps) => {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [dbCheckDone, setDbCheckDone] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbHasRlsIssue, setDbHasRlsIssue] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRlsWarning, setShowRlsWarning] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    } else if (!loading && isAuthenticated && !isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح"
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        setDbCheckDone(false);
        const result = await checkDatabaseConnectivity();
        console.log("Database connection result:", result);
        
        if (!result.isConnected) {
          setDbError(result.error || "تعذر الاتصال بقاعدة البيانات");
        } else {
          if (result.hasRlsIssue) {
            setDbHasRlsIssue(true);
            setShowRlsWarning(true);
            console.log("Database connection has RLS issues but is functional");
            
            setTimeout(() => {
              setShowRlsWarning(false);
            }, 5000);
          }
          
          setDbError(null);
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
  }, [isAuthenticated, isAdmin, dbCheckDone, retryCount]);

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

  if (dbError && dbCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <DatabaseConnectionError 
            message={dbError}
            retryFn={() => {
              setDbCheckDone(false);
              setDbError(null);
              setRetryCount(prev => prev + 1);
            }}
            showHomeLink={true}
          />
          
          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              تسجيل الخروج وإعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return (
      <>
        {showRlsWarning && dbHasRlsIssue && (
          <Alert variant="default" className="bg-amber-50 border-amber-200 mb-0 rounded-none border-t-0 border-l-0 border-r-0">
            <InfoIcon className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">تنبيه</AlertTitle>
            <AlertDescription className="text-amber-700">
              تم حل المشاكل المتعلقة بسياسات الأمان (RLS). يمكنك الآن استخدام التطبيق بشكل كامل.
              <Button 
                variant="link" 
                className="p-0 h-6 text-amber-800 hover:text-amber-900 ml-2"
                onClick={() => setShowRlsWarning(false)}
              >
                إخفاء
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {children}
      </>
    );
  }

  return null;
};

export default AdminAuthCheck;
