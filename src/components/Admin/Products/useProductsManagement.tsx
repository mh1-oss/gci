
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/services/products/productService';
import { fetchCategories } from '@/services/categories/categoryService';
import { uploadMedia } from '@/services/media/mediaService';
import { Product, Category } from '@/data/initialData';
import { checkDatabaseConnectivity } from "@/services/products/utils/rlsErrorHandler";
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';

export const useProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);
  
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchAllData();
    }
  }, [connectionStatus]);
  
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      const connectionResult = await checkDatabaseConnectivity();
      
      if (!connectionResult.isConnected) {
        console.error('Supabase connection error:', connectionResult.error);
        setConnectionStatus('disconnected');
        setError(`خطأ في الاتصال بقاعدة البيانات: ${connectionResult.error}`);
      } else {
        console.log('Supabase connection successful');
        setConnectionStatus('connected');
        
        if (connectionResult.hasRlsIssue) {
          toast({
            title: "تحذير",
            description: "تم الاتصال بقاعدة البيانات ولكن هناك مشكلة في إعدادات الأمان",
            variant: "default",
          });
        }
        
        setError(null);
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
      setConnectionStatus('disconnected');
      setError('تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى في وقت لاحق.');
    }
  };
  
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
  
  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setSelectedProduct(null);
    setFormDialogOpen(true);
  };
  
  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditMode(true);
    setFormDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  const handleFormSubmit = async (formData: any) => {
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
  
  const handleDelete = async () => {
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
    products,
    categories,
    loading,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isProcessing,
    editMode,
    selectedProduct,
    error,
    connectionStatus,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleOpenDeleteDialog,
    handleFormSubmit,
    handleDelete,
    fetchAllData,
    checkConnection
  };
};
