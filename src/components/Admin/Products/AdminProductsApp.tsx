
import React, { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useProductsManagement } from './useProductsManagement';
import ProductErrorHandler from './ProductErrorHandler';
import AdminProductActions from './AdminProductActions';
import ProductFormDialog from './ProductFormDialog';
import SupabaseConnectionStatus from '../SupabaseConnectionStatus';
import ProductsLoading from './ProductsLoading';
import NoProductsView from './NoProductsView';
import ProductListTable from './ProductListTable';
import DeleteProductDialog from './DeleteProductDialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, AlertCircle } from "lucide-react";
import RlsErrorDisplay from '@/components/ErrorHandling/RlsErrorDisplay';

const AdminProductsApp = () => {
  const {
    products,
    categories,
    loading,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isProcessing,
    editMode,
    selectedProduct,
    error,
    connectionStatus,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleOpenDeleteDialog,
    handleFormSubmit,
    handleDelete,
    fetchAllData,
    checkConnection
  } = useProductsManagement();
  
  const { toast } = useToast();
  
  // Show notification for RLS errors but continue to show local data
  useEffect(() => {
    if (connectionStatus === 'connected' && error && (typeof error === 'string' && error.toLowerCase().includes('rls'))) {
      toast({
        title: "تنبيه إعدادات الأمان",
        description: "يمكنك متابعة الاستخدام، ولكن قد تواجه صعوبات في حفظ التغييرات.",
      });
    }
  }, [connectionStatus, error, toast]);

  // Helper to check if we have an RLS error but we're still showing data
  const hasRlsButShowingData = () => {
    return error && 
           (typeof error === 'string' && error.toLowerCase().includes('rls')) && 
           products.length > 0 && 
           connectionStatus === 'connected';
  };

  // Check if error is specifically an RLS recursion error
  const isRlsRecursionError = () => {
    return error && 
           typeof error === 'string' && (
              error.toLowerCase().includes('infinite recursion') || 
              error.toLowerCase().includes('policy for relation')
           );
  };
  
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>إضافة وتعديل وحذف المنتجات الموجودة في الموقع</CardDescription>
          </div>
          <AdminProductActions
            onAddNew={handleOpenCreateDialog}
            onRefresh={fetchAllData}
            isLoading={loading}
          />
        </CardHeader>
        <CardContent>
          {/* Always show connection status during loading or when there's a connection issue */}
          {(connectionStatus === 'checking' || connectionStatus === 'disconnected' || 
              (error && typeof error === 'string' && error.toLowerCase().includes('rls'))) && (
            <SupabaseConnectionStatus />
          )}
          
          {/* For RLS errors when we still have products to display */}
          {hasRlsButShowingData() && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <InfoIcon className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">تنبيه إعدادات الأمان</AlertTitle>
              <AlertDescription className="text-amber-700">
                نعرض حالياً البيانات المخزنة محلياً. قد تواجه صعوبات في حفظ التغييرات بسبب مشكلة في سياسات الأمان (RLS).
              </AlertDescription>
            </Alert>
          )}
          
          {/* Critical connection error */}
          {connectionStatus === 'disconnected' && (
            <ProductErrorHandler
              error="لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
              onRetry={checkConnection}
            />
          )}
          
          {/* RLS Recursion error - use specialized component */}
          {isRlsRecursionError() && (
            <RlsErrorDisplay
              error={error}
              onRetry={fetchAllData}
              showLogoutButton={true}
            />
          )}
          
          {/* Loading state */}
          {connectionStatus === 'checking' || loading ? (
            <ProductsLoading />
          ) : connectionStatus === 'connected' && products.length === 0 && !error ? (
            <NoProductsView onAddNew={handleOpenCreateDialog} />
          ) : connectionStatus === 'connected' && products.length > 0 ? (
            <ProductListTable 
              products={products}
              categories={categories}
              onEditProduct={handleOpenEditDialog}
              onDeleteProduct={handleOpenDeleteDialog}
            />
          ) : error && !hasRlsButShowingData() && !isRlsRecursionError() && (
            <ProductErrorHandler
              error={error}
              onRetry={fetchAllData}
              showLogoutOption={typeof error === 'string' && (error.toLowerCase().includes('rls') || error.toLowerCase().includes('user_roles'))}
            />
          )}
        </CardContent>
      </Card>
      
      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        editMode={editMode}
        title={editMode ? 'تعديل منتج' : 'إضافة منتج جديد'}
        description={editMode 
          ? 'قم بتعديل بيانات المنتج في النموذج أدناه' 
          : 'أدخل بيانات المنتج الجديد في النموذج أدناه'
        }
        initialData={selectedProduct || {}}
        categories={categories}
        isProcessing={isProcessing}
        error={error}
      />
      
      <DeleteProductDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        selectedProduct={selectedProduct}
        isProcessing={isProcessing}
        error={error}
      />
    </div>
  );
};

export default AdminProductsApp;
