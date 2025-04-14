
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/data/initialData';

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  image: string;
}

export const useProductForm = (initialData: Partial<Product> = {}, onSubmit: (formData: any) => Promise<void>) => {
  const { toast } = useToast();
  
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
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "الرجاء إدخال اسم المنتج",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.price <= 0) {
      toast({
        title: "قيمة غير صالحة",
        description: "الرجاء إدخال سعر صالح للمنتج",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Create form data object with image file
    const submitData = {
      ...formData,
      imageFile
    };
    
    await onSubmit(submitData);
  };

  return {
    formData,
    imageFile,
    imagePreview,
    handleFormChange,
    handleCategoryChange,
    handleImageChange,
    handleSubmit
  };
};
