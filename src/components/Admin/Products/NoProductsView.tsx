
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoProductsViewProps {
  onAddNew: () => void;
}

const NoProductsView: React.FC<NoProductsViewProps> = ({ onAddNew }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
      <Button onClick={onAddNew} variant="outline" className="mt-4">
        إضافة منتج جديد
      </Button>
    </div>
  );
};

export default NoProductsView;
