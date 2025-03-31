
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminAuthCheck from "@/components/Admin/AdminAuthCheck";
import AdminNavTabs from "@/components/Admin/AdminNavTabs";
import AdminTabContent from "@/components/Admin/AdminTabContent";
import { LogOut, Package, CreditCard, ShoppingCart, Newspaper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  productCount: number;
  categoryCount: number;
  orderCount: number;
  recentSales: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    categoryCount: 0,
    orderCount: 0,
    recentSales: 0
  });

  const { isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        console.log("Fetching dashboard stats...");
        
        // Fetch product count
        const { count: productCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) {
          console.error("Error fetching product count:", productsError);
          throw productsError;
        }

        // Fetch category count
        const { count: categoryCount, error: categoriesError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        if (categoriesError) {
          console.error("Error fetching category count:", categoriesError);
          throw categoriesError;
        }

        // Fetch order count
        const { count: orderCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (ordersError) {
          console.error("Error fetching order count:", ordersError);
          throw ordersError;
        }

        // Calculate recent sales (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const sevenDaysAgoISOString = sevenDaysAgo.toISOString();
        
        const { data: recentSalesData, error: salesError } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', sevenDaysAgoISOString);

        if (salesError) {
          console.error("Error fetching recent sales:", salesError);
          throw salesError;
        }

        const recentSalesTotal = recentSalesData?.reduce(
          (sum, sale) => sum + (typeof sale.total_amount === 'string' ? parseFloat(sale.total_amount) : Number(sale.total_amount)), 
          0
        ) || 0;
        
        const newStats = {
          productCount: productCount || 0,
          categoryCount: categoryCount || 0,
          orderCount: orderCount || 0,
          recentSales: recentSalesTotal
        };
        
        console.log("Dashboard stats fetched:", newStats);
        setStats(newStats);
        return newStats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم",
          variant: "destructive",
        });
        // Return current stats to avoid breaking the UI
        return stats;
      }
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 3, // Retry 3 times on failure
    retryDelay: 3000, // 3 seconds between retries
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
    navigate("/");
  };

  // Add error display in case the stats fail to load
  if (error) {
    console.error("Dashboard query error:", error);
  }

  return (
    <AdminAuthCheck>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              مرحباً بك في لوحة التحكم، يمكنك إدارة منتجاتك وفئاتك ومبيعاتك ومحتوى موقعك من هنا.
            </p>
            
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h3>
                <p>يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline" 
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                >
                  تحديث الصفحة
                </Button>
              </div>
            ) : !isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-500 mr-4">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المنتجات</p>
                      <p className="text-2xl font-bold">{stats.productCount}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 text-blue-600"
                    onClick={() => navigate('/admin/products')}
                  >
                    إدارة المنتجات
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-50 text-green-500 mr-4">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الفئات</p>
                      <p className="text-2xl font-bold">{stats.categoryCount}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 text-green-600"
                    onClick={() => navigate('/admin/categories')}
                  >
                    إدارة الفئات
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-500 mr-4">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المبيعات</p>
                      <p className="text-2xl font-bold">{stats.orderCount}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 text-amber-600"
                    onClick={() => navigate('/admin/sales')}
                  >
                    إدارة المبيعات
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-50 text-purple-500 mr-4">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المبيعات (آخر 7 أيام)</p>
                      <p className="text-2xl font-bold">{stats.recentSales.toFixed(2)} د.ع</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 text-purple-600"
                    onClick={() => navigate('/admin/sales')}
                  >
                    تفاصيل المبيعات
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold mb-4">الإجراءات السريعة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center p-4 h-auto"
                onClick={() => navigate('/admin/products')}
              >
                <Package className="h-5 w-5 ml-2" />
                <span>إضافة منتج جديد</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center p-4 h-auto"
                onClick={() => navigate('/admin/categories')}
              >
                <Package className="h-5 w-5 ml-2" />
                <span>إضافة فئة جديدة</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center p-4 h-auto"
                onClick={() => navigate('/admin/content')}
              >
                <Newspaper className="h-5 w-5 ml-2" />
                <span>تعديل محتوى الموقع</span>
              </Button>
            </div>
          </div>

          <AdminNavTabs />
          
          <AdminTabContent />
        </div>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
