
import { supabase } from "@/integrations/supabase/client";
import type { Category } from '@/data/initialData';
import {
  mapDbCategoryToCategory,
  mapCategoryToDbCategory
} from '@/utils/models';
import { DbCategory } from '@/utils/models/types';

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories...');
    
    // Use the get_all_categories RPC function which is SECURITY DEFINER
    // and bypasses RLS policies completely
    const { data, error } = await supabase.rpc('get_all_categories');
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    console.log('Categories fetched successfully:', data);
    return (data || []).map(mapDbCategoryToCategory);
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching category by id:', error);
      throw error;
    }
    
    return data ? mapDbCategoryToCategory(data as DbCategory) : null;
  } catch (error) {
    console.error('Unexpected error fetching category by id:', error);
    throw error;
  }
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
  try {
    console.log('Creating category with data:', category);
    
    // Convert to database model format
    const dbCategory = mapCategoryToDbCategory(category);
    console.log('Converted to DB format:', dbCategory);
    
    // Use type assertion to bypass TypeScript's type checking for custom RPC functions
    const { data, error } = await supabase.rpc(
      'admin_create_category' as any, 
      {
        p_name: dbCategory.name,
        p_description: dbCategory.description || null
      }
    );
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully, new ID:', data);
    // The returned data should be the UUID of the new category
    return await fetchCategoryById(data as string);
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // Use type assertion to bypass TypeScript's type checking for custom RPC functions
    const { data, error } = await supabase.rpc(
      'admin_update_category' as any,
      {
        p_id: id,
        p_name: updates.name,
        p_description: updates.description || null
      }
    );
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('Category update did not affect any rows');
      return null;
    }
    
    // Get the updated category
    return await fetchCategoryById(id);
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // Use type assertion to bypass TypeScript's type checking for custom RPC functions
    const { data, error } = await supabase.rpc(
      'admin_delete_category' as any,
      {
        p_id: id
      }
    );
    
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    throw error;
  }
};
