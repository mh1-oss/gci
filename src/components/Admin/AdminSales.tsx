
import React from 'react';
import { Sale } from '@/utils/models';
import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowRight, FileText, Plus, Printer, Search, Trash } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { fetchProducts } from "@/services/products/productService";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { printReceipt } from "@/services/receipt/receiptService";
import { createSaleFromCart, deleteSale } from '@/services/sales/salesService';
import { mapDbSaleToSale } from '@/utils/models/salesMappers';
import { Product } from "@/utils/models/types";
import { useCurrency } from "@/context/CurrencyContext";

// Helper function to format price with the correct currency
const formatSalePrice = (price: number, currency: 'USD' | 'IQD') => {
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`;
  } else {
    return `${Math.round(price).toLocaleString()} د.ع`;
  }
};

const SalesList = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: salesData, isLoading, isError } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*');

      if (error) {
        console.error("Error fetching sales:", error);
        throw new Error(error.message);
      }

      return data;
    }
  });

  useEffect(() => {
    if (salesData) {
      const fetchSaleItems = async () => {
        const salesWithItems = await Promise.all(
          salesData.map(async (sale) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('sale_items')
              .select('*')
              .eq('sale_id', sale.id);

            if (itemsError) {
              console.error(`Error fetching items for sale ${sale.id}:`, itemsError);
              return mapDbSaleToSale(sale); // Return sale without items in case of error
            }
            
            // Get product names for each sale item
            const itemsWithProductNames = await Promise.all(itemsData.map(async (item) => {
              const { data: productData } = await supabase
                .from('products')
                .select('name')
                .eq('id', item.product_id)
                .single();
                
              return {
                ...item,
                product_name: productData?.name || 'Unknown Product'
              };
            }));

            return mapDbSaleToSale(sale, itemsWithProductNames);
          })
        );
        setSales(salesWithItems);
      };

      fetchSaleItems();
    }
  }, [salesData]);

  const handleDeleteSale = async (saleId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sale?");
    if (!confirmDelete) return;

    const { success, error } = await deleteSale(saleId);

    if (success) {
      toast({
        title: "Sale Deleted",
        description: "The sale has been successfully deleted.",
      });
      queryClient.invalidateQueries({queryKey: ['sales']});
    } else {
      toast({
        title: "Error",
        description: `Failed to delete sale: ${error || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading sales...</div>;
  if (isError) return <div>Error fetching sales.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Input
            type="text"
            placeholder="Search sales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => navigate("new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales
              .filter(sale =>
                sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customer_phone?.includes(searchQuery) ||
                sale.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.id.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Link to={`${sale.id}`} className="hover:underline">
                      {sale.id.substring(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{sale.customer_phone || 'N/A'}</TableCell>
                  <TableCell>{sale.customer_email || 'N/A'}</TableCell>
                  <TableCell>{formatSalePrice(sale.total_amount, sale.currency)}</TableCell>
                  <TableCell>{sale.currency}</TableCell>
                  <TableCell>{sale.status}</TableCell>
                  <TableCell>{format(new Date(sale.created_at), 'yyyy/MM/dd', { locale: ar })}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`${sale.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSale(sale.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        {sales.length === 0 ? "No sales found." : null}
      </CardFooter>
    </Card>
  );
};

const SaleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: fetchedCompanyInfo } = useQuery({
    queryKey: ['companyInfo'],
    queryFn: fetchCompanyInfo
  });

  useEffect(() => {
    if (fetchedCompanyInfo) {
      setCompanyInfo(fetchedCompanyInfo);
    }
  }, [fetchedCompanyInfo]);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Sale ID is missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .select('*')
          .eq('id', id)
          .single();

        if (saleError) {
          console.error("Error fetching sale:", saleError);
          throw new Error(saleError.message);
        }

        if (!saleData) {
          toast({
            title: "Error",
            description: "Sale not found.",
            variant: "destructive",
          });
          navigate('/admin/sales');
          return;
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from('sale_items')
          .select('*')
          .eq('sale_id', id);

        if (itemsError) {
          console.error("Error fetching sale items:", itemsError);
          throw new Error(itemsError.message);
        }

        // Get product names for each sale item
        const itemsWithProductNames = await Promise.all(itemsData.map(async (item) => {
          const { data: productData } = await supabase
            .from('products')
            .select('name')
            .eq('id', item.product_id)
            .single();
            
          return {
            ...item,
            product_name: productData?.name || 'Unknown Product'
          };
        }));

        setSale(mapDbSaleToSale(saleData, itemsWithProductNames));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch sale details.",
          variant: "destructive",
        });
      }
    };

    fetchSaleDetails();
  }, [id, navigate, toast]);

  const handlePrintReceipt = () => {
    if (sale) {
      if (companyInfo) {
        printReceipt(sale, companyInfo);
      } else {
        printReceipt(sale);
      }
    } else {
      toast({
        title: "Error",
        description: "Sale details not loaded yet.",
        variant: "destructive",
      });
    }
  };

  if (!sale) {
    return <div>Loading sale details...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sale Details</CardTitle>
        <CardContent>
          <Button onClick={() => navigate("/admin/sales")} className="mr-2">
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Sales
          </Button>
          <Button onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </CardContent>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Label>Sale ID</Label>
            <p className="font-semibold">{sale.id}</p>
          </div>
          <div>
            <Label>Customer Name</Label>
            <p>{sale.customer_name}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p>{sale.customer_phone || 'N/A'}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p>{sale.customer_email || 'N/A'}</p>
          </div>
          <div>
            <Label>Total Amount</Label>
            <p>{formatSalePrice(sale.total_amount, sale.currency)} ({sale.currency})</p>
          </div>
          <div>
            <Label>Status</Label>
            <p>{sale.status}</p>
          </div>
          <div>
            <Label>Date</Label>
            <p>{format(new Date(sale.created_at), 'yyyy/MM/dd hh:mm a', { locale: ar })}</p>
          </div>
          <div>
            <Label>Items</Label>
            <ul>
              {sale.items.map((item) => (
                <li key={item.id} className="mb-2">
                  {item.product_name} - Quantity: {item.quantity} - Unit Price: {formatSalePrice(item.unit_price, sale.currency)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NewSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products.",
          variant: "destructive",
        });
      }
    };

    fetchAllProducts();
  }, [toast]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty. Add products to create a sale.",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone,
      customer_email: customerEmail,
      cartItems: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      currency: currency,
    };

    const { success, error } = await createSaleFromCart(
      saleData.customer_name,
      saleData.customer_phone,
      saleData.customer_email,
      saleData.cartItems,
      saleData.currency
    );

    if (success) {
      toast({
        title: "Sale Created",
        description: "Sale has been successfully created.",
      });
      clearCart();
      navigate("/admin/sales");
    } else {
      toast({
        title: "Error",
        description: `Failed to create sale: ${error || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Label>Customer Name</Label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="products" className="mt-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer" onClick={() => addToCart(product)}>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <img src={product.images?.[0] || product.image || '/placeholder.svg'} alt={product.name} className="h-20 w-20 object-cover mb-2" />
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.price}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="cart">
            {cart.length === 0 ? (
              <p>Cart is empty.</p>
            ) : (
              <>
                <ul>
                  {cart.map((item) => (
                    <li key={item.id} className="flex items-center justify-between mb-2">
                      <div>
                        {item.name} - {item.price}
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          className="w-16 text-center mx-2"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="font-semibold">Total: {calculateTotal()}</div>
                <Button onClick={clearCart} className="mr-2">Clear Cart</Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateSale}>Create Sale</Button>
      </CardFooter>
    </Card>
  );
};

const AdminSales = () => {
  return (
    <Routes>
      <Route index element={<SalesList />} />
      <Route path="new" element={<NewSale />} />
      <Route path=":id" element={<SaleDetails />} />
    </Routes>
  );
};

export default AdminSales;
