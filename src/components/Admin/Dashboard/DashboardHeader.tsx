
import React from "react";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
      <button
        onClick={onLogout}
        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <LogOut className="h-4 w-4 mr-2" />
        تسجيل الخروج
      </button>
    </div>
  );
};

export default DashboardHeader;
