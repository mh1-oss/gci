
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AdminAbout from "./AdminAbout";
import AdminReviews from "./AdminReviews";
import AdminBanners from "./AdminBanners";
import AdminContentTabs from "./AdminContentTabs";

interface AdminContentProps {
  activeTab: string;
}

const AdminContent = ({ activeTab }: AdminContentProps) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const navigate = useNavigate();

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
        <AdminContentTabs 
          currentTab={currentTab} 
          onTabChange={handleTabChange} 
        />

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
