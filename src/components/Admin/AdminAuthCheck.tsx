
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

const AdminAuthCheck = ({ children }: AdminAuthCheckProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "لوحة تحكم المدير - الشركة الذهبية للصناعات الكيمياوية";
    
    // Only redirect if we're sure the user is not authenticated (loading completed)
    if (!loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
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
