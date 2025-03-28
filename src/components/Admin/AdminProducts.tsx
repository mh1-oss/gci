
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Product, Category } from "@/data/initialData";
import { 
  getProducts, 
  getCategories, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
  featured: boolean;
  colors: string;
}

const defaultProductForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  image: "/placeholder.svg",
  featured: false,
  colors: "",
};

const ProductForm = ({ 
  product, 
  categories, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  product?: Product; 
  categories: Category[]; 
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<ProductFormData>(
    product ? {
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId,
      image: product.image,
      featured: product.featured,
      colors: product.colors ? product.colors.join(", ") : "",
    } : { ...defaultProductForm }
  );
  
  const handleChange = (field: keyof ProductFormData, value: string | boolean) => {
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
          Product Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter product name"
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
          placeholder="Enter product description"
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (USD)
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => handleChange("categoryId", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      
      <div>
        <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-1">
          Available Colors (comma separated)
        </label>
        <Input
          id="colors"
          value={formData.colors}
          onChange={(e) => handleChange("colors", e.target.value)}
          placeholder="e.g. Red, Blue, Green"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => handleChange("featured", !!checked)}
        />
        <label
          htmlFor="featured"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Featured Product
        </label>
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
            'Save Product'
          )}
        </Button>
      </div>
    </form>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching products data:", error);
        toast({
          title: "Error",
          description: "Could not load products data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  };
  
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      setFormLoading(true);
      const success = await deleteProduct(productToDelete.id);
      
      if (success) {
        setProducts(prevProducts => 
          prevProducts.filter(p => p.id !== productToDelete.id)
        );
        
        toast({
          title: "Product Deleted",
          description: `${productToDelete.name} has been removed.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Could not delete the product.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };
  
  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (!editingProduct) return;
    
    try {
      setFormLoading(true);
      
      const updatedProduct = await updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        image: formData.image,
        featured: formData.featured,
        colors: formData.colors ? formData.colors.split(",").map(c => c.trim()) : undefined,
      });
      
      if (updatedProduct) {
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === editingProduct.id ? updatedProduct : p)
        );
        
        toast({
          title: "Product Updated",
          description: `${updatedProduct.name} has been updated.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Could not update the product.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
      setEditingProduct(null);
    }
  };
  
  // Get category name by id
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Button onClick={() => navigate("/admin/products/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.featured ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditClick(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(product)}
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
          <p className="text-gray-500">No products found</p>
        </div>
      )}
      
      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
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
              Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
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

const AddProductForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Could not load categories.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [toast]);
  
  const handleSubmit = async (formData: ProductFormData) => {
    try {
      setFormLoading(true);
      
      const newProduct = await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        image: formData.image,
        featured: formData.featured,
        colors: formData.colors ? formData.colors.split(",").map(c => c.trim()) : undefined,
      });
      
      toast({
        title: "Product Added",
        description: `${newProduct.name} has been added successfully.`,
        variant: "default",
      });
      
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Could not add the product.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add New Product</h2>
          <p className="text-gray-500">
            Fill in the details below to create a new product.
          </p>
        </div>
        
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/products")}
          isLoading={formLoading}
        />
      </CardContent>
    </Card>
  );
};

const AdminProducts = () => {
  return (
    <Routes>
      <Route index element={<ProductList />} />
      <Route path="add" element={<AddProductForm />} />
    </Routes>
  );
};

export default AdminProducts;
