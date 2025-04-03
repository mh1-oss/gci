import React from 'react';
import { Sale } from '@/utils/models';
import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowRight, FileText, Plus, Printer, Search, Trash } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { fetchProducts } from "@/services/products/productService";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { printReceipt } from "@/services/receipt/receiptService";
import { createSaleFromCart, deleteSale } from '@/services/sales/salesService';
import { mapDbSaleToSale } from '@/utils/models/salesMappers';
import { Product } from "@/data/initialData";

const SalesList = () => {
  // ... keep existing code for SalesList component
};

const SaleDetails = () => {
  // ... keep existing code for SaleDetails component
};

const NewSale = () => {
  // ... keep existing code for NewSale component
};

const AdminSales = () => {
  return (
    <Routes>
      <Route index element={<SalesList />} />
      <Route path="new" element={<NewSale />} />
      <Route path=":id" element={<SaleDetails />} />
    </Routes>
  );
};

export default AdminSales;
