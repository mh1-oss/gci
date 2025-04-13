import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
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
import ProductErrorHandler from './ProductErrorHandler';
import AdminProductActions from './AdminProductActions';
import ProductFormDialog from './ProductFormDialog';
import SupabaseConnectionStatus from '../SupabaseConnectionStatus';
import { isRlsPolicyError, getRlsErrorMessage } from '@/services/rls/rlsErrorHandler';
import RlsErrorDisplay from '@/components/ErrorHandling/RlsErrorDisplay';

const AdminProductsApp = () => {
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
      setError(error?.message || "طأ في تحميل البيانات من قاعدة البيانات");
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
            setError(getRlsErrorMessage('update'));
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
            setError(getRlsErrorMessage('create'));
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
          setError(getRlsErrorMessage('delete'));
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
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
  };
  
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>إضافة وتعديل وحذف المنتجات الموجودة في الموقع</CardDescription>
          </div>
          <AdminProductActions
            onAddNew={handleOpenCreateDialog}
            onRefresh={fetchAllData}
            isLoading={loading}
          />
        </CardHeader>
        <CardContent>
          <SupabaseConnectionStatus />
          
          {connectionStatus === 'disconnected' && (
            <ProductErrorHandler
              error="لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
              onRetry={checkConnection}
            />
          )}
          
          {error && connectionStatus !== 'disconnected' && isRlsPolicyError(error) ? (
            <RlsErrorDisplay 
              error={error}
              onRetry={fetchAllData}
            />
          ) : error && connectionStatus !== 'disconnected' && (
            <ProductErrorHandler
              error={error}
              onRetry={fetchAllData}
            />
          )}
          
          {connectionStatus === 'checking' || loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : connectionStatus === 'connected' && products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
              <Button onClick={handleOpenCreateDialog} variant="outline" className="mt-4">
                إضافة منتج جديد
              </Button>
            </div>
          ) : connectionStatus === 'connected' && (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 object-contain rounded border"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        editMode={editMode}
        title={editMode ? 'تعديل منتج' : 'إضافة منتج جديد'}
        description={editMode 
          ? 'قم بتعديل بيانات المنتج في النموذج أدناه' 
          : 'أدخل بيانات المنتج الجديد في النموذج أدناه'
        }
        initialData={selectedProduct || {}}
        categories={categories}
        isProcessing={isProcessing}
        error={error}
      />
      
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!isProcessing) setDeleteDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف المنتج "{selectedProduct?.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          
          {error && isRlsPolicyError(error) ? (
            <RlsErrorDisplay 
              error={error}
              className="mt-2" 
            />
          ) : error && (
            <ProductErrorHandler 
              error={error} 
              className="mt-2"
            />
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جارِ الحذف...
                </>
              ) : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductsApp;
