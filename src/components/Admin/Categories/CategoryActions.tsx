
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface CategoryActionsProps {
  onAddNew: () => void;
  onRefresh: () => void;
}

const CategoryActions = ({ onAddNew, onRefresh }: CategoryActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onRefresh} variant="outline">
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Button onClick={onAddNew}>
        <Plus className="ml-2 h-4 w-4" />
        إضافة فئة جديدة
      </Button>
    </div>
  );
};

export default CategoryActions;
