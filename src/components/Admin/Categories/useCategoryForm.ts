
import { useState } from 'react';
import { Category } from '@/data/initialData';
import { CategoryFormState } from './types';

export const useCategoryForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const setFormData = (category: Category | null) => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    } else {
      resetForm();
    }
  };

  const getFormData = (): CategoryFormState => ({
    name,
    description
  });

  return {
    name,
    setName,
    description,
    setDescription,
    resetForm,
    setFormData,
    getFormData
  };
};
