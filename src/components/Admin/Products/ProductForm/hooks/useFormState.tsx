
import { useState, useEffect } from 'react';
import { Product } from '@/data/initialData';

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  image: string;
}

export const useFormState = (initialData: Partial<Product> = {}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    categoryId: initialData.categoryId || '',
    price: initialData.price || 0,
    image: initialData.image || '/placeholder.svg'
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
      image: initialData.image || '/placeholder.svg'
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
