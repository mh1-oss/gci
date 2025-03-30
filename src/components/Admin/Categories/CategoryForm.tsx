
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  editMode: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const CategoryForm = ({
  open,
  onOpenChange,
  name,
  setName,
  description,
  setDescription,
  editMode,
  isSaving,
  onSave,
  onCancel
}: CategoryFormProps) => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editMode ? 'تعديل فئة' : 'إضافة فئة جديدة'}</DialogTitle>
          <DialogDescription>
            {editMode ? 'تعديل تفاصيل الفئة.' : 'أدخل تفاصيل الفئة الجديدة.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                اسم الفئة
              </Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                الوصف
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCancel}>
              إلغاء
            </Button>
            <Button 
              type="submit"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? 'جاري التحديث...' : 'جاري الإنشاء...'}
                </>
              ) : (
                editMode ? 'تحديث الفئة' : 'إنشاء فئة'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
