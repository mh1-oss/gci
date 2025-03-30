
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminAuthCheck from "@/components/Admin/AdminAuthCheck";
import AdminNavTabs from "@/components/Admin/AdminNavTabs";
import AdminTabContent from "@/components/Admin/AdminTabContent";
import { LogOut, Users, Package, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch dashboard stats
  const { isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        // Fetch product count
        const { count: productCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) throw productsError;

        // Fetch category count
        const { count: categoryCount, error: categoriesError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        if (categoriesError) throw categoriesError;

        // Fetch order count
        const { count: orderCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (ordersError) throw ordersError;

        // Fetch recent sales (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Fix: Convert date to ISO string for the query
        const sevenDaysAgoISOString = sevenDaysAgo.toISOString();
        
        const { data: recentSalesData, error: salesError } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', sevenDaysAgoISOString);

        if (salesError) throw salesError;

        // Calculate total sales amount
        const recentSalesTotal = recentSalesData?.reduce(
          (sum, sale) => sum + parseFloat(sale.total_amount), 
          0
        ) || 0;
        
        const newStats = {
          productCount: productCount || 0,
          categoryCount: categoryCount || 0,
          orderCount: orderCount || 0,
          recentSales: recentSalesTotal
        };
        
        setStats(newStats);
        return newStats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل إحصائيات لوحة التحكم",
          variant: "destructive",
        });
        return stats;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleLogout = async () => {
    await logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
    navigate("/");
  };

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
            <p className="text-gray-600">
              مرحباً بك في لوحة التحكم، يمكنك إدارة منتجاتك وفئاتك ومحتوى موقعك من هنا.
            </p>
            
            {!isLoading && (
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
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-500 mr-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الطلبات</p>
                      <p className="text-2xl font-bold">{stats.orderCount}</p>
                    </div>
                  </div>
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
                </div>
              </div>
            )}
          </div>

          <AdminNavTabs />
          
          <AdminTabContent />
        </div>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
