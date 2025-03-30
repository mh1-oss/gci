
import { useNavigate } from "react-router-dom";
import AdminAuthCheck from "@/components/Admin/AdminAuthCheck";
import AdminNavTabs from "@/components/Admin/AdminNavTabs";
import AdminTabContent from "@/components/Admin/AdminTabContent";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <AdminAuthCheck>
      <div className="py-6" dir="rtl">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">لوحة تحكم المدير</h1>
            <p className="text-gray-600">
              إدارة منتجات موقعك، والفئات، والمحتوى، والإعدادات.
            </p>
          </div>

          <AdminNavTabs />
          
          <AdminTabContent />
        </div>
      </div>
    </AdminAuthCheck>
  );
};

export default AdminDashboard;
