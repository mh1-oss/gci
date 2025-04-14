
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProductFormFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  editMode: boolean;
}

const ProductFormFooter: React.FC<ProductFormFooterProps> = ({
  onCancel,
  onSubmit,
  isProcessing,
  editMode,
}) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isProcessing}
        type="button"
      >
        إلغاء
      </Button>
      <Button 
        onClick={onSubmit}
        disabled={isProcessing}
        type="button"
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
    </div>
  );
};

export default ProductFormFooter;
