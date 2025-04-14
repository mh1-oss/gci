
import React from 'react';
import { Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductImageFieldProps {
  imagePreview: string | null;
  defaultImage: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const ProductImageField: React.FC<ProductImageFieldProps> = ({
  imagePreview,
  defaultImage,
  onImageChange,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="image">صورة المنتج</Label>
      <div className="flex items-center gap-4">
        {imagePreview || defaultImage !== '/placeholder.svg' ? (
          <img 
            src={imagePreview || defaultImage} 
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
          onChange={onImageChange}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ProductImageField;
