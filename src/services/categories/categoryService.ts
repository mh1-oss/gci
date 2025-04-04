
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
    
    // Make sure we have valid parameters for the RPC call
    const name = category.name?.trim();
    const description = category.description?.trim() || null;
    
    // Log what we're actually sending to the RPC function
    console.log('Calling admin_create_category with:', { p_name: name, p_description: description });
    
    // Call the RPC function with proper parameters
    const { data: categoryId, error } = await supabase.rpc('admin_create_category', {
      p_name: name,
      p_description: description
    });
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully, returned ID:', categoryId);
    
    // If we have a valid ID, fetch the complete category
    if (categoryId) {
      return await fetchCategoryById(categoryId);
    }
    
    return null;
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // Extract and clean up the parameters
    const name = updates.name?.trim();
    const description = updates.description?.trim() || null;
    
    console.log('Updating category:', id, 'with data:', { name, description });
    
    // Call the RPC function with proper parameters
    const { data: success, error } = await supabase.rpc('admin_update_category', {
      p_id: id,
      p_name: name,
      p_description: description
    });
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    console.log('Category update result:', success);
    
    // If update was successful, fetch the updated category
    if (success) {
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
