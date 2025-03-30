
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        data-state={currentTab === "about" ? "active" : "inactive"}
        className="data-[state=active]:bg-brand-blue data-[state=active]:text-white"
      >
        صفحة من نحن
      </TabsTrigger>
      <TabsTrigger 
        value="reviews" 
        onClick={() => onTabChange("reviews")}
        data-state={currentTab === "reviews" ? "active" : "inactive"}
        className="data-[state=active]:bg-brand-blue data-[state=active]:text-white"
      >
        المراجعات
      </TabsTrigger>
      <TabsTrigger 
        value="banners" 
        onClick={() => onTabChange("banners")}
        data-state={currentTab === "banners" ? "active" : "inactive"}
        className="data-[state=active]:bg-brand-blue data-[state=active]:text-white"
      >
        البانرات
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminContentTabs;
