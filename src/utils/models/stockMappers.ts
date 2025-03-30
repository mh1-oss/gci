
import { DbStockTransaction, StockTransaction } from './types';

export function mapDbStockTransactionToStockTransaction(dbTransaction: DbStockTransaction, productName: string): StockTransaction {
  return {
    id: dbTransaction.id,
    product_id: dbTransaction.product_id,
    product_name: productName,
    quantity: dbTransaction.quantity,
    transaction_type: dbTransaction.transaction_type,
    notes: dbTransaction.notes,
    created_at: dbTransaction.created_at
  };
}

export function mapStockTransactionToDbStockTransaction(transaction: Omit<StockTransaction, 'id' | 'product_name' | 'created_at'>): Omit<DbStockTransaction, 'id' | 'created_at'> {
  return {
    product_id: transaction.product_id,
    quantity: transaction.quantity,
    transaction_type: transaction.transaction_type,
    notes: transaction.notes
  };
}
