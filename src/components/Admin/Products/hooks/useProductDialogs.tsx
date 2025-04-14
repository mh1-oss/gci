
import { useState } from 'react';
import { Product } from '@/utils/models/types'; // Changed from data/initialData to utils/models/types

export const useProductDialogs = () => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setSelectedProduct(null);
    setFormDialogOpen(true);
  };
  
  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditMode(true);
    setFormDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  return {
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
  };
};
