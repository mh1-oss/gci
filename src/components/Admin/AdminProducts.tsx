import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Product, Category, MediaItem } from "@/data/initialData";
import { 
  getProducts, 
  getCategories, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  uploadMedia
} from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { Plus, Edit, Trash2, Search, Loader2, Upload, Image, Video, FileText, X } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
  featured: boolean;
  colors: string;
  mediaGallery: MediaItem[];
  specsPdf: string;
}

interface MediaUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept: string;
  id: string;
  icon: React.ReactNode;
  label: string;
}

const MediaUpload = ({ onUpload, accept, id, icon, label }: MediaUploadProps) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        await onUpload(file);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  
  return (
    <div className="relative">
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={loading}
        ref={fileInputRef}
      />
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors ${loading ? 'bg-gray-50' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-2" />
            <span className="text-sm text-gray-500">جاري التحميل...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            {icon}
            <span className="mt-2 text-sm font-medium">{label}</span>
            <span className="mt-1 text-xs text-gray-500">اضغط أو اسحب وأفلت</span>
          </div>
        )}
      </div>
    </div>
  );
};

const defaultProductForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  image: "/placeholder.svg",
  featured: false,
  colors: "",
  mediaGallery: [],
  specsPdf: "",
};

const ProductForm = ({ 
  product, 
  categories, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  product?: Product; 
  categories: Category[]; 
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<ProductFormData>(
    product ? {
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId,
      image: product.image,
      featured: product.featured,
      colors: product.colors ? product.colors.join(", ") : "",
      mediaGallery: product.mediaGallery || [],
      specsPdf: product.specsPdf || "",
    } : { ...defaultProductForm }
  );
  
  const { toast } = useToast();
  
  const handleChange = (field: keyof ProductFormData, value: string | boolean | MediaItem[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleMainImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadMedia(file);
      handleChange("image", imageUrl);
      toast({
        title: "تم تحميل الصورة الرئيسية",
        description: "تم تحميل الصورة الرئيسية بنجاح.",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "فشل تحميل الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  const handleGalleryImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadMedia(file);
      const newMedia: MediaItem = {
        url: imageUrl,
        type: 'image'
      };
      handleChange("mediaGallery", [...formData.mediaGallery, newMedia]);
      toast({
        title: "تم تحميل الصورة",
        description: "تم إضافة الصورة إلى معرض الوسائط.",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "فشل تحميل الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  const handleVideoUpload = async (file: File) => {
    try {
      const videoUrl = await uploadMedia(file);
      const newMedia: MediaItem = {
        url: videoUrl,
        type: 'video'
      };
      handleChange("mediaGallery", [...formData.mediaGallery, newMedia]);
      toast({
        title: "تم تحميل الفيديو",
        description: "تم إضافة الفيديو إلى معرض الوسائط.",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "فشل تحميل الفيديو. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  const handlePdfUpload = async (file: File) => {
    try {
      const pdfUrl = await uploadMedia(file);
      handleChange("specsPdf", pdfUrl);
      toast({
        title: "تم تحميل ملف PDF",
        description: "تم تعيين ملف المواصفات بنجاح.",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "فشل تحميل ملف PDF. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };
  
  const removeMediaItem = (index: number) => {
    const updatedGallery = [...formData.mediaGallery];
    updatedGallery.splice(index, 1);
    handleChange("mediaGallery", updatedGallery);
  };
  
  const removePdf = () => {
    handleChange("specsPdf", "");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          اسم المنتج
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="أدخل اسم المنتج"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          الوصف
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="أدخل وصف المنتج"
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            السعر (USD)
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            الفئة
          </label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => handleChange("categoryId", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="اختر فئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الصورة الرئيسية
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaUpload
            onUpload={handleMainImageUpload}
            accept="image/*"
            id="main-image-upload"
            icon={<Image className="h-10 w-10 text-gray-400" />}
            label="تحميل صورة رئيسية"
          />
          {formData.image && formData.image !== "/placeholder.svg" && (
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={formData.image} alt="Main" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
      
      {/* Media Gallery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          معرض الوسائط
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <MediaUpload
            onUpload={handleGalleryImageUpload}
            accept="image/*"
            id="gallery-image-upload"
            icon={<Image className="h-10 w-10 text-gray-400" />}
            label="تحميل صورة للمعرض"
          />
          <MediaUpload
            onUpload={handleVideoUpload}
            accept="video/*"
            id="video-upload"
            icon={<Video className="h-10 w-10 text-gray-400" />}
            label="تحميل فيديو"
          />
        </div>
        
        {formData.mediaGallery.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">الوسائط المحملة:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.mediaGallery.map((media, index) => (
                <div key={index} className="relative group">
                  {media.type === 'video' ? (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <Video className="h-8 w-8 text-gray-500" />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img src={media.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMediaItem(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* PDF Specs Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ملف مواصفات PDF
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaUpload
            onUpload={handlePdfUpload}
            accept=".pdf"
            id="pdf-upload"
            icon={<FileText className="h-10 w-10 text-gray-400" />}
            label="تحميل ملف PDF للمواصفات"
          />
          {formData.specsPdf && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-gray-500 mr-2" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {formData.specsPdf.split('/').pop() || 'specs.pdf'}
                </span>
              </div>
              <button
                type="button"
                onClick={removePdf}
                className="text-red-500 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">
          الألوان المتاحة (مفصولة بفواصل)
        </label>
        <Input
          id="colors"
          value={formData.colors}
          onChange={(e) => handleChange("colors", e.target.value)}
          placeholder="مثال: أحمر، أزرق، أخضر"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => handleChange("featured", !!checked)}
        />
        <label
          htmlFor="featured"
          className="mr-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          منتج مميز
        </label>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} className="ml-4">
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ المنتج'
          )}
        </Button>
      </div>
    </form>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching products data:", error);
        toast({
          title: "Error",
          description: "Could not load products data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  };
  
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      setFormLoading(true);
      const success = await deleteProduct(productToDelete.id);
      
      if (success) {
        setProducts(prevProducts => 
          prevProducts.filter(p => p.id !== productToDelete.id)
        );
        
        toast({
          title: "Product Deleted",
          description: `${productToDelete.name} has been removed.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Could not delete the product.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };
  
  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (!editingProduct) return;
    
    try {
      setFormLoading(true);
      
      const updatedProduct = await updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        image: formData.image,
        featured: formData.featured,
        colors: formData.colors ? formData.colors.join(", ") : "",
        mediaGallery: formData.mediaGallery,
        specsPdf: formData.specsPdf,
      });
      
      if (updatedProduct) {
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === editingProduct.id ? updatedProduct : p)
        );
        
        toast({
          title: "Product Updated",
          description: `${updatedProduct.name} has been updated.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Could not update the product.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
      setEditingProduct(null);
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };
  
  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="البحث عن المنتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Button onClick={() => navigate("/admin/products/add")}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>مميز</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.featured ? "نعم" : "لا"}</TableCell>
                  <TableCell className="text-left">
                    <div className="flex justify-start space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditClick(product)}
                        className="ml-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(product)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500">لم يتم العثور على منتجات</p>
        </div>
      )}
      
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
            <DialogDescription>
              قم بإجراء تغييرات على تفاصيل المنتج أدناه.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
              isLoading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف المنتج "{productToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={formLoading}
              className="ml-4"
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AddProductForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Could not load categories.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [toast]);
  
  const handleSubmit = async (formData: ProductFormData) => {
    try {
      setFormLoading(true);
      
      const newProduct = await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        image: formData.image,
        featured: formData.featured,
        colors: formData.colors ? formData.colors.join(", ") : "",
        mediaGallery: formData.mediaGallery,
        specsPdf: formData.specsPdf,
      });
      
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added successfully.`,
        variant: "default",
      });
      
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Could not add the product.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">إضافة منتج جديد</h2>
          <p className="text-gray-500">
            املأ التفاصيل أدناه لإنشاء منتج جديد.
          </p>
        </div>
        
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/products")}
          isLoading={formLoading}
        />
      </CardContent>
    </Card>
  );
};

const AdminProducts = () => {
  return (
    <Routes>
      <Route index element={<ProductList />} />
      <Route path="add" element={<AddProductForm />} />
    </Routes>
  );
};

export default AdminProducts;
