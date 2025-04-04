
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorDisplayProps {
  error: string | null;
  onRefresh: () => void;
}

const ErrorDisplay = ({ error, onRefresh }: ErrorDisplayProps) => {
  if (!error) return null;
  
  // Check for the specific infinite recursion error
  const isInfiniteRecursionError = 
    error.includes("infinite recursion") && 
    error.includes("policy") && 
    error.includes("user_roles");

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-bold">Error Loading Data</h3>
          </div>
          
          {isInfiniteRecursionError ? (
            <div>
              <p className="mb-2">There is a permissions issue with the database policy configuration.</p>
              <p className="mb-2">This is likely caused by a recursive policy on the user_roles table that needs to be fixed.</p>
              <p className="text-sm bg-amber-50 p-2 border border-amber-200 rounded">
                <strong>Technical details:</strong> {error}
              </p>
            </div>
          ) : (
            <p>{error}</p>
          )}
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
      
      {isInfiniteRecursionError && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="font-medium mb-2">Recommended solution:</p>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            <li>A database administrator needs to update the RLS policies on the user_roles table.</li>
            <li>The policy should be rewritten using a security definer function instead of a direct query.</li>
            <li>This will prevent the recursive loop that's causing this error.</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
