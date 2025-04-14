
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createProduct, updateProduct, deleteProduct } from '@/services/products/productService';
import { uploadMedia } from '@/services/media/mediaService';
import { Product } from '@/data/initialData';
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';

interface UseProductOperationsProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setFormDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useProductOperations = ({
  setProducts,
  setError,
  setIsProcessing,
  setFormDialogOpen,
  setDeleteDialogOpen,
  setSelectedProduct,
  setEditMode
}: UseProductOperationsProps) => {
  const { toast } = useToast();
  
  const handleFormSubmit = async (formData: any, editMode: boolean, selectedProduct: Product | null) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let imageUrl = formData.image;
      
      if (formData.imageFile) {
        console.log('Uploading image file:', formData.imageFile.name);
        try {
          const uploadResult = await uploadMedia(formData.imageFile);
          
          if (uploadResult) {
            console.log('Image uploaded successfully:', uploadResult);
            imageUrl = uploadResult;
          } else {
            throw new Error("فشل تحميل الصورة");
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error(`فشل تحميل الصورة: ${uploadError instanceof Error ? uploadError.message : 'خطأ غير معروف'}`);
        }
      }
      
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        price: formData.price,
        image: imageUrl,
        images: [imageUrl],
        category: '',
        stock: 0,
        featured: false,
        colors: [],
        specifications: {},
        mediaGallery: []
      };
      
      let result;
      
      if (editMode && selectedProduct) {
        console.log('Updating existing product:', selectedProduct.id);
        try {
          result = await updateProduct(selectedProduct.id, productData);
          
          if (result) {
            console.log('Product updated successfully:', result);
            toast({
              title: "تم التحديث بنجاح",
              description: "تم تحديث المنتج بنجاح"
            });
            
            setProducts(prevProducts => 
              prevProducts.map(p => p.id === selectedProduct.id ? { ...p, ...productData, id: selectedProduct.id } : p)
            );
            
            setFormDialogOpen(false);
            setSelectedProduct(null);
            setEditMode(false);
          }
        } catch (updateError) {
          if (isRlsPolicyError(updateError)) {
            setError(updateError.message);
          } else {
            setError(updateError instanceof Error ? updateError.message : "حدث خطأ أثناء تحديث المنتج");
          }
        }
      } else {
        console.log('Creating new product');
        try {
          result = await createProduct(productData);
          
          if (result) {
            console.log('Product created successfully:', result);
            toast({
              title: "تم الإنشاء بنجاح",
              description: "تم إنشاء المنتج بنجاح"
            });
            
            setProducts(prevProducts => [...prevProducts, result as Product]);
            setFormDialogOpen(false);
          }
        } catch (createError) {
          if (isRlsPolicyError(createError)) {
            setError(createError.message);
          } else {
            setError(createError instanceof Error ? createError.message : "حدث خطأ أثناء إنشاء المنتج");
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error?.message || "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDelete = async (selectedProduct: Product | null) => {
    if (!selectedProduct) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Deleting product:', selectedProduct.id);
      try {
        const success = await deleteProduct(selectedProduct.id);
        
        if (success) {
          console.log('Product deleted successfully');
          toast({
            title: "تم الحذف بنجاح",
            description: "تم حذف المنتج بنجاح"
          });
          
          setProducts(prevProducts => 
            prevProducts.filter(p => p.id !== selectedProduct.id)
          );
          
          setDeleteDialogOpen(false);
          setSelectedProduct(null);
        }
      } catch (deleteError) {
        if (isRlsPolicyError(deleteError)) {
          setError(deleteError.message);
        } else {
          setError(deleteError instanceof Error ? deleteError.message : "حدث خطأ أثناء حذف المنتج");
        }
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error?.message || "حدث خطأ أثناء حذف المنتج");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    handleFormSubmit,
    handleDelete
  };
};
