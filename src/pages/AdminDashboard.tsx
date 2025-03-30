
import { useNavigate } from "react-router-dom";
import AdminAuthCheck from "@/components/Admin/AdminAuthCheck";
import AdminNavTabs from "@/components/Admin/AdminNavTabs";
import AdminTabContent from "@/components/Admin/AdminTabContent";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { LogOut, ShoppingCart, LayoutGrid, Tags, Settings, BarChart3, Package, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
    navigate("/");
  };

  return (
    <AdminAuthCheck>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <SidebarProvider defaultOpen={true}>
          <Sidebar className="border-l">
            <SidebarHeader className="flex flex-col items-center justify-center p-4">
              <h1 className="text-xl font-bold">لوحة تحكم المدير</h1>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin")}
                      isActive={location.pathname === "/admin"}
                      tooltip="الرئيسية"
                    >
                      <LayoutGrid className="ml-2" />
                      <span>نظرة عامة</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/products")}
                      isActive={location.pathname.includes("/admin/products")}
                      tooltip="المنتجات"
                    >
                      <ShoppingCart className="ml-2" />
                      <span>المنتجات</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/categories")}
                      isActive={location.pathname.includes("/admin/categories")}
                      tooltip="الفئات"
                    >
                      <Tags className="ml-2" />
                      <span>الفئات</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/content")}
                      isActive={location.pathname.includes("/admin/content")}
                      tooltip="المحتوى"
                    >
                      <FileText className="ml-2" />
                      <span>المحتوى</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/stock")}
                      isActive={location.pathname.includes("/admin/stock")}
                      tooltip="المخزون"
                    >
                      <Package className="ml-2" />
                      <span>المخزون</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/sales")}
                      isActive={location.pathname.includes("/admin/sales")}
                      tooltip="المبيعات"
                    >
                      <BarChart3 className="ml-2" />
                      <span>المبيعات</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/admin/settings")}
                      isActive={location.pathname.includes("/admin/settings")}
                      tooltip="الإعدادات"
                    >
                      <Settings className="ml-2" />
                      <span>الإعدادات</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter>
              <SidebarSeparator />
              <div className="p-4">
                <SidebarMenuButton
                  onClick={handleLogout}
                  variant="outline"
                >
                  <LogOut className="ml-2" />
                  <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex-1 p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">لوحة تحكم المدير</h1>
              <p className="text-gray-600">
                إدارة منتجات موقعك، والفئات، والمحتوى، والإعدادات.
              </p>
            </div>

            <AdminNavTabs />
            
            <AdminTabContent />
          </div>
        </SidebarProvider>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
