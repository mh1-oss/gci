
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Product } from '@/data/initialData';
import ProductErrorHandler from './ProductErrorHandler';
import RlsErrorDisplay from '@/components/ErrorHandling/RlsErrorDisplay';
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  selectedProduct: Product | null;
  isProcessing: boolean;
  error: string | null;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  open,
  onOpenChange,
  onDelete,
  selectedProduct,
  isProcessing,
  error
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!isProcessing) onOpenChange(open);
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
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            إلغاء
          </Button>
          <Button 
            variant="destructive"
            onClick={onDelete}
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
  );
};

export default DeleteProductDialog;
