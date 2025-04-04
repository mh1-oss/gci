
import React from 'react';
import { Card } from '@/components/ui/card';
import CategoryHeader from './CategoryHeader';
import CategoryContent from './CategoryContent';
import CategoryForm from './CategoryForm';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import ErrorAlert from './ErrorAlert';
import useCategoryManagement from './useCategoryManagement';

const AdminCategories = () => {
  const {
    categories,
    loading,
    dialogOpen,
    setDialogOpen,
    editMode,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isSaving,
    name,
    setName,
    description,
    setDescription,
    error,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDeleteConfirm,
    handleAddNew,
    handleCancel,
    handleRefresh
  } = useCategoryManagement();

  return (
    <div>
      {error && <ErrorAlert error={error} />}

      <Card>
        <CategoryHeader onAddNew={handleAddNew} onRefresh={handleRefresh} />
        <CategoryContent 
          categories={categories} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </Card>

      <CategoryForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        editMode={editMode}
        isSaving={isSaving}
        onSave={editMode ? handleUpdate : handleCreate}
        onCancel={handleCancel}
      />

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminCategories;
