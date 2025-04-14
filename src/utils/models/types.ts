
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock_quantity: number; // Changed from 'stock' to 'stock_quantity'
  created_at?: string;
  categoryId: string;
  image: string;
  featured: boolean;
  colors: string[]; 
  specifications?: Record<string, string>;
  mediaGallery?: {
    url: string;
    type: 'image' | 'video';
  }[];
}
