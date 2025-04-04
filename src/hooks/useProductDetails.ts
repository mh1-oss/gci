
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct } from "@/utils/models/types";
import { useToast } from "@/hooks/use-toast";

export const useProductDetails = (id: string | undefined) => {
  const { toast } = useToast();
  
  // Fetch product details
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error("No product ID provided");

        console.log(`Fetching product with ID: ${id}`);
        
        // Fetch the product without using JOIN or aggregate functions
        // This is to avoid RLS issues with aggregate functions
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error("Supabase error fetching product details:", error);
          throw error;
        }
        
        if (!data) {
          console.log("Product data is null after fetch");
          throw new Error("Product not found");
        }

        console.log("Product data fetched successfully:", data);
        
        // If we need the category name, we'll fetch it separately
        let categoryName = null;
        if (data.category_id) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('name')
            .eq('id', data.category_id)
            .maybeSingle();
            
          if (categoryError) {
            console.error("Error fetching category:", categoryError);
          } else if (categoryData) {
            categoryName = categoryData.name;
          }
        }

        // Make sure we convert to the correct type
        const result: DbProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          price: data.price,
          cost_price: data.cost_price,
          stock_quantity: data.stock_quantity,
          category_id: data.category_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          categories: categoryName ? { name: categoryName } : null
        };
        
        return result;
      } catch (error: any) {
        console.error('Error fetching product:', error.message);
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry for "not found" errors, but retry once for other types
      if (error?.message === "Product not found") {
        console.log("Not retrying for 'Product not found' error");
        return false;
      }
      
      console.log(`Retry attempt ${failureCount} for error: ${error?.message}`);
      return failureCount < 1;
    },
    enabled: !!id && id.trim() !== ''
  });

  // Also fetch related products from the same category
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id || !id) return [];
      
      console.log(`Fetching related products for category ID: ${product.category_id}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', id)
        .limit(4);
      
      if (error) {
        console.error('Error fetching related products:', error);
        return []; // Return empty array on error instead of throwing
      }
      
      // Convert the data to the expected format
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        price: item.price,
        cost_price: item.cost_price,
        stock_quantity: item.stock_quantity,
        category_id: item.category_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) as DbProduct[];
    },
    enabled: !!product?.category_id && !!id,
    retry: 1
  });

  return {
    product,
    relatedProducts: relatedProducts || [],
    isLoading,
    error
  };
};
