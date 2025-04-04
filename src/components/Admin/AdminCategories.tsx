
import React from 'react';
import { Card } from '@/components/ui/card';
import { Category } from '@/data/initialData';
import CategoryHeader from './Categories/CategoryHeader';
import CategoryContent from './Categories/CategoryContent';
import CategoryForm from './Categories/CategoryForm';
import DeleteCategoryDialog from './Categories/DeleteCategoryDialog';
import ErrorAlert from './Categories/ErrorAlert';
import useCategoryManagement from './Categories/useCategoryManagement';

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
      <ErrorAlert error={error} />

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
