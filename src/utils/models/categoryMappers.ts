
import { DbCategory } from "../models/types";
import { Category } from "@/data/initialData";

export const mapDbCategoryToCategory = (dbCategory: DbCategory): Category => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || '',
    image: '/placeholder.svg' // Default image for categories
  };
};

export const mapCategoryToDbCategory = (category: Omit<Category, 'id'>): Omit<DbCategory, 'id' | 'created_at' | 'updated_at'> => {
  return {
    name: category.name,
    description: category.description || null
    // created_at and updated_at are handled by the database
    // id is auto-generated
  };
};
