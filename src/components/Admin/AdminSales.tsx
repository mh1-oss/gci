import React from 'react';
import { Sale } from '@/utils/models';
import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
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
import { 
  createSale,
  deleteSale,
  mapDbSaleToSale,
  mapSaleToDbSale,
  mapSaleItemToDbSaleItem,
  DbSale,
  DbSaleItem
} from '@/services/sales/salesService';
import { Product } from "@/data/initialData";

const SalesList = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم حذف المبيعة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error) => {
      console.error('Error deleting sale:', error);
      toast({
        title: "خطأ في حذف المبيعة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف المبيعة",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (salesError) {
        console.error('Error loading sales:', salesError);
        toast({
          title: "خطأ في تحميل المبيعات",
          description: salesError.message,
          variant: "destructive",
        });
        return;
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name');
      
      const productMap = (products || []).reduce((acc, product) => {
        acc[product.id] = product.name;
        return acc;
      }, {} as Record<string, string>);

      const salesWithItems = await Promise.all(
        (salesData || []).map(async (sale: DbSale) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('sale_items')
            .select('*')
            .eq('sale_id', sale.id);
          
          if (itemsError) {
            console.error('Error loading sale items:', itemsError);
            return mapDbSaleToSale(sale, []);
          }
          
          const items = (itemsData || []).map((item: DbSaleItem) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: productMap[item.product_id] || 'منتج غير معروف',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          }));
          
          return mapDbSaleToSale(sale, items);
        })
      );
      
      setSales(salesWithItems);
    } catch (error) {
      console.error('Unexpected error loading sales:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تحميل المبيعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = (id: string) => {
    deleteMutation.mutate(id);
  };

  const printReceipt = (sale: Sale) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast({
        title: "تنبيه",
        description: "يرجى السماح بالنوافذ المنبثقة لطباعة الإيصال",
        variant: "destructive"
      });
      return;
    }
    
    receiptWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال رقم ${sale.id.substring(0, 8)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .info-block {
            width: 45%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: left;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>إيصال مبيعات</h1>
          <p>رقم المبيعة: ${sale.id.substring(0, 8)}</p>
          <p>تاريخ: ${format(new Date(sale.created_at), 'yyyy/MM/dd hh:mm a', { locale: ar })}</p>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>معلومات العميل</h3>
            <p><strong>الاسم:</strong> ${sale.customer_name}</p>
            ${sale.customer_phone ? `<p><strong>الهاتف:</strong> ${sale.customer_phone}</p>` : ''}
            ${sale.customer_email ? `<p><strong>البريد الإلكتروني:</strong> ${sale.customer_email}</p>` : ''}
          </div>
          <div class="info-block">
            <h3>ملخص المبيعة</h3>
            <p><strong>عدد المنتجات:</strong> ${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>إجمالي المبلغ:</strong> ${sale.total_amount.toLocaleString()} د.ع</p>
          </div>
        </div>
        
        <h3>المنتجات</h3>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
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
          الإجمالي: ${sale.total_amount.toLocaleString()} د.ع
        </div>
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>هذا الإيصال دليل على عملية الشراء</p>
        </div>
        
        <button onclick="window.print();" style="display: block; margin: 20px auto; padding: 10px 20px;">
          طباعة الإيصال
        </button>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.focus();
      receiptWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المبيعات</h2>
        <Button onClick={() => navigate("/admin/sales/new")}>
          <Plus className="ml-2 h-4 w-4" />
          مبيعة جديدة
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600">لا توجد مبيعات بعد</p>
            <p className="text-gray-500 mb-6">ابدأ بإضافة مبيعة جديدة</p>
            <Button onClick={() => navigate("/admin/sales/new")}>
              <Plus className="ml-2 h-4 w-4" />
              مبيعة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم المبيعة</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>عدد المنتجات</TableHead>
                <TableHead>تاريخ البيع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{sale.total_amount.toLocaleString()} د.ع</TableCell>
                  <TableCell>{sale.items.length}</TableCell>
                  <TableCell>
                    {format(new Date(sale.created_at), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/sales/${sale.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printReceipt(sale)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        طباعة
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSale(sale.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

const SaleDetails = () => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const saleId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (saleId) {
      loadSaleDetails(saleId);
    }
  }, [saleId]);

  const loadSaleDetails = async (id: string) => {
    try {
      setLoading(true);
      
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single();
      
      if (saleError) {
        console.error('Error loading sale details:', saleError);
        toast({
          title: "خطأ في تحميل تفاصيل المبيعة",
          description: saleError.message,
          variant: "destructive",
        });
        navigate('/admin/sales');
        return;
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name');
      
      const productMap = (products || []).reduce((acc, product) => {
        acc[product.id] = product.name;
        return acc;
      }, {} as Record<string, string>);

      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', id);
      
      if (itemsError) {
        console.error('Error loading sale items:', itemsError);
        toast({
          title: "خطأ في تحميل عناصر المبيعة",
          description: itemsError.message,
          variant: "destructive",
        });
      }
      
      const items = (itemsData || []).map((item: DbSaleItem) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: productMap[item.product_id] || 'منتج غير معروف',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));
      
      setSale(mapDbSaleToSale(saleData, items));
    } catch (error) {
      console.error('Unexpected error loading sale details:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تحميل تفاصيل المبيعة",
        variant: "destructive",
      });
      navigate('/admin/sales');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">لم يتم العثور على المبيعة</p>
        <Button
          variant="link"
          onClick={() => navigate('/admin/sales')}
          className="mt-4"
        >
          العودة إلى المبيعات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تفاصيل المبيعة #{sale.id.substring(0, 8)}</h2>
        <Button variant="outline" onClick={() => navigate('/admin/sales')}>
          العودة إلى المبيعات
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>الاسم</Label>
              <p className="font-medium">{sale.customer_name}</p>
            </div>
            {sale.customer_phone && (
              <div>
                <Label>رقم الهاتف</Label>
                <p className="font-medium">{sale.customer_phone}</p>
              </div>
            )}
            {sale.customer_email && (
              <div>
                <Label>البريد الإلكتروني</Label>
                <p className="font-medium">{sale.customer_email}</p>
              </div>
            )}
            <div>
              <Label>تاريخ البيع</Label>
              <p className="font-medium">
                {format(new Date(sale.created_at), 'yyyy/MM/dd hh:mm a', { locale: ar })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص المبيعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>إجمالي عدد المنتجات</Label>
              <p className="font-medium">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
            <div>
              <Label>إجمالي المبلغ</Label>
              <p className="font-medium text-lg text-brand-blue">{sale.total_amount.toLocaleString()} د.ع</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>المجموع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit_price.toLocaleString()} د.ع</TableCell>
                  <TableCell>{item.total_price.toLocaleString()} د.ع</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="text-lg font-bold">
            الإجمالي: {sale.total_amount.toLocaleString()} د.ع
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const NewSale = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cartItems, setCartItems] = useState<Array<{product: Product, quantity: number}>>([]);
  const [productQuantity, setProductQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const addToCart = (product: Product) => {
    const existingItemIndex = cartItems.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += productQuantity;
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { product, quantity: productQuantity }]);
    }
    
    setProductQuantity(1);
    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة ${product.name} إلى السلة`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const createSaleMutation = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) {
        throw new Error("السلة فارغة");
      }
      
      if (!customerName) {
        throw new Error("يرجى إدخال اسم العميل");
      }
      
      const saleData = {
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        total_amount: getTotal()
      };
      
      const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();
      
      if (saleError) {
        console.error('Error creating sale:', saleError);
        throw new Error(saleError.message);
      }
      
      const saleItems = cartItems.map(item => ({
        sale_id: newSale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        throw new Error(itemsError.message);
      }
      
      const stockTransactions = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        transaction_type: 'out' as const,
        notes: `بيع - ${customerName}`
      }));
      
      await supabase
        .from('stock_transactions')
        .insert(stockTransactions);
      
      const items = cartItems.map(item => ({
        id: '', // This will be replaced with actual IDs
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));
      
      return mapDbSaleToSale(newSale, items);
    },
    onSuccess: (newSale) => {
      toast({
        title: "تم البيع بنجاح",
        description: "تم إنشاء المبيعة وتسجيل المعاملة بنجاح",
      });
      
      printReceipt(newSale);
      
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      navigate('/admin/sales');
    },
    onError: (error) => {
      console.error('Error during checkout:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إكمال عملية البيع",
        variant: "destructive",
      });
    }
  });

  const printReceipt = (sale: Sale) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast({
        title: "تنبيه",
        description: "يرجى السماح بالنوافذ المنبثقة لطباعة الإيصال",
        variant: "destructive"
      });
      return;
    }
    
    receiptWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال رقم ${sale.id.substring(0, 8)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .info-block {
            width: 45%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: left;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>إيصال مبيعات</h1>
          <p>رقم المبيعة: ${sale.id.substring(0, 8)}</p>
          <p>تاريخ: ${format(new Date(sale.created_at), 'yyyy/MM/dd hh:mm a', { locale: ar })}</p>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>معلومات العميل</h3>
            <p><strong>الاسم:</strong> ${sale.customer_name}</p>
            ${sale.customer_phone ? `<p><strong>الهاتف:</strong> ${sale.customer_phone}</p>` : ''}
            ${sale.customer_email ? `<p><strong>البريد الإلكتروني:</strong> ${sale.customer_email}</p>` : ''}
          </div>
          <div class="info-block">
            <h3>ملخص المبيعة</h3>
            <p><strong>عدد المنتجات:</strong> ${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>إجمالي المبلغ:</strong> ${sale.total_amount.toLocaleString()} د.ع</p>
          </div>
        </div>
        
        <h3>المنتجات</h3>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
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
          الإجمالي: ${sale.total_amount.toLocaleString()} د.ع
        </div>
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>هذا الإيصال دليل على عملية الشراء</p>
        </div>
        
        <button onclick="window.print();" style="display: block; margin: 20px auto; padding: 10px 20px;">
          طباعة الإيصال
        </button>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.focus();
      receiptWindow.print();
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createSaleMutation.mutate();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مبيعة جديدة</h2>
        <Button variant="outline" onClick={() => navigate('/admin/sales')}>
          العودة إلى المبيعات
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">اسم العميل</Label>
                    <Input
                      id="customerName"
                      placeholder="أدخل اسم العميل"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">رقم الهاتف</Label>
                    <Input
                      id="customerPhone"
                      placeholder="أدخل رقم الهاتف"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="أدخل البريد الإلكتروني"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue"></div>
                </div>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">جميع المنتجات</TabsTrigger>
                    <TabsTrigger value="search">بحث</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products && products.map((product: Product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex flex-col h-full">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500 mb-2">{product.price.toLocaleString()} د.ع</div>
                              <div className="mt-auto flex items-center space-x-2 space-x-reverse">
                                <Input
                                  type="number"
                                  min="1"
                                  value={productQuantity}
                                  onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                                <Button size="sm" onClick={() => addToCart(product)}>إضافة</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="search">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="ابحث عن منتج..."
                          className="pr-10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search results would go here */}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>سلة المشتريات</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">السلة فارغة</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} × {item.product.price.toLocaleString()} د.ع
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="font-medium">
                          {(item.product.price * item.quantity).toLocaleString()} د.ع
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <div>المجموع</div>
                    <div>{getTotal().toLocaleString()} د.ع</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={cartItems.length === 0 || !customerName || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ml-2"></div>
                    جاري إكمال البيع...
                  </div>
                ) : (
                  <>
                    إكمال البيع
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
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
