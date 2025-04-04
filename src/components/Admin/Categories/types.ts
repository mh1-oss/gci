
import { Category } from '@/data/initialData';
import { Dispatch, SetStateAction } from 'react';

export interface CategoryFormState {
  name: string;
  description: string;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface CategoryStateWithSetters extends CategoryState {
  setCategories: Dispatch<SetStateAction<Category[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export interface CategoryTargetState {
  editTarget: Category | null;
  deleteTarget: Category | null;
  editMode: boolean;
}

export interface CategoryDialogState {
  dialogOpen: boolean;
  deleteDialogOpen: boolean;
  isDeleting: boolean;
  isSaving: boolean;
}
