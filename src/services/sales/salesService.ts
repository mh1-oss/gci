
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
): Promise<{ success: boolean; saleId?: string; saleData?: Sale; error?: string }> => {
  try {
    console.log("Creating new sale with data:", { sale, items });
    
    // Insert the sale record directly
    const { data: insertedSale, error: saleError } = await supabase
      .from('sales')
      .insert({
        customer_name: sale.customer_name,
        customer_phone: sale.customer_phone,
        customer_email: sale.customer_email,
        total_amount: sale.total_amount
      })
      .select()
      .single();
    
    if (saleError) {
      console.error('Error inserting sale:', saleError);
      return { success: false, error: saleError.message };
    }
    
    if (!insertedSale) {
      console.error('No sale data returned after insert');
      return { success: false, error: 'Failed to create sale - no sale data returned' };
    }
    
    console.log("Sale created successfully:", insertedSale);
    
    // Prepare sale items with the new sale ID
    const saleItems = items.map(item => ({
      sale_id: insertedSale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));
    
    // Insert all sale items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) {
      console.error('Error inserting sale items:', itemsError);
      return { success: false, error: itemsError.message };
    }
    
    // Update product stock quantities
    for (const item of items) {
      const { error: stockError } = await supabase
        .from('stock_transactions')
        .insert({
          product_id: item.product_id,
          quantity: item.quantity,
          transaction_type: 'out',
          notes: `Sale: ${insertedSale.id}`
        });
      
      if (stockError) {
        console.error('Error updating stock for product:', item.product_id, stockError);
        // We don't want to fail the whole sale if stock transactions fail
        // just log the error and continue
      }
    }
    
    // Fetch products for mapping names
    const { data: products } = await supabase
      .from('products')
      .select('id, name');
    
    const productMap = (products || []).reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Map sale items with product names
    const saleItemsWithProductNames = items.map(item => ({
      id: '', // Actual IDs will come from the database later
      product_id: item.product_id,
      product_name: productMap[item.product_id] || 'منتج غير معروف',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));
    
    // Create the complete sale object to return
    const completeSale = mapDbSaleToSale(insertedSale, saleItemsWithProductNames);
    
    return { 
      success: true, 
      saleId: insertedSale.id,
      saleData: completeSale
    };
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

/**
 * Creates a new sale from cart items with customer details
 */
export const createSaleFromCart = async (
  customerName: string, 
  customerPhone: string | null, 
  customerEmail: string | null, 
  cartItems: any[]
): Promise<{ success: boolean; saleId?: string; saleData?: Sale; error?: string }> => {
  try {
    console.log("Creating sale from cart with items:", cartItems);
    
    // Calculate total amount from cart items
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Insert sale record directly
    const { data: insertedSale, error: saleError } = await supabase
      .from('sales')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        total_amount: totalAmount
      })
      .select()
      .single();
    
    if (saleError) {
      console.error('Error inserting sale from cart:', saleError);
      return { success: false, error: saleError.message };
    }
    
    if (!insertedSale) {
      console.error('No sale data returned after insert from cart');
      return { success: false, error: 'Failed to create sale from cart - no sale data returned' };
    }
    
    console.log("Sale created successfully from cart:", insertedSale);
    
    // Prepare sale items with the new sale ID
    const saleItems = cartItems.map(item => ({
      sale_id: insertedSale.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));
    
    // Insert all sale items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) {
      console.error('Error inserting sale items from cart:', itemsError);
      return { success: false, error: itemsError.message };
    }
    
    // Update product stock quantities
    for (const item of cartItems) {
      const { error: stockError } = await supabase
        .from('stock_transactions')
        .insert({
          product_id: item.id,
          quantity: item.quantity,
          transaction_type: 'out',
          notes: `Sale from cart: ${insertedSale.id}`
        });
      
      if (stockError) {
        console.error('Error updating stock for product from cart:', item.id, stockError);
        // We don't want to fail the whole sale if stock transactions fail
        // just log the error and continue
      }
    }
    
    // Return the created sale with items
    const itemsWithNames = cartItems.map(item => ({
      id: '', // Actual IDs will be assigned by the database
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));
    
    const completeSale = mapDbSaleToSale(insertedSale, itemsWithNames);
    
    return { 
      success: true, 
      saleId: insertedSale.id,
      saleData: completeSale
    };
  } catch (error) {
    console.error('Error creating sale from cart:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Generates HTML content for a printable receipt
 */
export const generateReceiptHtml = (
  sale: Sale, 
  dateFormatted: string
): string => {
  return `
    <html dir="rtl">
    <head>
      <title>إيصال مشتريات</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .info-block {
          width: 45%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f2f2f2;
        }
        .total {
          text-align: left;
          font-weight: bold;
          font-size: 16px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>إيصال مشتريات</h1>
        <p>تاريخ: ${dateFormatted}</p>
        <p>رقم الفاتورة: ${sale.id}</p>
      </div>
      
      <div class="info-section">
        <div class="info-block">
          <h3>معلومات العميل</h3>
          <p><strong>الاسم:</strong> ${sale.customer_name || 'عميل'}</p>
          ${sale.customer_phone ? `<p><strong>الهاتف:</strong> ${sale.customer_phone}</p>` : ''}
          ${sale.customer_email ? `<p><strong>البريد الإلكتروني:</strong> ${sale.customer_email}</p>` : ''}
        </div>
        <div class="info-block">
          <h3>ملخص المشتريات</h3>
          <p><strong>عدد المنتجات:</strong> ${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          <p><strong>إجمالي المبلغ:</strong> ${sale.total_amount.toLocaleString()} د.ع</p>
        </div>
      </div>
      
      <h3>المنتجات</h3>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.quantity}</td>
              <td>${item.unit_price.toLocaleString()} د.ع</td>
              <td>${item.total_price.toLocaleString()} د.ع</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        الإجمالي: ${sale.total_amount.toLocaleString()} د.ع
      </div>
      
      <div class="footer">
        <p>شكراً لتعاملكم معنا</p>
        <p>هذا الإيصال دليل على عملية الشراء</p>
      </div>
      
      <button onclick="window.print();" style="display: block; margin: 20px auto; padding: 10px 20px;">
        طباعة الإيصال
      </button>
    </body>
    </html>
  `;
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
