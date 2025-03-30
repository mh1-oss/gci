
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Settings, 
  FileText,
  BarChart3,
  ShoppingCart
} from "lucide-react";

const AdminNavTabs = () => {
  const location = useLocation();

  // Helper function to determine which tab is active
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/admin/products")) return "products";
    if (path.includes("/admin/categories")) return "categories";
    if (path.includes("/admin/content")) return "content";
    if (path.includes("/admin/settings")) return "settings";
    if (path.includes("/admin/stock")) return "stock";
    if (path.includes("/admin/sales")) return "sales";
    return "overview";
  };

  return (
    <Tabs value={getActiveTab()} className="space-y-6">
      <TabsList className="w-full border-b border-gray-200 pb-0 rounded-none bg-transparent overflow-x-auto">
        <div className="flex space-x-2 space-x-reverse w-full">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin">
              <LayoutDashboard className="h-4 w-4 ml-1" />
              نظرة عامة
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin/products">
              <Package className="h-4 w-4 ml-1" />
              المنتجات
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin/categories">
              <FolderTree className="h-4 w-4 ml-1" />
              الفئات
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="stock" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin/stock">
              <BarChart3 className="h-4 w-4 ml-1" />
              المخزون
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="sales" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin/sales">
              <ShoppingCart className="h-4 w-4 ml-1" />
              المبيعات
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin/content">
              <FileText className="h-4 w-4 ml-1" />
              المحتوى
            </Link>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
            asChild
          >
            <Link to="/admin/settings">
              <Settings className="h-4 w-4 ml-1" />
              الإعدادات
            </Link>
          </TabsTrigger>
        </div>
      </TabsList>
    </Tabs>
  );
};

export default AdminNavTabs;
