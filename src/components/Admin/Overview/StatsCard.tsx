
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  count: number | string;
  loading: boolean;
  description: string;
  linkTo: string;
  linkText: string;
}

const StatsCard = ({
  title,
  icon: Icon,
  count,
  loading,
  description,
  linkTo,
  linkText,
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">
          {loading ? "..." : count}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
        <Link to={linkTo} className="mt-4 inline-block">
          <Button variant="outline" size="sm">{linkText}</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
