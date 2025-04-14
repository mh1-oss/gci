
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/data/initialData';
import ProductImageField from './ProductImageField';

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  image: string;
}

interface ProductFormFieldsProps {
  formData: ProductFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCategoryChange: (value: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  categories: Category[];
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  formData,
  handleFormChange,
  handleCategoryChange,
  handleImageChange,
  imagePreview,
  categories,
}) => {
  return (
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
      
      <ProductImageField 
        imagePreview={imagePreview}
        defaultImage={formData.image}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default ProductFormFields;
