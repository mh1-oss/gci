
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Product, Category } from "@/data/initialData";
import { getProductById, getCategoryById } from "@/services/dataService";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check } from "lucide-react";

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getProductById(id)
      .then(async (productData) => {
        if (productData) {
          setProduct(productData);
          // Get category details
          const categoryData = await getCategoryById(productData.categoryId);
          setCategory(categoryData || null);
          document.title = `Modern Paint - ${productData.name}`;
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              <Skeleton className="aspect-square rounded-lg" />
              <div>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/4 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-gray-500 mb-6">
              The product you are looking for could not be found or has been removed.
            </p>
            <Link to="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/products" className="text-brand-blue hover:underline inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="rounded-lg overflow-hidden border border-gray-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <Link 
                  to={`/products?category=${product.categoryId}`}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full inline-block hover:bg-gray-200 transition-colors"
                >
                  {category?.name}
                </Link>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-brand-blue">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Color Options */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Available Colors:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-6">
                <Button size="lg" className="w-full md:w-auto">
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
          
          {/* Product Details Tabs */}
          <div className="border-t border-gray-100 p-6">
            <Tabs defaultValue="specifications">
              <TabsList className="w-full grid grid-cols-2 max-w-md mx-auto mb-6">
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="usage">Usage & Care</TabsTrigger>
              </TabsList>
              
              <TabsContent value="specifications" className="p-4">
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 w-1/2">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specifications available for this product.</p>
                )}
              </TabsContent>
              
              <TabsContent value="usage" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Surface Preparation</h3>
                    <p className="text-gray-700">
                      Ensure the surface is clean, dry, and free from loose paint, dust, or grease. 
                      Sand glossy surfaces to improve adhesion. Apply appropriate primer if needed.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Application</h3>
                    <p className="text-gray-700">
                      Stir thoroughly before use. Apply using a brush, roller, or spray equipment.
                      For best results, apply 2 coats allowing adequate drying time between coats.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Clean Up</h3>
                    <p className="text-gray-700">
                      Clean all equipment immediately after use with water for water-based products
                      or appropriate solvent for solvent-based products. Dispose of empty containers responsibly.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-brand-blue text-white p-1 rounded-full mr-3">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Superior Coverage</h3>
                  <p className="text-sm text-gray-600">
                    Provides excellent coverage in fewer coats, saving you time and money.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-brand-blue text-white p-1 rounded-full mr-3">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Long-Lasting Finish</h3>
                  <p className="text-sm text-gray-600">
                    Formulated to resist fading, staining, and wear for years of beautiful results.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-brand-blue text-white p-1 rounded-full mr-3">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Low VOC Formula</h3>
                  <p className="text-sm text-gray-600">
                    Environmentally responsible with minimal odor for a healthier living environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
