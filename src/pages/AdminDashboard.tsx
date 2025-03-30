
import { useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOverview from "@/components/Admin/AdminOverview";
import AdminProducts from "@/components/Admin/AdminProducts";
import AdminCategories from "@/components/Admin/AdminCategories";
import AdminSettings from "@/components/Admin/AdminSettings";
import AdminContent from "@/components/Admin/AdminContent";
import AdminStock from "@/components/Admin/AdminStock";
import AdminSales from "@/components/Admin/AdminSales";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Settings, 
  FileText,
  AlertTriangle,
  BarChart3,
  ShoppingCart
} from "lucide-react";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "لوحة تحكم المدير - الشركة الذهبية للصناعات الكيمياوية";
    
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || !isAdmin) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
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

  // Helper function to determine which tab is active
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/admin/products")) return "products";
    if (path.includes("/admin/categories")) return "categories";
    if (path.includes("/admin/content")) return "content";
    if (path.includes("/admin/settings")) return "settings";
    if (path.includes("/admin/stock")) return "stock";
    if (path.includes("/admin/sales")) return "sales";
    return "overview";
  };

  // Helper function to determine which content tab is active
  const getContentActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/admin/content/reviews")) return "reviews";
    if (path.includes("/admin/content/banners")) return "banners";
    return "about";
  };

  return (
    <div className="py-6" dir="rtl">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">لوحة تحكم المدير</h1>
          <p className="text-gray-600">
            إدارة منتجات موقعك، والفئات، والمحتوى، والإعدادات.
          </p>
        </div>

        <Tabs value={getActiveTab()} className="space-y-6">
          <TabsList className="w-full border-b border-gray-200 pb-0 rounded-none bg-transparent overflow-x-auto">
            <div className="flex space-x-2 space-x-reverse w-full">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin">
                  <LayoutDashboard className="h-4 w-4 ml-1" />
                  نظرة عامة
                </Link>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin/products">
                  <Package className="h-4 w-4 ml-1" />
                  المنتجات
                </Link>
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin/categories">
                  <FolderTree className="h-4 w-4 ml-1" />
                  الفئات
                </Link>
              </TabsTrigger>
              <TabsTrigger 
                value="stock" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin/stock">
                  <BarChart3 className="h-4 w-4 ml-1" />
                  المخزون
                </Link>
              </TabsTrigger>
              <TabsTrigger 
                value="sales" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin/sales">
                  <ShoppingCart className="h-4 w-4 ml-1" />
                  المبيعات
                </Link>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin/content">
                  <FileText className="h-4 w-4 ml-1" />
                  المحتوى
                </Link>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
                asChild
              >
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 ml-1" />
                  الإعدادات
                </Link>
              </TabsTrigger>
            </div>
          </TabsList>

          <div className="p-6 bg-white rounded-lg shadow-sm min-h-[500px]">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="products/*" element={<AdminProducts />} />
              <Route path="categories/*" element={<AdminCategories />} />
              <Route path="content" element={<AdminContent activeTab={getContentActiveTab()} />} />
              <Route path="content/reviews" element={<AdminContent activeTab="reviews" />} />
              <Route path="content/banners" element={<AdminContent activeTab="banners" />} />
              <Route path="settings/*" element={<AdminSettings />} />
              <Route path="stock/*" element={<AdminStock />} />
              <Route path="sales/*" element={<AdminSales />} />
            </Routes>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
