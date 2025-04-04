
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
        
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle instead of single to handle null case gracefully
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        if (!data) {
          console.log("Product not found");
          throw new Error("Product not found");
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
          categories: data.categories && typeof data.categories === 'object' ? 
            data.categories : null
        };
        
        return result;
      } catch (error: any) {
        console.error('Error fetching product:', error.message);
        toast({
          title: "خطأ في تحميل المنتج",
          description: "حدث خطأ أثناء محاولة تحميل بيانات المنتج",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 1, // Limit retries to avoid excessive API calls
    enabled: !!id
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
