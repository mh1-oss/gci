
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';

interface AdminProductActionsProps {
  onAddNew: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const AdminProductActions: React.FC<AdminProductActionsProps> = ({ 
  onAddNew, 
  onRefresh,
  isLoading = false
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onRefresh} 
        variant="outline"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
        تحديث
      </Button>
      <Button onClick={onAddNew}>
        <Plus className="h-4 w-4 ml-2" />
        إضافة منتج جديد
      </Button>
    </div>
  );
};

export default AdminProductActions;
