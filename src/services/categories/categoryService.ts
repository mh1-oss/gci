
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
    
    // Directly insert into the table with auth headers still attached
    // This will use the user's admin role to bypass RLS
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: dbCategory.name,
        description: dbCategory.description
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully:', data);
    return data ? mapDbCategoryToCategory(data as DbCategory) : null;
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // Direct update approach instead of RPC
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        description: updates.description || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    console.log('Category updated successfully:', data);
    return data ? mapDbCategoryToCategory(data as DbCategory) : null;
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // Direct delete approach
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    
    console.log('Category deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    throw error;
  }
};
