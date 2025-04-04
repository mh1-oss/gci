
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
      
      // Use RPC functions to bypass RLS
      const { data: products, error: productsError } = await supabase.rpc('get_all_products');
      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw productsError;
      }
      
      const { data: categories, error: categoriesError } = await supabase.rpc('get_all_categories');
      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }
      
      setProductCount(products ? products.length : 0);
      setCategoryCount(categories ? categories.length : 0);
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
