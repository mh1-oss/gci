import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DbProduct, Product } from "@/utils/models/types";
import { useToast } from "@/hooks/use-toast";
import { isRlsPolicyError, getRlsErrorMessage } from "@/services/rls/rlsErrorHandler";
import { fetchProductById } from "@/services/products/fetchProductById";
import { mapDbProductToProduct } from "@/utils/models/productMappers";

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

        console.log(`Fetching product with ID: ${id} in useProductDetails`);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error("Supabase error fetching product details:", error);
          
          if (isRlsPolicyError(error)) {
            console.warn("RLS policy error detected in useProductDetails");
            // Try fallback method
            const fallbackProduct = await fetchProductById(id);
            if (fallbackProduct) {
              // Convert to DbProduct format
              return {
                ...fallbackProduct,
                stock_quantity: fallbackProduct.stock, // Correct mapping
                image_url: fallbackProduct.image,
                category_id: fallbackProduct.categoryId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as DbProduct;
            }
          }
          
          throw error;
        }
        
        if (!data) {
          console.log("Product data is null after fetch");
          throw new Error("Product not found");
        }

        console.log("Product data fetched successfully:", data);
        
        return data;
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
      
      // If it's an RLS error, don't retry more than once
      if (isRlsPolicyError(error) && failureCount >= 1) {
        console.log("Not retrying further for RLS policy error");
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
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', product.category_id)
          .neq('id', id)
          .limit(4);
        
        if (error) {
          console.error('Error fetching related products:', error);
          
          // If it's an RLS error, we'll just return empty array instead of throwing
          if (isRlsPolicyError(error)) {
            console.warn('RLS policy error detected when fetching related products');
            return [];
          }
          
          throw error;
        }
        
        // Convert the data to the expected format - include the new fields with proper type conversion
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
          updated_at: item.updated_at,
          featured: item.featured || false,
          colors: Array.isArray(item.colors) ? item.colors as string[] : [],
          specifications: typeof item.specifications === 'object' ? 
            item.specifications as Record<string, string> : {},
          media_gallery: Array.isArray(item.media_gallery) ? 
            item.media_gallery as { url: string; type: 'image' | 'video' }[] : []
        })) as DbProduct[];
      } catch (err) {
        console.error('Error in related products query:', err);
        return [];
      }
    },
    enabled: !!product?.category_id && !!id,
    retry: 1
  });

  return {
    product: product ? mapDbProductToProduct(product) : null,
    relatedProducts: relatedProducts.map(mapDbProductToProduct),
    isLoading,
    error
  };
};
