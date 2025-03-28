
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Category } from "@/data/initialData";
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  getProductsByCategory
} from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Search, Loader2, Eye } from "lucide-react";

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
}

const defaultCategoryForm: CategoryFormData = {
  name: "",
  description: "",
  image: "/placeholder.svg",
};

const CategoryForm = ({ 
  category, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  category?: Category; 
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<CategoryFormData>(
    category ? {
      name: category.name,
      description: category.description,
      image: category.image,
    } : { ...defaultCategoryForm }
  );
  
  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Category Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter category name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter category description"
          rows={4}
          required
        />
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => handleChange("image", e.target.value)}
          placeholder="Enter image URL"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Category'
          )}
        </Button>
      </div>
    </form>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Get product counts for each category
        const counts: Record<string, number> = {};
        for (const category of categoriesData) {
          const products = await getProductsByCategory(category.id);
          counts[category.id] = products.length;
        }
        setProductCounts(counts);
      } catch (error) {
        console.error("Error fetching categories data:", error);
        toast({
          title: "Error",
          description: "Could not load categories data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
  };
  
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    // Check if category has products
    if (productCounts[categoryToDelete.id] > 0) {
      toast({
        title: "Cannot Delete Category",
        description: `This category has ${productCounts[categoryToDelete.id]} products associated with it. Please reassign or delete these products first.`,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }
    
    try {
      setFormLoading(true);
      const success = await deleteCategory(categoryToDelete.id);
      
      if (success) {
        setCategories(prevCategories => 
          prevCategories.filter(c => c.id !== categoryToDelete.id)
        );
        
        toast({
          title: "Category Deleted",
          description: `${categoryToDelete.name} has been removed.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Could not delete the category.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };
  
  const handleUpdateCategory = async (formData: CategoryFormData) => {
    if (!editingCategory) return;
    
    try {
      setFormLoading(true);
      
      const updatedCategory = await updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
        image: formData.image,
      });
      
      if (updatedCategory) {
        setCategories(prevCategories => 
          prevCategories.map(c => c.id === editingCategory.id ? updatedCategory : c)
        );
        
        toast({
          title: "Category Updated",
          description: `${updatedCategory.name} has been updated.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Could not update the category.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
      setEditingCategory(null);
    }
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Button onClick={() => navigate("/admin/categories/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>{productCounts[category.id] || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/products?category=${category.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500">No categories found</p>
        </div>
      )}
      
      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSubmit={handleUpdateCategory}
              onCancel={() => setEditingCategory(null)}
              isLoading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AddCategoryForm = () => {
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      setFormLoading(true);
      
      const newCategory = await addCategory({
        name: formData.name,
        description: formData.description,
        image: formData.image,
      });
      
      toast({
        title: "Category Added",
        description: `${newCategory.name} has been added successfully.`,
        variant: "default",
      });
      
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Could not add the category.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add New Category</h2>
          <p className="text-gray-500">
            Fill in the details below to create a new category.
          </p>
        </div>
        
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/categories")}
          isLoading={formLoading}
        />
      </CardContent>
    </Card>
  );
};

const AdminCategories = () => {
  return (
    <Routes>
      <Route index element={<CategoryList />} />
      <Route path="add" element={<AddCategoryForm />} />
    </Routes>
  );
};

export default AdminCategories;
