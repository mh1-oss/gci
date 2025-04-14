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
              // Convert to DbProduct format with all required properties
              return {
                id: fallbackProduct.id,
                name: fallbackProduct.name,
                description: fallbackProduct.description || '',
                price: fallbackProduct.price,
                cost_price: fallbackProduct.price * 0.7, // Default cost price as 70% of price
                stock_quantity: fallbackProduct.stock_quantity || 0, // Updated from 'stock'
                image_url: fallbackProduct.image || '',
                category_id: fallbackProduct.categoryId || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                featured: fallbackProduct.featured || false,
                colors: fallbackProduct.colors || [],
                specifications: fallbackProduct.specifications || {},
                media_gallery: fallbackProduct.mediaGallery || [],
                categories: null
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
        
        return data as DbProduct[];
      } catch (err) {
        console.error('Error in related products query:', err);
        return [];
      }
    },
    enabled: !!product?.category_id && !!id,
    retry: 1
  });

  return {
    product: product ? mapDbProductToProduct(product as DbProduct) : null,
    relatedProducts: relatedProducts.map(prod => mapDbProductToProduct(prod)),
    isLoading,
    error
  };
};
