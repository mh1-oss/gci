
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAbout from "./AdminAbout";
import AdminReviews from "./AdminReviews";
import AdminBanners from "./AdminBanners";

interface AdminContentProps {
  activeTab: string;
}

const AdminContent = ({ activeTab }: AdminContentProps) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (value === "about") {
      navigate("/admin/content");
    } else {
      navigate(`/admin/content/${value}`);
    }
  };

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold mb-6">إدارة المحتوى</h2>
      
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="about">صفحة من نحن</TabsTrigger>
          <TabsTrigger value="reviews">المراجعات</TabsTrigger>
          <TabsTrigger value="banners">البانرات</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <AdminAbout />
        </TabsContent>

        <TabsContent value="reviews">
          <AdminReviews />
        </TabsContent>

        <TabsContent value="banners">
          <AdminBanners />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
