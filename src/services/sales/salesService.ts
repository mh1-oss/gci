
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  mapDbSaleToSale, 
  mapSaleToDbSale, 
  mapSaleItemToDbSaleItem,
  mapDbSaleItemWithProductToSaleItem,
  Sale,
  SaleItem,
  DbSale,
  DbSaleItem
} from '@/utils/models';

/**
 * Fetches all sales with their associated items from the database
 */
export const getSales = async (): Promise<Sale[]> => {
  try {
    console.log("Fetching sales data...");
    
    // Fetch all sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (salesError) {
      console.error('Error loading sales:', salesError);
      throw salesError;
    }
    
    // Fetch products for mapping names
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name');
    
    if (productsError) {
      console.error('Error loading products:', productsError);
      throw productsError;
    }
    
    const productMap = (products || []).reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Fetch all sale items for all sales
    const { data: allSaleItems, error: itemsError } = await supabase
      .from('sale_items')
      .select('*');
    
    if (itemsError) {
      console.error('Error loading sale items:', itemsError);
      throw itemsError;
    }
    
    // Group sale items by sale_id
    const saleItemsBySaleId = (allSaleItems || []).reduce((acc, item) => {
      if (!acc[item.sale_id]) {
        acc[item.sale_id] = [];
      }
      acc[item.sale_id].push({
        id: item.id,
        product_id: item.product_id,
        product_name: productMap[item.product_id] || 'منتج غير معروف',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      });
      return acc;
    }, {} as Record<string, SaleItem[]>);
    
    // Map sales with their items
    return (salesData || []).map((sale: DbSale) => 
      mapDbSaleToSale(sale, saleItemsBySaleId[sale.id] || [])
    );
  } catch (error) {
    console.error('Unexpected error fetching sales:', error);
    throw error;
  }
};

/**
 * Fetches a single sale by ID with its associated items
 */
export const getSaleById = async (saleId: string): Promise<Sale | null> => {
  try {
    // Fetch the sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single();
    
    if (saleError) {
      console.error('Error loading sale:', saleError);
      return null;
    }
    
    // Fetch products for mapping names
    const { data: products } = await supabase
      .from('products')
      .select('id, name');
    
    const productMap = (products || []).reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Fetch items for this sale
    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);
    
    if (itemsError) {
      console.error('Error loading sale items:', itemsError);
      return mapDbSaleToSale(saleData, []);
    }
    
    const saleItems = (itemsData || []).map((item: DbSaleItem) => 
      mapDbSaleItemWithProductToSaleItem(item, productMap[item.product_id] || 'منتج غير معروف')
    );
    
    return mapDbSaleToSale(saleData, saleItems);
  } catch (error) {
    console.error('Unexpected error fetching sale details:', error);
    return null;
  }
};

/**
 * Creates a new sale with associated items
 */
export const createSale = async (
  sale: Omit<Sale, 'id' | 'items' | 'created_at'>, 
  items: Array<Omit<SaleItem, 'id' | 'product_name'>>
): Promise<{ success: boolean; saleId?: string; error?: string }> => {
  try {
    const dbSale = mapSaleToDbSale(sale);
    
    // Insert the sale
    const { data: newSale, error: saleError } = await supabase
      .from('sales')
      .insert([dbSale])
      .select()
      .single();
    
    if (saleError) {
      console.error('Error creating sale:', saleError);
      return { success: false, error: saleError.message };
    }
    
    if (!newSale) {
      return { success: false, error: 'Failed to create sale - no sale data returned' };
    }
    
    // Insert the sale items
    const saleItems = items.map(item => 
      mapSaleItemToDbSaleItem(item, newSale.id)
    );
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
      return { success: false, error: itemsError.message };
    }
    
    return { success: true, saleId: newSale.id };
  } catch (error) {
    console.error('Unexpected error creating sale:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Deletes a sale and its associated items
 */
export const deleteSale = async (saleId: string): Promise<boolean> => {
  try {
    // Supabase will automatically delete the associated sale items 
    // if you've set up cascading deletes in your database
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId);
    
    if (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting sale:', error);
    throw error;
  }
};

// Export mappers directly so they can be used in components
export { 
  mapDbSaleToSale, 
  mapSaleToDbSale, 
  mapSaleItemToDbSaleItem,
  mapDbSaleItemWithProductToSaleItem
};

// Re-export types
export type { 
  Sale, 
  SaleItem, 
  DbSale, 
  DbSaleItem 
} from '@/utils/models';
