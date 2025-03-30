
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminSettings from "./AdminSettings";
import AdminAbout from "./AdminAbout";
import AdminReviews from "./AdminReviews";
import AdminStock from "./AdminStock";
import AdminSales from "./AdminSales";

interface AdminContentProps {
  activeTab: string;
}

const AdminContent = ({ activeTab }: AdminContentProps) => {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="products">المنتجات</TabsTrigger>
        <TabsTrigger value="categories">الفئات</TabsTrigger>
        <TabsTrigger value="stock">المخزون</TabsTrigger>
        <TabsTrigger value="sales">المبيعات</TabsTrigger>
        <TabsTrigger value="about">من نحن</TabsTrigger>
        <TabsTrigger value="reviews">المراجعات</TabsTrigger>
        <TabsTrigger value="settings">الإعدادات</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <AdminOverview />
      </TabsContent>

      <TabsContent value="products">
        <AdminProducts />
      </TabsContent>

      <TabsContent value="categories">
        <AdminCategories />
      </TabsContent>

      <TabsContent value="stock">
        <AdminStock />
      </TabsContent>

      <TabsContent value="sales">
        <AdminSales />
      </TabsContent>

      <TabsContent value="about">
        <AdminAbout />
      </TabsContent>

      <TabsContent value="reviews">
        <AdminReviews />
      </TabsContent>

      <TabsContent value="settings">
        <AdminSettings />
      </TabsContent>
    </Tabs>
  );
};

export default AdminContent;
