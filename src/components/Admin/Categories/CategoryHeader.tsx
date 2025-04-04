
import React from 'react';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import CategoryActions from './CategoryActions';

interface CategoryHeaderProps {
  onAddNew: () => void;
  onRefresh: () => void;
}

const CategoryHeader = ({ onAddNew, onRefresh }: CategoryHeaderProps) => {
  return (
    <CardHeader className="flex flex-row justify-between items-center">
      <div>
        <CardTitle>إدارة الفئات</CardTitle>
        <CardDescription>إضافة وتعديل وحذف الفئات الموجودة في الموقع</CardDescription>
      </div>
      <CategoryActions onAddNew={onAddNew} onRefresh={onRefresh} />
    </CardHeader>
  );
};

export default CategoryHeader;
