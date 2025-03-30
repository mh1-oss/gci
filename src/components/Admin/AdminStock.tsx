
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, ArrowUp, ArrowDown, Plus, Search } from "lucide-react";

type StockTransaction = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  transaction_type: 'in' | 'out';
  notes: string | null;
  created_at: string;
};

const AdminStock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsData = await fetchProducts();
      setProducts(productsData);
      
      const { data: transactionsData, error } = await supabase
        .from('stock_transactions')
        .select(`
          id,
          product_id,
          quantity,
          transaction_type,
          notes,
          created_at,
          products(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const formattedTransactions = transactionsData.map((transaction) => ({
        id: transaction.id,
        product_id: transaction.product_id,
        product_name: transaction.products?.name || 'Unknown Product',
        quantity: transaction.quantity,
        transaction_type: transaction.transaction_type,
        notes: transaction.notes,
        created_at: transaction.created_at,
      }));
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!selectedProductId || quantity <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد منتج وكمية صالحة",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessing(true);
      
      // First, let's get the current stock quantity
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', selectedProductId)
        .single();
      
      if (productError) throw productError;
      
      let newQuantity = productData.stock_quantity;
      
      if (transactionType === 'in') {
        newQuantity += quantity;
      } else {
        // Check if we have enough stock for outgoing transaction
        if (productData.stock_quantity < quantity) {
          toast({
            title: "خطأ",
            description: "الكمية المطلوبة أكبر من الكمية المتوفرة في المخزون",
            variant: "destructive",
          });
          return;
        }
        newQuantity -= quantity;
      }
      
      // Add the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('stock_transactions')
        .insert([
          {
            product_id: selectedProductId,
            quantity: quantity,
            transaction_type: transactionType,
            notes: notes || null,
          }
        ])
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Update the product stock quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', selectedProductId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل حركة المخزون بنجاح",
      });
      
      // Reset form and refresh data
      setSelectedProductId('');
      setTransactionType('in');
      setQuantity(1);
      setNotes('');
      setOpenAddDialog(false);
      fetchData();
      
    } catch (error) {
      console.error('Error adding stock transaction:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل حركة المخزون",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction => 
    transaction.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (transaction.notes && transaction.notes.toLowerCase().includes(searchQuery.toLowerCase()))
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
        <h2 className="text-2xl font-bold">إدارة المخزون</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة حركة مخزون
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة حركة مخزون جديدة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل حركة المخزون الجديدة هنا.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">المنتج</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="اختر منتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">نوع الحركة</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value: 'in' | 'out') => setTransactionType(value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="اختر نوع الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">إضافة (وارد)</SelectItem>
                    <SelectItem value="out">سحب (صادر)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات إضافية هنا"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddTransaction} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  "حفظ"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث عن منتج أو حركة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>
      
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">المخزون الحالي</TabsTrigger>
          <TabsTrigger value="transactions">حركة المخزون</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المخزون الحالي</CardTitle>
              <CardDescription>
                عرض مستويات المخزون الحالية لجميع المنتجات.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>سعر التكلفة</TableHead>
                    <TableHead>الربح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا توجد منتجات متاحة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      // Find the product in Supabase data to get stock_quantity and cost_price
                      const productData = products.find(p => p.id === product.id);
                      const stockQuantity = (productData as any)?.stock_quantity || 0;
                      const costPrice = (productData as any)?.cost_price || 0;
                      const profit = product.price - costPrice;
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.categoryId}</TableCell>
                          <TableCell>{stockQuantity}</TableCell>
                          <TableCell>{product.price.toLocaleString()} د.ع</TableCell>
                          <TableCell>{costPrice.toLocaleString()} د.ع</TableCell>
                          <TableCell>{profit.toLocaleString()} د.ع</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل حركة المخزون</CardTitle>
              <CardDescription>
                عرض جميع حركات المخزون السابقة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد حركات مخزون سابقة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.created_at).toLocaleDateString('ar-IQ')}</TableCell>
                        <TableCell className="font-medium">{transaction.product_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {transaction.transaction_type === 'in' ? (
                              <><ArrowDown className="h-4 w-4 text-green-500 ml-2" /> وارد</>
                            ) : (
                              <><ArrowUp className="h-4 w-4 text-red-500 ml-2" /> صادر</>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>{transaction.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStock;
