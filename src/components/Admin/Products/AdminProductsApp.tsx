
import React from 'react';
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
import RlsErrorDisplay from '@/components/ErrorHandling/RlsErrorDisplay';
import { isRlsPolicyError } from '@/services/rls/rlsErrorHandler';

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
          <SupabaseConnectionStatus />
          
          {connectionStatus === 'disconnected' && (
            <ProductErrorHandler
              error="لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
              onRetry={checkConnection}
            />
          )}
          
          {error && connectionStatus !== 'disconnected' && isRlsPolicyError(error) ? (
            <RlsErrorDisplay 
              error={error}
              onRetry={fetchAllData}
            />
          ) : error && connectionStatus !== 'disconnected' && (
            <ProductErrorHandler
              error={error}
              onRetry={fetchAllData}
            />
          )}
          
          {connectionStatus === 'checking' || loading ? (
            <ProductsLoading />
          ) : connectionStatus === 'connected' && products.length === 0 ? (
            <NoProductsView onAddNew={handleOpenCreateDialog} />
          ) : connectionStatus === 'connected' && (
            <ProductListTable 
              products={products}
              categories={categories}
              onEditProduct={handleOpenEditDialog}
              onDeleteProduct={handleOpenDeleteDialog}
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
