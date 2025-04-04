
import { useState } from 'react';
import { Category } from '@/data/initialData';
import { useCategoryFetch } from './useCategoryFetch';
import { useCategoryMutations } from './useCategoryMutations';
import { useCategoryForm } from './useCategoryForm';

export const useCategoryManagement = () => {
  const { 
    categories, 
    setCategories, 
    loading, 
    error, 
    setError, 
    loadCategories 
  } = useCategoryFetch();
  
  const {
    name,
    setName,
    description,
    setDescription,
    resetForm,
    setFormData,
    getFormData
  } = useCategoryForm();

  const {
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isSaving,
    editMode,
    editTarget,
    handleCreate: mutationCreate,
    handleEdit: mutationEdit,
    handleUpdate: mutationUpdate,
    handleDelete: mutationDelete,
    handleDeleteConfirm
  } = useCategoryMutations({ 
    setCategories, 
    setError,
    resetForm: () => {
      resetForm();
    }
  });

  // Handler functions
  const handleCreate = () => {
    mutationCreate(getFormData());
  };

  const handleUpdate = () => {
    mutationUpdate(getFormData());
  };

  const handleEdit = (category: Category) => {
    setFormData(category);
    mutationEdit(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    mutationDelete(category);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
    setError(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    resetForm();
    setError(null);
  };

  const handleRefresh = () => {
    loadCategories();
  };

  return {
    // State
    categories,
    loading,
    error,
    
    // Dialog state
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isSaving,
    
    // Form state
    name,
    setName,
    description,
    setDescription,
    editMode,
    
    // Handlers
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDeleteConfirm,
    handleAddNew,
    handleCancel,
    handleRefresh
  };
};

export default useCategoryManagement;
