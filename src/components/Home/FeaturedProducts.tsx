
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/data/initialData";
import { fetchFeaturedProducts } from "@/services/products/productService";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setLoading(true);
    fetchFeaturedProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching featured products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-5 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our most popular and top-rated paint products, selected for their exceptional quality and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="product-card overflow-hidden h-full flex flex-col">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold text-lg mb-2 hover:text-brand-blue transition-colors">
                  <Link to={`/products/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-brand-blue font-bold text-lg">
                  {formatPrice(product.price)}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link to={`/products/${product.id}`} className="w-full">
                  <Button variant="default" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
