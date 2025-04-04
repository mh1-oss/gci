
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, FolderTree, Settings, RefreshCw } from "lucide-react";

interface QuickActionsProps {
  onRefresh: () => void;
}

const QuickActions = ({ onRefresh }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you may want to perform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link to="/admin/products/add" className="block">
          <Button variant="outline" className="w-full justify-start">
            <Package className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
        <Link to="/admin/categories/add" className="block">
          <Button variant="outline" className="w-full justify-start">
            <FolderTree className="mr-2 h-4 w-4" />
            Add New Category
          </Button>
        </Link>
        <Link to="/admin/settings" className="block">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Update Settings
          </Button>
        </Link>
        <Button variant="outline" className="w-full justify-start" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
