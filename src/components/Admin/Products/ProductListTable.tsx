
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Product, Category } from '@/data/initialData';

interface ProductListTableProps {
  products: Product[];
  categories: Category[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const ProductListTable: React.FC<ProductListTableProps> = ({
  products,
  categories,
  onEditProduct,
  onDeleteProduct
}) => {
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير مصنف';
  };
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الصورة</TableHead>
            <TableHead>اسم المنتج</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-12 h-12 object-contain rounded border"
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{getCategoryName(product.categoryId)}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEditProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductListTable;
