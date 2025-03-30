
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  mapDbStockTransactionToStockTransaction, 
  mapStockTransactionToDbStockTransaction,
  StockTransaction,
  DbStockTransaction
} from '@/utils/modelMappers';

export const getStockTransactions = async (): Promise<StockTransaction[]> => {
  try {
    // Fetch all stock transactions
    const { data: transactionData, error: transactionError } = await supabase
      .from('stock_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (transactionError) {
      console.error('Error loading transactions:', transactionError);
      throw transactionError;
    }
    
    // Fetch products for product names
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id, name');
    
    if (productError) {
      console.error('Error loading products:', productError);
      throw productError;
    }
    
    const productMap = (productData || []).reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Map transactions with product names
    return (transactionData || []).map((transaction: DbStockTransaction) => 
      mapDbStockTransactionToStockTransaction(
        transaction, 
        productMap[transaction.product_id] || 'منتج غير معروف'
      )
    );
  } catch (error) {
    console.error('Unexpected error loading transactions:', error);
    throw error;
  }
};

export const addStockTransaction = async (transaction: Omit<StockTransaction, 'id' | 'created_at' | 'product_name'>): Promise<boolean> => {
  try {
    const dbTransaction = mapStockTransactionToDbStockTransaction(transaction);
    
    const { error } = await supabase
      .from('stock_transactions')
      .insert([dbTransaction]);
    
    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error adding transaction:', error);
    throw error;
  }
};

export const calculateProductStock = (transactions: StockTransaction[]): Record<string, { product_id: string, product_name: string, stock: number }> => {
  return transactions.reduce((acc, transaction) => {
    if (!acc[transaction.product_id]) {
      acc[transaction.product_id] = {
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        stock: 0
      };
    }
    
    if (transaction.transaction_type === 'in') {
      acc[transaction.product_id].stock += transaction.quantity;
    } else {
      acc[transaction.product_id].stock -= transaction.quantity;
    }
    
    return acc;
  }, {} as Record<string, { product_id: string, product_name: string, stock: number }>);
};
