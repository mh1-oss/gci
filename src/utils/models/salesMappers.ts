
import { v4 as uuidv4 } from "uuid";
import { Sale, SaleItem } from '@/utils/models';
import { CartItem } from "@/context/CartContext";

export function mapCartItemsToSaleItems(cartItems: CartItem[], saleId: string): SaleItem[] {
  return cartItems.map(item => ({
    id: uuidv4(),
    sale_id: saleId,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity
  }));
}

export function mapDbSaleToSale(dbSale: any, saleItems: SaleItem[] = []): Sale {
  if (!dbSale) {
    console.error('Attempted to map null or undefined dbSale to Sale');
    throw new Error('Invalid sale data provided');
  }
  
  return {
    id: dbSale.id,
    customer_name: dbSale.customer_name,
    customer_phone: dbSale.customer_phone,
    customer_email: dbSale.customer_email,
    total_amount: typeof dbSale.total_amount === 'string' 
      ? parseFloat(dbSale.total_amount) 
      : dbSale.total_amount,
    created_at: dbSale.created_at,
    status: dbSale.status || "completed",
    currency: dbSale.currency,
    items: saleItems
  };
}

export function mapSaleToDbSale(sale: Omit<Sale, 'id' | 'items' | 'created_at'>): Omit<any, 'id' | 'created_at'> {
  if (!sale) {
    console.error('Attempted to map null or undefined Sale to DbSale');
    throw new Error('Invalid sale data provided');
  }
  
  return {
    customer_name: sale.customer_name,
    customer_phone: sale.customer_phone,
    customer_email: sale.customer_email,
    total_amount: sale.total_amount,
    status: sale.status,
    currency: sale.currency
  };
}

export function mapDbSaleItemWithProductToSaleItem(dbSaleItem: any, productName: string): SaleItem {
  if (!dbSaleItem) {
    console.error('Attempted to map null or undefined DbSaleItem to SaleItem');
    throw new Error('Invalid sale item data provided');
  }
  
  return {
    id: dbSaleItem.id,
    sale_id: dbSaleItem.sale_id,
    product_id: dbSaleItem.product_id,
    product_name: productName || 'منتج غير معروف',
    quantity: dbSaleItem.quantity,
    unit_price: typeof dbSaleItem.unit_price === 'string'
      ? parseFloat(dbSaleItem.unit_price)
      : dbSaleItem.unit_price,
    total_price: typeof dbSaleItem.total_price === 'string'
      ? parseFloat(dbSaleItem.total_price)
      : dbSaleItem.total_price
  };
}

export function mapSaleItemToDbSaleItem(saleItem: Omit<SaleItem, 'id' | 'product_name'>, saleId: string): Omit<any, 'id' | 'created_at'> {
  if (!saleItem || !saleId) {
    console.error('Attempted to map SaleItem to DbSaleItem with invalid data', { saleItem, saleId });
    throw new Error('Invalid sale item data or sale ID provided');
  }
  
  return {
    sale_id: saleId,
    product_id: saleItem.product_id,
    quantity: saleItem.quantity,
    unit_price: saleItem.unit_price,
    total_price: saleItem.total_price
  };
}
