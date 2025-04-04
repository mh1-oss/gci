
import { Category } from '@/data/initialData';

export interface CategoryFormState {
  name: string;
  description: string;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
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
