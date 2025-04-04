
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchCategories } from '@/services/categories/categoryService';
import { Category } from '@/data/initialData';
import { CategoryState } from './types';
import { useAuth } from '@/context/AuthContext';

export const useCategoryFetch = (): CategoryState & { loadCategories: () => Promise<void> } => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching categories...");
      const fetchedCategories = await fetchCategories();
      console.log("Fetched categories:", fetchedCategories);
      setCategories(fetchedCategories || []);
      if (fetchedCategories.length === 0) {
        console.log("No categories found, but not treating as an error");
      }
    } catch (err: any) {
      console.error("Error loading categories:", err);
      setError(`حدث خطأ أثناء تحميل الفئات: ${err.message || err}`);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الفئات.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadCategories();
    } else {
      setError("يجب أن تكون مسؤولاً للوصول إلى إدارة الفئات.");
      setLoading(false);
    }
  }, [isAdmin]);

  return { categories, setCategories, loading, error, setError, loadCategories };
};
