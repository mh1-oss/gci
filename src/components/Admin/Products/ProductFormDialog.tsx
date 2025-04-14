
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Product, Category } from '@/data/initialData';
import ProductErrorHandler from './ProductErrorHandler';
import { 
  ProductFormFields, 
  ProductFormFooter,
  useProductForm
} from './ProductForm';

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
  const {
    formData,
    imagePreview,
    handleFormChange,
    handleCategoryChange,
    handleImageChange,
    handleSubmit
  } = useProductForm(initialData, onSubmit);
  
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
        
        <ProductFormFields
          formData={formData}
          handleFormChange={handleFormChange}
          handleCategoryChange={handleCategoryChange}
          handleImageChange={handleImageChange}
          imagePreview={imagePreview}
          categories={categories}
        />
        
        <DialogFooter>
          <ProductFormFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            editMode={editMode}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
