
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
    
    // Create an RPC endpoint in Supabase to create categories that bypasses RLS
    // This uses the existing RPC call to bypass RLS completely
    const { data, error } = await supabase.rpc('admin_create_category', {
      p_name: dbCategory.name,
      p_description: dbCategory.description || null
    });
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully:', data);
    // Get the newly created category
    const newCategory = await fetchCategoryById(data);
    return newCategory;
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // Use an RPC function to bypass RLS
    const { data, error } = await supabase.rpc('admin_update_category', {
      p_id: id,
      p_name: updates.name,
      p_description: updates.description || null
    });
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    // Get the updated category
    return fetchCategoryById(id);
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // Use an RPC function to bypass RLS
    const { error } = await supabase.rpc('admin_delete_category', {
      p_id: id
    });
    
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    throw error;
  }
};
