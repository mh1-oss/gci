import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/services/products/productService";
import { fetchCategories } from "@/services/categories/categoryService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, FolderTree, Settings, DollarSign, RefreshCw } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const AdminOverview = () => {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currency, exchangeRate } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const products = await fetchProducts();
        const categories = await fetchCategories();
        
        setProductCount(products.length);
        setCategoryCount(categories.length);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Products</CardTitle>
            <Package className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {loading ? "..." : productCount}
            </div>
            <p className="text-sm text-gray-500">Total products in catalog</p>
            <Link to="/admin/products" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Manage Products</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Categories</CardTitle>
            <FolderTree className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {loading ? "..." : categoryCount}
            </div>
            <p className="text-sm text-gray-500">Product categories</p>
            <Link to="/admin/categories" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Manage Categories</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Exchange Rate</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {exchangeRate} IQD
            </div>
            <p className="text-sm text-gray-500">
              Current rate: 1 USD = {exchangeRate} IQD
            </p>
            <Link to="/admin/settings" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Update Rate</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you may want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/products/add" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link to="/admin/categories/add" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FolderTree className="mr-2 h-4 w-4" />
                Add New Category
              </Button>
            </Link>
            <Link to="/admin/settings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Update Settings
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Dashboard
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Currency:</dt>
                <dd>{currency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Exchange Rate:</dt>
                <dd>1 USD = {exchangeRate} IQD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Last Update:</dt>
                <dd>{new Date().toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Admin User:</dt>
                <dd>Admin</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
