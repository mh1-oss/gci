
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Sale, SaleItem } from "@/utils/models";
import { CartItem } from "@/context/CartContext";
import { mapCartItemsToSaleItems } from "@/utils/models/salesMappers";
import { getCurrency } from "@/context/CurrencyContext";

export const createSaleFromCart = async (
  customerName: string,
  customerPhone: string | null,
  customerEmail: string | null,
  cartItems: CartItem[]
): Promise<{ success: boolean; saleData?: Sale; error?: string }> => {
  try {
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Cart is empty" };
    }
    
    // Get current currency to record in the sale
    const currentCurrency = getCurrency();

    // Create sales record
    const saleId = uuidv4();
    const saleItems = mapCartItemsToSaleItems(cartItems, saleId);
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Create sale object
    const newSale: Sale = {
      id: saleId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      total_amount: totalAmount,
      status: "completed",
      created_at: new Date().toISOString(),
      currency: currentCurrency, // Add currency information
      items: saleItems,
    };
    
    // Insert into sales table
    const { error: salesError } = await supabase
      .from("sales")
      .insert({
        id: newSale.id,
        customer_name: newSale.customer_name,
        customer_phone: newSale.customer_phone,
        customer_email: newSale.customer_email,
        total_amount: newSale.total_amount,
        status: newSale.status,
        currency: newSale.currency, // Save currency information
      });
    
    if (salesError) {
      console.error("Error inserting sale:", salesError);
      return { success: false, error: salesError.message };
    }
    
    // Insert sale items
    const saleItemsInsert = saleItems.map(item => ({
      id: item.id,
      sale_id: item.sale_id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));
    
    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItemsInsert);
    
    if (itemsError) {
      console.error("Error inserting sale items:", itemsError);
      return { success: false, error: itemsError.message };
    }
    
    return { success: true, saleData: newSale };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

export const deleteSale = async (saleId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First delete the related sale items
    const { error: itemsError } = await supabase
      .from("sale_items")
      .delete()
      .eq("sale_id", saleId);
    
    if (itemsError) {
      console.error("Error deleting sale items:", itemsError);
      return { success: false, error: itemsError.message };
    }
    
    // Then delete the sale itself
    const { error: saleError } = await supabase
      .from("sales")
      .delete()
      .eq("id", saleId);
    
    if (saleError) {
      console.error("Error deleting sale:", saleError);
      return { success: false, error: saleError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error during sale deletion:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred during deletion" 
    };
  }
};
