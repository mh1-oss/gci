
import { DbSale, DbSaleItem, Sale, SaleItem } from './types';

export function mapDbSaleToSale(dbSale: DbSale, saleItems: SaleItem[] = []): Sale {
  return {
    id: dbSale.id,
    customer_name: dbSale.customer_name,
    customer_phone: dbSale.customer_phone,
    customer_email: dbSale.customer_email,
    total_amount: dbSale.total_amount,
    created_at: dbSale.created_at,
    items: saleItems
  };
}

export function mapSaleToDbSale(sale: Omit<Sale, 'id' | 'items' | 'created_at'>): Omit<DbSale, 'id' | 'created_at'> {
  return {
    customer_name: sale.customer_name,
    customer_phone: sale.customer_phone,
    customer_email: sale.customer_email,
    total_amount: sale.total_amount
  };
}

export function mapDbSaleItemWithProductToSaleItem(dbSaleItem: DbSaleItem, productName: string): SaleItem {
  return {
    id: dbSaleItem.id,
    product_id: dbSaleItem.product_id,
    product_name: productName,
    quantity: dbSaleItem.quantity,
    unit_price: dbSaleItem.unit_price,
    total_price: dbSaleItem.total_price
  };
}

export function mapSaleItemToDbSaleItem(saleItem: Omit<SaleItem, 'id' | 'product_name'>, saleId: string): Omit<DbSaleItem, 'id' | 'created_at'> {
  return {
    sale_id: saleId,
    product_id: saleItem.product_id,
    quantity: saleItem.quantity,
    unit_price: saleItem.unit_price,
    total_price: saleItem.total_price
  };
}
