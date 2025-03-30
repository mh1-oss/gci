import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Loader2, Trash, Edit, Plus } from 'lucide-react';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/services/supabaseService';
import { Category } from '@/data/initialData';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
    if (!name) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الفئة.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newCategory: Omit<Category, 'id'> = { name, description };
      const createdCategory = await createCategory(newCategory);

      if (createdCategory) {
        setCategories([...categories, createdCategory]);
        toast({
          title: "تم بنجاح",
          description: "تم إنشاء الفئة بنجاح."
        });
        setDialogOpen(false);
        setName('');
        setDescription('');
      } else {
        toast({
          title: "فشل الإنشاء",
          description: "حدث خطأ أثناء إنشاء الفئة.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء إنشاء الفئة.",
        variant: "destructive"
      });
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

    try {
      const updatedCategoryData: Partial<Category> = {
        name: name,
        description: description
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
        setEditMode(false);
        setEditTarget(null);
        setName('');
        setDescription('');
      } else {
        toast({
          title: "فشل التحديث",
          description: "حدث خطأ أثناء تحديث الفئة.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء تحديث الفئة.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (category: Category) => {
    setDeleteTarget(category);
    setDeleteDialogOpen(true);
  };

  // Fix the filter function in deleteCategory
const handleDeleteConfirm = async () => {
  setIsDeleting(true);
  try {
    const success = await deleteCategory(deleteTarget?.id || '');
    if (success) {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الفئة بنجاح."
      });
      setCategories(prevCategories => prevCategories.filter(c => c.id !== deleteTarget?.id));
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } else {
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء حذف الفئة.",
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    toast({
      title: "خطأ",
      description: "حدث خطأ غير متوقع أثناء حذف الفئة.",
      variant: "destructive"
    });
  } finally {
    setIsDeleting(false);
  }
};

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>إدارة الفئات</CardTitle>
            <CardDescription>إضافة وتعديل وحذف الفئات الموجودة في الموقع</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فئة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فئات. أضف فئة جديدة للبدء.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الفئة</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(category)}
                          className="text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? 'تعديل فئة' : 'إضافة فئة جديدة'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'تعديل تفاصيل الفئة.' : 'أدخل تفاصيل الفئة الجديدة.'}
            </DialogDescription>
          </DialogHeader>
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
            <Button type="button" variant="secondary" onClick={() => {
              setDialogOpen(false);
              setEditMode(false);
              setEditTarget(null);
              setName('');
              setDescription('');
            }}>
              إلغاء
            </Button>
            <Button onClick={editMode ? handleUpdate : handleCreate}>
              {editMode ? 'تحديث الفئة' : 'إنشاء فئة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDeleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى حذف الفئة نهائيًا ولا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
