
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SystemInfoProps {
  currency: string;
  exchangeRate: number;
}

const SystemInfo = ({ currency, exchangeRate }: SystemInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Information</CardTitle>
        <CardDescription>Current system status</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Currency:</dt>
            <dd>{currency}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Exchange Rate:</dt>
            <dd>1 USD = {exchangeRate} IQD</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Last Update:</dt>
            <dd>{new Date().toLocaleDateString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Admin User:</dt>
            <dd>Admin</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default SystemInfo;
