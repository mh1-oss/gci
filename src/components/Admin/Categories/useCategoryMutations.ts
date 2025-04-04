
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/categories/categoryService';
import { Category } from '@/data/initialData';
import { CategoryDialogState, CategoryFormState, CategoryTargetState } from './types';

interface UseCategoryMutationsProps {
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  resetForm: () => void;
}

export const useCategoryMutations = ({ 
  setCategories, 
  setError, 
  resetForm 
}: UseCategoryMutationsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const handleCreate = async (formData: CategoryFormState) => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الفئة.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // Prepare the category data
      const cleanName = formData.name.trim();
      const cleanDescription = formData.description.trim() || null;
      
      console.log("Creating new category:", { name: cleanName, description: cleanDescription });
      
      const newCategory: Omit<Category, 'id'> = { 
        name: cleanName, 
        description: cleanDescription, 
        image: '/placeholder.svg' 
      };
      
      const createdCategory = await createCategory(newCategory);

      if (createdCategory) {
        console.log("Category created successfully:", createdCategory);
        setCategories(prevCategories => [...prevCategories, createdCategory]);
        toast({
          title: "تم بنجاح",
          description: "تم إنشاء الفئة بنجاح."
        });
        setDialogOpen(false);
        resetForm();
        
        // Clear any existing errors
        setError(null);
      } else {
        throw new Error("فشل إنشاء الفئة. لم يتم إرجاع أي بيانات.");
      }
    } catch (err: any) {
      console.error("Error creating category:", err);
      setError(err.message || "حدث خطأ غير متوقع أثناء إنشاء الفئة.");
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ غير متوقع أثناء إنشاء الفئة.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditMode(true);
    setEditTarget(category);
    setError(null);
  };

  const handleUpdate = async (formData: CategoryFormState) => {
    if (!formData.name) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الفئة.",
        variant: "destructive"
      });
      return;
    }

    if (!editTarget) return;

    setIsSaving(true);
    setError(null);
    try {
      // Prepare the update data
      const cleanName = formData.name.trim();
      const cleanDescription = formData.description.trim() || null;
      
      console.log("Updating category:", editTarget.id, { name: cleanName, description: cleanDescription });
      
      const updatedCategoryData: Partial<Category> = {
        name: cleanName,
        description: cleanDescription
      };
      
      const updatedCategory = await updateCategory(editTarget.id, updatedCategoryData);

      if (updatedCategory) {
        setCategories(prevCategories =>
          prevCategories.map(c => (c.id === editTarget.id ? updatedCategory : c))
        );
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث الفئة بنجاح."
        });
        setDialogOpen(false);
        resetForm();
        
        // Clear any existing errors
        setError(null);
      } else {
        throw new Error("فشل تحديث الفئة. لم يتم إرجاع أي بيانات.");
      }
    } catch (err: any) {
      console.error("Error updating category:", err);
      setError(err.message || "حدث خطأ غير متوقع أثناء تحديث الفئة.");
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ غير متوقع أثناء تحديث الفئة.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (category: Category) => {
    setDeleteTarget(category);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      console.log("Deleting category:", deleteTarget.id);
      const success = await deleteCategory(deleteTarget.id);
      
      if (success) {
        setCategories(prevCategories => 
          prevCategories.filter(c => c.id !== deleteTarget.id)
        );
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف الفئة بنجاح."
        });
      } else {
        throw new Error("فشل حذف الفئة.");
      }
      
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      
      // Clear any existing errors
      setError(null);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setError(err.message || "حدث خطأ غير متوقع أثناء حذف الفئة.");
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ غير متوقع أثناء حذف الفئة.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    // Dialog states
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isSaving,
    
    // Target states
    editMode,
    editTarget,
    deleteTarget,
    
    // Handlers
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDeleteConfirm,
  };
};
