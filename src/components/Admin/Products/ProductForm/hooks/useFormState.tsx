
import { useState, useEffect } from 'react';
import { Product } from '@/utils/models/types'; // Updated import

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  image: string;
  stock_quantity?: number; // Added stock_quantity field
}

export const useFormState = (initialData: Partial<Product> = {}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    categoryId: initialData.categoryId || '',
    price: initialData.price || 0,
    image: initialData.image || '/placeholder.svg',
    stock_quantity: initialData.stock_quantity || 0 // Added stock_quantity field
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    (initialData.image && initialData.image !== '/placeholder.svg') ? initialData.image : null
  );

  // Update form when initialData changes
  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      categoryId: initialData.categoryId || '',
      price: initialData.price || 0,
      image: initialData.image || '/placeholder.svg',
      stock_quantity: initialData.stock_quantity || 0 // Added stock_quantity field
    });
    
    setImagePreview(
      (initialData.image && initialData.image !== '/placeholder.svg') ? initialData.image : null
    );
    
    setImageFile(null);
  }, [initialData]);

  return {
    formData,
    setFormData,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview
  };
};
