
import { Routes, Route } from "react-router-dom";
import AdminAuthCheck from "@/components/Admin/AdminAuthCheck";
import AdminNavTabs from "@/components/Admin/AdminNavTabs";
import AdminTabContent from "@/components/Admin/AdminTabContent";
import AdminContent from "@/components/Admin/AdminContent";
import AdminProducts from "@/components/Admin/AdminProducts";
import AdminCategories from "@/components/Admin/AdminCategories";
import AdminSettings from "@/components/Admin/AdminSettings";
import AdminOverview from "@/components/Admin/AdminOverview";
import AdminStock from "@/components/Admin/AdminStock";
import AdminSales from "@/components/Admin/AdminSales";

const AdminDashboard = () => {
  return (
    <AdminAuthCheck>
      <div className="py-6" dir="rtl">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">لوحة تحكم المدير</h1>
            <p className="text-gray-600">
              إدارة منتجات موقعك، والفئات، والمحتوى، والإعدادات.
            </p>
          </div>

          <AdminNavTabs />
          
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="content" element={<AdminContent activeTab="about" />} />
            <Route path="content/reviews" element={<AdminContent activeTab="reviews" />} />
            <Route path="content/banners" element={<AdminContent activeTab="banners" />} />
          </Routes>
        </div>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
