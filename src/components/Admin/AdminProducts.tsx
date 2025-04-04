
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, RefreshCw, Image, Loader2 } from 'lucide-react';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/services/products/productService';
import { fetchCategories } from '@/services/categories/categoryService';
import { uploadMedia } from '@/services/media/mediaService';
import { Product, Category } from '@/data/initialData';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: 0,
    image: '/placeholder.svg'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    fetchAllData();
  }, []);
  
  const fetchAllData = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل المنتجات والفئات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      price: 0,
      image: '/placeholder.svg'
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedProduct(null);
    setEditMode(false);
  };
  
  const handleOpenCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };
  
  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      image: product.image
    });
    setImagePreview(product.image !== '/placeholder.svg' ? product.image : null);
    setEditMode(true);
    setDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
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
    
    setIsProcessing(true);
    
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        console.log('Uploading image file:', imageFile.name);
        const uploadResult = await uploadMedia(imageFile);
        
        if (uploadResult) {
          console.log('Image uploaded successfully:', uploadResult);
          imageUrl = uploadResult;
        } else {
          throw new Error("فشل تحميل الصورة");
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
      
      console.log('Saving product with data:', productData);
      
      let result;
      
      if (editMode && selectedProduct) {
        console.log('Updating existing product:', selectedProduct.id);
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
        } else {
          throw new Error("فشلت عملية تحديث المنتج");
        }
      } else {
        console.log('Creating new product');
        result = await createProduct(productData);
        
        if (result) {
          console.log('Product created successfully:', result);
          toast({
            title: "تم الإنشاء بنجاح",
            description: "تم إنشاء المنتج بنجاح"
          });
          
          setProducts(prevProducts => [...prevProducts, result as Product]);
        } else {
          throw new Error("فشلت عملية إنشاء المنتج");
        }
      }
      
      if (result) {
        setDialogOpen(false);
        resetForm();
        fetchAllData(); // Refresh data after successful operation
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "خطأ",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : "حدث خطأ أثناء حفظ المنتج",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Deleting product:', selectedProduct.id);
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
      } else {
        throw new Error("فشلت عملية حذف المنتج");
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : "حدث خطأ أثناء حذف المنتج",
        variant: "destructive"
      });
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
          <div className="flex gap-2">
            <Button onClick={fetchAllData} variant="outline">
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
              <Button onClick={handleOpenCreateDialog} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج جديد
              </Button>
            </div>
          ) : (
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
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!isProcessing) setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editMode ? 'تعديل منتج' : 'إضافة منتج جديد'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'قم بتعديل بيانات المنتج في النموذج أدناه' 
                : 'أدخل بيانات المنتج الجديد في النموذج أدناه'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="أدخل اسم المنتج"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">الفئة</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">السعر</Label>
              <Input 
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleFormChange}
                placeholder="أدخل سعر المنتج"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea 
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="أدخل وصف المنتج"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">صورة المنتج</Label>
              <div className="flex items-center gap-4">
                {imagePreview || formData.image !== '/placeholder.svg' ? (
                  <img 
                    src={imagePreview || formData.image} 
                    alt="Product preview" 
                    className="w-20 h-20 object-contain border rounded"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 border rounded">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Input 
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={isProcessing}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جارِ الحفظ...
                </>
              ) : (
                editMode ? 'تحديث' : 'إضافة'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

export default AdminProducts;
