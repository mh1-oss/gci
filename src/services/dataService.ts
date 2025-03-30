import { INITIAL_DATA, Category, Product, Review, Banner } from "@/data/initialData";
import { supabase } from "@/integrations/supabase/client";

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error("Error fetching categories from Supabase:", error);
      return INITIAL_DATA.categories;
    }

    if (data && data.length > 0) {
      return data;
    } else {
      return INITIAL_DATA.categories;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return INITIAL_DATA.categories;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error("Error fetching products from Supabase:", error);
      return INITIAL_DATA.products;
    }

    if (data && data.length > 0) {
      return data;
    } else {
      return INITIAL_DATA.products;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return INITIAL_DATA.products;
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product with id ${id} from Supabase:`, error);
      return INITIAL_DATA.products.find(product => product.id === id);
    }

    return data || INITIAL_DATA.products.find(product => product.id === id);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return INITIAL_DATA.products.find(product => product.id === id);
  }
};

export const getReviews = async (): Promise<Review[]> => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*');

        if (error) {
            console.error("Error fetching reviews from Supabase:", error);
            return INITIAL_DATA.reviews;
        }

        if (data && data.length > 0) {
            return data;
        } else {
            return INITIAL_DATA.reviews;
        }
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return INITIAL_DATA.reviews;
    }
};

export const getBanners = async (): Promise<Banner[]> => {
  try {
    // First try to fetch from Supabase
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data;
    }
    
    // If no data in Supabase, use initial data
    return INITIAL_DATA.banners;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return INITIAL_DATA.banners;
  }
};
