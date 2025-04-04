
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  onRefresh: () => void;
}

const ErrorDisplay = ({ error, onRefresh }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
        </div>
        <Button 
          onClick={onRefresh}
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
