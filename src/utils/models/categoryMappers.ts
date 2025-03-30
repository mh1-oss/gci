
import type { Category } from '@/data/initialData';
import { DbCategory } from './types';

export function mapDbCategoryToCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || '',
    image: '/placeholder.svg'
  };
}

export function mapCategoryToDbCategory(category: Omit<Category, 'id'>): Omit<DbCategory, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: category.name,
    description: category.description
  };
}
