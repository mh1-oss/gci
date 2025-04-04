
import React from 'react';
import { CardContent } from '@/components/ui/card';
import CategoryTable from './CategoryTable';
import { Category } from '@/data/initialData';

interface CategoryContentProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryContent = ({ categories, loading, onEdit, onDelete }: CategoryContentProps) => {
  return (
    <CardContent>
      <CategoryTable 
        categories={categories} 
        loading={loading} 
        onEdit={onEdit} 
        onDelete={onDelete} 
      />
    </CardContent>
  );
};

export default CategoryContent;
