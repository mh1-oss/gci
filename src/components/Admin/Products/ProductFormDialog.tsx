
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import ProductErrorHandler from './ProductErrorHandler';
import { Product, Category } from '@/data/initialData';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: any) => Promise<void>;
  editMode: boolean;
  title: string;
  description?: string;
  initialData?: Partial<Product>;
  categories: Category[];
  isProcessing: boolean;
  error: string | null;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editMode,
  title,
  description,
  initialData = {},
  categories,
  isProcessing,
  error
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
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

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!isProcessing) onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        {error && (
          <ProductErrorHandler 
            error={error}
            className="mt-2" 
          />
        )}
        
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
            onClick={() => onOpenChange(false)}
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
  );
};

export default ProductFormDialog;
