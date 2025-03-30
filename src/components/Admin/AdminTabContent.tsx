
import { Routes, Route, useLocation } from "react-router-dom";
import AdminOverview from "@/components/Admin/AdminOverview";
import AdminProducts from "@/components/Admin/AdminProducts";
import AdminCategories from "@/components/Admin/AdminCategories";
import AdminSettings from "@/components/Admin/AdminSettings";
import AdminContent from "@/components/Admin/AdminContent";
import AdminStock from "@/components/Admin/AdminStock";
import AdminSales from "@/components/Admin/AdminSales";

const AdminTabContent = () => {
  const location = useLocation();
  
  // Helper function to determine which content tab is active
  const getContentActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/admin/content/reviews")) return "reviews";
    if (path.includes("/admin/content/banners")) return "banners";
    return "about";
  };

  return (
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
  );
};

export default AdminTabContent;
