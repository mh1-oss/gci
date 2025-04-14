
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Newspaper } from "lucide-react";

const QuickActionsPanel = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl font-bold mb-4">الإجراءات السريعة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="flex items-center justify-center p-4 h-auto"
          onClick={() => navigate('/admin/products')}
        >
          <Package className="h-5 w-5 ml-2" />
          <span>إضافة منتج جديد</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center p-4 h-auto"
          onClick={() => navigate('/admin/categories')}
        >
          <Package className="h-5 w-5 ml-2" />
          <span>إضافة فئة جديدة</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center p-4 h-auto"
          onClick={() => navigate('/admin/content')}
        >
          <Newspaper className="h-5 w-5 ml-2" />
          <span>تعديل محتوى الموقع</span>
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
