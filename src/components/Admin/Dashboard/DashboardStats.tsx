
import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, CreditCard, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStatsProps {
  stats: {
    productCount: number;
    categoryCount: number;
    orderCount: number;
    recentSales: number;
  };
  isLoading: boolean;
}

const DashboardStats = ({ stats, isLoading }: DashboardStatsProps) => {
  const navigate = useNavigate();

  if (isLoading) return null;

  return (
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
  );
};

export default DashboardStats;
