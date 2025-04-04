
import React from "react";
import { Package, FolderTree, DollarSign } from "lucide-react";
import StatsCard from "./StatsCard";

interface StatsCardGridProps {
  productCount: number;
  categoryCount: number;
  loading: boolean;
  exchangeRate: number;
}

const StatsCardGrid = ({ 
  productCount, 
  categoryCount, 
  loading, 
  exchangeRate 
}: StatsCardGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Products"
        icon={Package}
        count={productCount}
        loading={loading}
        description="Total products in catalog"
        linkTo="/admin/products"
        linkText="Manage Products"
      />
      
      <StatsCard
        title="Categories"
        icon={FolderTree}
        count={categoryCount}
        loading={loading}
        description="Product categories"
        linkTo="/admin/categories"
        linkText="Manage Categories"
      />
      
      <StatsCard
        title="Exchange Rate"
        icon={DollarSign}
        count={`${exchangeRate} IQD`}
        loading={false}
        description={`Current rate: 1 USD = ${exchangeRate} IQD`}
        linkTo="/admin/settings"
        linkText="Update Rate"
      />
    </div>
  );
};

export default StatsCardGrid;
