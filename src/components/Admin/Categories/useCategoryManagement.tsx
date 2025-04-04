
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/categories/categoryService';
import { Category } from '@/data/initialData';
import { useAuth } from '@/context/AuthContext';

export const useCategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      loadCategories();
    } else {
      setError("يجب أن تكون مسؤولاً للوصول إلى إدارة الفئات.");
      setLoading(false);
    }
  }, [isAdmin]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching categories...");
      const fetchedCategories = await fetchCategories();
      console.log("Fetched categories:", fetchedCategories);
      setCategories(fetchedCategories || []);
      if (fetchedCategories.length === 0) {
        console.log("No categories found, but not treating as an error");
      }
    } catch (err: any) {
      console.error("Error loading categories:", err);
      setError(`حدث خطأ أثناء تحميل الفئات: ${err.message || err}`);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الفئات.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
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
      console.log("Creating new category:", { name, description });
      const newCategory: Omit<Category, 'id'> = { 
        name: name.trim(), 
        description: description.trim() || null, 
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
    setName(category.name);
    setDescription(category.description || '');
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!name) {
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
      console.log("Updating category:", editTarget.id, { name, description });
      const updatedCategoryData: Partial<Category> = {
        name: name.trim(),
        description: description.trim() || null
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
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      console.log("Deleting category:", deleteTarget.id);
      await deleteCategory(deleteTarget.id);
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفئة بنجاح."
      });
      setCategories(prevCategories => prevCategories.filter(c => c.id !== deleteTarget.id));
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
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

  const resetForm = () => {
    setEditMode(false);
    setEditTarget(null);
    setName('');
    setDescription('');
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleRefresh = () => {
    loadCategories();
  };

  return {
    categories,
    loading,
    dialogOpen,
    setDialogOpen,
    editMode,
    editTarget,
    deleteTarget,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isSaving,
    name,
    setName,
    description,
    setDescription,
    error,
    loadCategories,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDeleteConfirm,
    handleAddNew,
    handleCancel,
    handleRefresh
  };
};

export default useCategoryManagement;
