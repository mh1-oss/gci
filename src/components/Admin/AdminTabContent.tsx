
import { Route, Routes } from "react-router-dom";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminContent from "./AdminContent";
import AdminSettings from "./AdminSettings";
import AdminStock from "./AdminStock";
import AdminSales from "./AdminSales";

const AdminTabContent = () => {
  return (
    <div className="mt-6">
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="stock" element={<AdminStock />} />
        <Route path="sales/*" element={<AdminSales />} />
        <Route path="content" element={<AdminContent activeTab="about" />} />
        <Route path="content/reviews" element={<AdminContent activeTab="reviews" />} />
        <Route path="content/banners" element={<AdminContent activeTab="banners" />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
};

export default AdminTabContent;
