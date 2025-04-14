
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts } from '@/services/products/productService';
import { fetchCategories } from '@/services/categories/categoryService';
import { Product, Category } from '@/data/initialData';

export const useProductData = (connectionStatus: 'checking' | 'connected' | 'disconnected') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching products and categories...');
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      
      console.log('Products fetched:', productsData);
      console.log('Categories fetched:', categoriesData);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error?.message || "خطأ في تحميل البيانات من قاعدة البيانات");
      toast({
        title: "خطأ في تحميل البيانات",
        description: error?.message || "حدث خطأ أثناء تحميل المنتجات والفئات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchAllData();
    }
  }, [connectionStatus]);
  
  return {
    products,
    categories,
    loading,
    error,
    setProducts,
    setError,
    fetchAllData
  };
};
