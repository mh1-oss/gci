import { Link, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Settings, 
  FileText,
  BarChart3,
  ShoppingCart,
  Box,
  Tags,
  PackageOpen,
  Users,
  BarChart
} from "lucide-react";

const AdminNavTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the active tab from the URL
  const getActiveTab = (): string => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length === 1) return '/admin';
    if (path.length > 1 && path[0] === 'admin') {
      if (path[1].startsWith('content')) return '/admin/content';
      return `/admin/${path[1]}`;
    }
    return '/admin';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { label: "لوحة التحكم", path: "/admin", icon: <LayoutDashboard className="h-4 w-4 ml-2" /> },
    { label: "المنتجات", path: "/admin/products", icon: <Package className="h-4 w-4 ml-2" /> },
    { label: "الأقسام", path: "/admin/categories", icon: <FolderTree className="h-4 w-4 ml-2" /> },
    { label: "المخزون", path: "/admin/stock", icon: <BarChart3 className="h-4 w-4 ml-2" /> },
    { label: "المبيعات", path: "/admin/sales", icon: <ShoppingCart className="h-4 w-4 ml-2" /> },
    { label: "المحتوى", path: "/admin/content", icon: <FileText className="h-4 w-4 ml-2" /> },
    { label: "أدوار المستخدمين", path: "/admin/user-roles", icon: <Users className="h-4 w-4 ml-2" /> },
    { label: "الإعدادات", path: "/admin/settings", icon: <Settings className="h-4 w-4 ml-2" /> },
  ];

  return (
    <Tabs value={activeTab} className="space-y-6">
      <TabsList className="w-full border-b border-gray-200 pb-0 rounded-none bg-transparent overflow-x-auto">
        <div className="flex space-x-2 space-x-reverse w-full">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.path} 
              value={tab.path} 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-brand-blue rounded-none px-4 py-2"
              asChild
            >
              <Link to={tab.path}>
                {tab.icon}
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </div>
      </TabsList>
    </Tabs>
  );
};

export default AdminNavTabs;
