
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Loader2, WifiOff, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { pingDatabase } from "@/integrations/supabase/client";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck = ({ children }: AdminAuthCheckProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  // Check database connection
  const checkDbConnection = async () => {
    setCheckingDb(true);
    try {
      const result = await pingDatabase();
      console.log("Database connection result:", result);
      setDbConnected(result.ok);
    } catch (error) {
      console.error("Error checking database connection:", error);
      setDbConnected(false);
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    document.title = "لوحة تحكم المدير - الشركة الذهبية للصناعات الكيمياوية";
    
    // Check database connection on mount
    checkDbConnection();
    
    // Only redirect if we're sure the user is not authenticated (loading completed)
    if (!loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Database connection error
  if (dbConnected === false) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center p-8 max-w-md">
          <WifiOff className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">خطأ في الاتصال بقاعدة البيانات</h2>
          <p className="text-gray-600 mb-6">
            لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={checkDbConnection} 
              disabled={checkingDb}
              className="w-full"
            >
              {checkingDb ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              إعادة المحاولة
            </Button>
            <Link 
              to="/" 
              className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading || dbConnected === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 text-brand-blue animate-spin mb-4" />
          <h2 className="text-2xl font-medium mb-2">جاري التحقق...</h2>
          <p className="text-gray-600">
            يرجى الانتظار بينما نتحقق من صلاحيات الوصول الخاصة بك.
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if authenticated but not an admin
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">تم رفض الوصول</h2>
          <p className="text-gray-600 mb-6">
            حسابك ليس لديه صلاحيات إدارية كافية للوصول إلى لوحة التحكم.
          </p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-darkblue transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">تم رفض الوصول</h2>
          <p className="text-gray-600 mb-6">
            تحتاج إلى تسجيل الدخول كمسؤول للوصول إلى هذه الصفحة.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-darkblue transition-colors"
          >
            الذهاب إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminAuthCheck;
