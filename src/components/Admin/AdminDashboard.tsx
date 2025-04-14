
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AdminAuthCheck from "@/components/Admin/AdminAuthCheck";
import AdminNavTabs from "@/components/Admin/AdminNavTabs";
import AdminTabContent from "@/components/Admin/AdminTabContent";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase, pingDatabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import SupabaseConnectionStatus from "./SupabaseConnectionStatus";
import { 
  DashboardHeader, 
  DashboardStats, 
  QuickActionsPanel, 
  DashboardWelcome,
  ErrorNotification
} from "./Dashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    orderCount: 0,
    recentSales: 0
  });

  const { isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        console.log("Fetching dashboard stats...");
        
        // Check connection first, but continue even with warnings
        const pingResult = await pingDatabase();
        
        if (!pingResult.ok) {
          throw new Error("Cannot connect to database");
        }
        
        // If we have a connection warning, display it but continue
        if (pingResult.warning) {
          toast({
            title: "تحذير",
            description: "تم الاتصال بقاعدة البيانات ولكن هناك مشكلة في إعدادات الأمان",
            variant: "default",
          });
        }
        
        // Get product count with simplified query
        let productCount = 0;
        try {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id');
          
          if (!productsError) {
            productCount = productsData ? productsData.length : 0;
          } else {
            console.warn("Error getting product count:", productsError);
          }
        } catch (err) {
          console.warn("Error getting product count:", err);
        }
        
        // Get category count with simplified query
        let categoryCount = 0;
        try {
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('id');
          
          if (!categoriesError) {
            categoryCount = categoriesData ? categoriesData.length : 0;
          } else {
            console.warn("Error getting category count:", categoriesError);
          }
        } catch (err) {
          console.warn("Error getting category count:", err);
        }

        // For orders and sales, use fallback values since these might have stricter RLS
        let orderCount = 0;
        let recentSales = 0;
        
        // Only try to fetch these if we don't have RLS warnings
        if (!pingResult.warning) {
          try {
            // Try to fetch order count
            const { count, error: ordersError } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true });

            if (!ordersError) {
              orderCount = count || 0;
            }
          } catch (err) {
            console.warn("Could not fetch order count, using default value", err);
          }
          
          try {
            // Try to calculate recent sales (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoISOString = sevenDaysAgo.toISOString();
            
            const { data: recentSalesData, error: salesError } = await supabase
              .from('sales')
              .select('total_amount')
              .gte('created_at', sevenDaysAgoISOString);

            if (!salesError && recentSalesData) {
              recentSales = recentSalesData.reduce(
                (sum, sale) => sum + (typeof sale.total_amount === 'string' ? parseFloat(sale.total_amount) : Number(sale.total_amount)), 
                0
              );
            }
          } catch (err) {
            console.warn("Could not fetch sales data, using default value", err);
          }
        }
        
        const newStats = {
          productCount,
          categoryCount,
          orderCount,
          recentSales
        };
        
        console.log("Dashboard stats fetched:", newStats);
        setStats(newStats);
        return newStats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "تحديث البيانات",
      description: "يتم تحديث لوحة المعلومات الآن",
    });
  };

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
          <DashboardHeader onLogout={handleLogout} />

          <div className="mb-6">
            <DashboardWelcome />
            
            {/* Display database connection status */}
            <SupabaseConnectionStatus />
            
            <ErrorNotification error={error as Error | null} onRefresh={handleRefresh} />
            
            <DashboardStats stats={stats} isLoading={isLoading} />
          </div>

          <QuickActionsPanel />

          <AdminNavTabs />
          
          <AdminTabContent />
        </div>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
