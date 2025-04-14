
import { Product } from '@/data/initialData';
import { useFormState, useFormHandlers, useFormValidation } from './hooks';

export const useProductForm = (initialData: Partial<Product> = {}, onSubmit: (formData: any) => Promise<void>) => {
  const {
    formData,
    setFormData,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview
  } = useFormState(initialData);
  
  const {
    handleFormChange,
    handleCategoryChange,
    handleImageChange
  } = useFormHandlers({ setFormData, setImageFile, setImagePreview });
  
  const { validateForm } = useFormValidation();
  
  const handleSubmit = async () => {
    if (!validateForm(formData)) return;
    
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
