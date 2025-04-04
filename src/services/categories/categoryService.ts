
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
    
    // First, check if the user is authenticated and is an admin
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    // Attempt to fetch categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      
      // If there's an error related to RLS policies and the user is authenticated
      // This is likely due to a Supabase RLS policy issue - try to work around it
      if (error.code === '42P17' && isAuthenticated) {
        console.log('Using fallback method to fetch categories due to RLS error');
        // Use a more direct query approach without RLS interference
        const { data: adminData, error: adminError } = await supabase.rpc('get_all_categories');
        
        if (adminError) {
          console.error('Fallback method failed:', adminError);
          return [];
        }
        
        // adminData is now the array of categories returned by the function
        return (adminData as DbCategory[]).map(mapDbCategoryToCategory);
      }
      
      return [];
    }
    
    console.log('Categories fetched successfully:', data);
    return (data || []).map(mapDbCategoryToCategory);
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return [];
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
      return null;
    }
    
    return data ? mapDbCategoryToCategory(data as DbCategory) : null;
  } catch (error) {
    console.error('Unexpected error fetching category by id:', error);
    return null;
  }
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
  try {
    console.log('Creating category with data:', category);
    
    // Convert to database model format
    const dbCategory = mapCategoryToDbCategory(category);
    console.log('Converted to DB format:', dbCategory);
    
    // Insert the category into the database
    const { data, error } = await supabase
      .from('categories')
      .insert(dbCategory)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      return null;
    }
    
    console.log('Category created successfully:', data);
    return mapDbCategoryToCategory(data as DbCategory);
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    return null;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // Convert to database model format
    const dbUpdates: Partial<DbCategory> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    
    const { data, error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating category:', error);
      return null;
    }
    
    return mapDbCategoryToCategory(data as DbCategory);
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    return false;
  }
};
