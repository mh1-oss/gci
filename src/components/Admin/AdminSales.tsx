
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts } from "@/services/supabaseService";
import { Product } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash, Search, ShoppingCart, FileText, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CartItem {
  product: Product;
  quantity: number;
}

interface Sale {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number;
  created_at: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

const AdminSales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSale, setSavingSale] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  
  // Customer information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsData = await fetchProducts();
      setProducts(productsData);
      
      await fetchSales();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSales = async () => {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (salesError) throw salesError;
      
      const salesWithItems = await Promise.all(
        salesData.map(async (sale) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('sale_items')
            .select(`
              id,
              quantity,
              unit_price,
              total_price,
              products(name)
            `)
            .eq('sale_id', sale.id);
          
          if (itemsError) throw itemsError;
          
          return {
            ...sale,
            items: itemsData.map(item => ({
              id: item.id,
              product_name: item.products?.name || 'Unknown Product',
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price
            }))
          };
        })
      );
      
      setSales(salesWithItems);
      
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المبيعات",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...currentCart, { product, quantity: 1 }];
      }
    });
    
    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة ${product.name} إلى السلة`,
    });
  };
  
  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.product.id !== productId));
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(currentCart => 
      currentCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "خطأ",
        description: "السلة فارغة",
        variant: "destructive",
      });
      return;
    }
    
    if (!customerName) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSavingSale(true);
      
      // Create the sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            customer_name: customerName,
            customer_phone: customerPhone || null,
            customer_email: customerEmail || null,
            total_amount: calculateTotal(),
          }
        ])
        .select()
        .single();
      
      if (saleError) throw saleError;
      
      // Create sale items and update stock
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));
      
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) throw itemsError;
      
      // Update stock quantities
      for (const item of cart) {
        // Get current stock quantity
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product.id)
          .single();
        
        if (productError) throw productError;
        
        const newQuantity = Math.max(0, productData.stock_quantity - item.quantity);
        
        // Update stock quantity
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newQuantity })
          .eq('id', item.product.id);
        
        if (updateError) throw updateError;
        
        // Record the stock transaction
        const { error: transactionError } = await supabase
          .from('stock_transactions')
          .insert([
            {
              product_id: item.product.id,
              quantity: item.quantity,
              transaction_type: 'out',
              notes: `مبيعات - فاتورة رقم: ${sale.id}`,
            }
          ]);
        
        if (transactionError) throw transactionError;
      }
      
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل البيع بنجاح",
      });
      
      // Fetch the complete sale with items for the receipt
      const { data: saleWithItems, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', sale.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { data: itemsData, error: fetchItemsError } = await supabase
        .from('sale_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          products(name)
        `)
        .eq('sale_id', sale.id);
      
      if (fetchItemsError) throw fetchItemsError;
      
      const completeData = {
        ...saleWithItems,
        items: itemsData.map(item => ({
          id: item.id,
          product_name: item.products?.name || 'Unknown Product',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))
      };
      
      setSelectedSale(completeData);
      setShowReceiptDialog(true);
      
      // Reset the cart and form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setShowCheckout(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error saving sale:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل البيع",
        variant: "destructive",
      });
    } finally {
      setSavingSale(false);
    }
  };
  
  const handleShowReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setShowReceiptDialog(true);
  };
  
  const printReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow || !selectedSale) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إيصال بيع</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .customer-info {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 10px;
            text-align: right;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: left;
            font-weight: bold;
            font-size: 18px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>إيصال بيع</h1>
            <p>رقم: ${selectedSale.id}</p>
            <p>تاريخ: ${new Date(selectedSale.created_at).toLocaleDateString('ar-IQ')}</p>
          </div>
          
          <div class="customer-info">
            <h3>معلومات العميل:</h3>
            <p>الاسم: ${selectedSale.customer_name}</p>
            ${selectedSale.customer_phone ? `<p>الهاتف: ${selectedSale.customer_phone}</p>` : ''}
            ${selectedSale.customer_email ? `<p>البريد الإلكتروني: ${selectedSale.customer_email}</p>` : ''}
          </div>
          
          <h3>المنتجات:</h3>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر الفردي</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${selectedSale.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit_price.toLocaleString()} د.ع</td>
                  <td>${item.total_price.toLocaleString()} د.ع</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            المجموع الكلي: ${selectedSale.total_amount.toLocaleString()} د.ع
          </div>
          
          <div class="footer">
            <p>شكراً لتعاملكم معنا!</p>
            <p class="no-print"><button onclick="window.print()">طباعة الإيصال</button></p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    receiptWindow.document.open();
    receiptWindow.document.write(printContent);
    receiptWindow.document.close();
  };

  // Filter products and sales based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSales = sales.filter(sale => 
    sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.items.some(item => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">المبيعات والأرباح</h2>
        <div className="flex space-x-4 space-x-reverse">
          <Button 
            className="flex items-center gap-2"
            variant={showCheckout ? "secondary" : "default"}
            onClick={() => setShowCheckout(!showCheckout)}
          >
            <ShoppingCart className="h-4 w-4" />
            {cart.length > 0 ? `عربة التسوق (${cart.length})` : "عربة التسوق"}
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث عن منتج أو عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>
      
      {showCheckout ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>منتجات للبيع</CardTitle>
                <CardDescription>
                  اختر المنتجات لإضافتها إلى سلة المشتريات.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{product.price.toLocaleString()} د.ع</p>
                        <Button 
                          onClick={() => addToCart(product)} 
                          size="sm" 
                          className="w-full"
                        >
                          إضافة للسلة
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>عربة التسوق</CardTitle>
                <CardDescription>
                  المنتجات المضافة إلى السلة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 my-4">السلة فارغة</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">{item.product.price.toLocaleString()} د.ع</p>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500" 
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <p className="text-lg font-bold">
                        المجموع: {calculateTotal().toLocaleString()} د.ع
                      </p>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <h4 className="font-medium">معلومات العميل</h4>
                      <div>
                        <Label htmlFor="customer-name">اسم العميل *</Label>
                        <Input
                          id="customer-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-phone">رقم الهاتف</Label>
                        <Input
                          id="customer-phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-email">البريد الإلكتروني</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || savingSale}
                >
                  {savingSale ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    "إنهاء عملية البيع"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>سجل المبيعات</CardTitle>
            <CardDescription>
              عرض سجل المبيعات السابقة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاريخ البيع</TableHead>
                  <TableHead>اسم العميل</TableHead>
                  <TableHead>عدد المنتجات</TableHead>
                  <TableHead>المجموع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      لا توجد مبيعات مسجلة
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {format(new Date(sale.created_at), 'PPP', { locale: ar })}
                      </TableCell>
                      <TableCell className="font-medium">{sale.customer_name}</TableCell>
                      <TableCell>{sale.items.length}</TableCell>
                      <TableCell>{sale.total_amount.toLocaleString()} د.ع</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleShowReceipt(sale)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إيصال البيع</DialogTitle>
            <DialogDescription>
              تفاصيل عملية البيع والمنتجات المباعة.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">رقم الإيصال: {selectedSale.id}</p>
                <p className="text-sm text-gray-500">
                  التاريخ: {format(new Date(selectedSale.created_at), 'PPP', { locale: ar })}
                </p>
              </div>
              
              <div className="border-b pb-2">
                <h4 className="font-medium mb-2">معلومات العميل:</h4>
                <p>الاسم: {selectedSale.customer_name}</p>
                {selectedSale.customer_phone && <p>الهاتف: {selectedSale.customer_phone}</p>}
                {selectedSale.customer_email && <p>البريد الإلكتروني: {selectedSale.customer_email}</p>}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">المنتجات:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المجموع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit_price.toLocaleString()} د.ع</TableCell>
                        <TableCell>{item.total_price.toLocaleString()} د.ع</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t pt-2 flex justify-between items-center">
                <h4 className="font-bold">المجموع الكلي:</h4>
                <p className="font-bold text-lg">
                  {selectedSale.total_amount.toLocaleString()} د.ع
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={printReceipt} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              طباعة الإيصال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSales;
