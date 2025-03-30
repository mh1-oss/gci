
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminContentTabsProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

const AdminContentTabs = ({ currentTab, onTabChange }: AdminContentTabsProps) => {
  return (
    <TabsList className="mb-8">
      <TabsTrigger 
        value="about" 
        onClick={() => onTabChange("about")}
      >
        صفحة من نحن
      </TabsTrigger>
      <TabsTrigger 
        value="reviews" 
        onClick={() => onTabChange("reviews")}
      >
        المراجعات
      </TabsTrigger>
      <TabsTrigger 
        value="banners" 
        onClick={() => onTabChange("banners")}
      >
        البانرات
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminContentTabs;
