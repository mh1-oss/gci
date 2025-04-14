
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { useProductData } from './hooks/useProductData';
import { useProductDialogs } from './hooks/useProductDialogs';
import { useProductOperations } from './hooks/useProductOperations';
import { Product } from '@/utils/models/types'; // Changed from data/initialData to utils/models/types

export const useProductsManagement = () => {
  // Get connection status
  const {
    connectionStatus,
    error: connectionError,
    checkConnection,
    setError: setConnectionError
  } = useConnectionStatus();
  
  // Get product data
  const {
    products,
    categories,
    loading,
    error: dataError,
    setProducts,
    setError: setDataError,
    fetchAllData
  } = useProductData(connectionStatus);
  
  // Get dialog state management
  const {
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isProcessing,
    setIsProcessing,
    editMode,
    setEditMode,
    selectedProduct,
    setSelectedProduct,
    handleOpenCreateDialog,
    handleOpenEditDialog,
    handleOpenDeleteDialog
  } = useProductDialogs();
  
  // Get product CRUD operations
  const {
    handleFormSubmit: handleFormSubmitOperation,
    handleDelete: handleDeleteOperation
  } = useProductOperations({
    setProducts,
    setError: setDataError,
    setIsProcessing,
    setFormDialogOpen,
    setDeleteDialogOpen,
    setSelectedProduct,
    setEditMode
  });

  // Combine errors from multiple sources
  const error = connectionError || dataError;
  
  // Wrap operations to provide current state
  const handleFormSubmit = async (formData: any) => {
    await handleFormSubmitOperation(formData, editMode, selectedProduct as Product);
  };
  
  const handleDelete = async () => {
    await handleDeleteOperation(selectedProduct as Product);
  };

  return {
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
  };
};
