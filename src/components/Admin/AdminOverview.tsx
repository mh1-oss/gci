
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "@/hooks/use-toast";
import { StatsCardGrid, QuickActions, SystemInfo, ErrorDisplay } from "./Overview";

const AdminOverview = () => {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, exchangeRate } = useCurrency();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use direct queries instead of RPC functions to avoid aggregate-related errors
      const productsPromise = supabase.from('products').select('id');
      const categoriesPromise = supabase.from('categories').select('id');
      
      const [productsResult, categoriesResult] = await Promise.all([
        productsPromise,
        categoriesPromise
      ]);
      
      if (productsResult.error) {
        console.error("Error fetching products:", productsResult.error);
        throw productsResult.error;
      }
      
      if (categoriesResult.error) {
        console.error("Error fetching categories:", categoriesResult.error);
        throw categoriesResult.error;
      }
      
      setProductCount(productsResult.data ? productsResult.data.length : 0);
      setCategoryCount(categoriesResult.data ? categoriesResult.data.length : 0);
    } catch (error: any) {
      console.error("Error fetching overview data:", error);
      setError(error.message || "Error loading dashboard data");
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "تحديث البيانات",
      description: "تم تحديث البيانات بنجاح",
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <ErrorDisplay error={error} onRefresh={handleRefresh} />
      
      <StatsCardGrid 
        productCount={productCount}
        categoryCount={categoryCount}
        loading={loading}
        exchangeRate={exchangeRate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActions onRefresh={handleRefresh} />
        <SystemInfo currency={currency} exchangeRate={exchangeRate} />
      </div>
    </div>
  );
};

export default AdminOverview;
