
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct } from "@/utils/models/types";

export const useProductDetails = (id: string | undefined) => {
  // Fetch product details
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single();
        
        if (error) throw error;

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
          categories: data.categories && typeof data.categories === 'object' ? 
            data.categories : null
        };
        
        return result;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    }
  });

  // Also fetch related products from the same category
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', id)
        .limit(4);
      
      if (error) throw error;
      
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
    enabled: !!product?.category_id
  });

  return {
    product,
    relatedProducts: relatedProducts || [],
    isLoading,
    error
  };
};
