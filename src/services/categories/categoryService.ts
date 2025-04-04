
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
    
    // Use the admin_create_category RPC function
    const { data, error } = await supabase
      .rpc('admin_create_category', {
        p_name: category.name,
        p_description: category.description || null
      });
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully, ID:', data);
    
    // Since the RPC function only returns the ID, we need to fetch the complete category
    if (data) {
      return await fetchCategoryById(data);
    }
    
    return null;
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // Use the admin_update_category RPC function
    const { data, error } = await supabase
      .rpc('admin_update_category', {
        p_id: id,
        p_name: updates.name || null,
        p_description: updates.description || null
      });
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    console.log('Category updated successfully:', data);
    
    // If the update was successful, fetch the updated category
    if (data) {
      return await fetchCategoryById(id);
    }
    
    return null;
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // Use the admin_delete_category RPC function
    const { data, error } = await supabase
      .rpc('admin_delete_category', {
        p_id: id
      });
    
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    
    console.log('Category deleted successfully:', data);
    return !!data;
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    throw error;
  }
};
