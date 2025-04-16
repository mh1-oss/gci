
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, RefreshCw, UserX } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database } from "@/integrations/supabase/types";

// Define the app_role type based on the database schema
type AppRole = Database["public"]["Enums"]["app_role"];

const AdminUserRoles = () => {
  const { usersWithRoles, loading, error, fetchUsersWithRoles, removeRole } = useUserRoles();

  const handleRefresh = () => {
    fetchUsersWithRoles();
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    if (window.confirm(`هل أنت متأكد من إزالة دور '${role}' من هذا المستخدم؟`)) {
      await removeRole(userId, role);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إدارة أدوار المستخدمين</CardTitle>
          <CardDescription>تحميل البيانات...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>إدارة أدوار المستخدمين</CardTitle>
          <CardDescription>عرض وإدارة أدوار المستخدمين في النظام</CardDescription>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {usersWithRoles.length === 0 && !error ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
            <UserPlus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">لا توجد أدوار مستخدمين حالياً</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>معرف المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersWithRoles.map((userRole, index) => (
                <TableRow key={`${userRole.user_id}-${userRole.role}-${index}`}>
                  <TableCell className="font-mono text-xs">{userRole.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={userRole.role === 'admin' ? "default" : "secondary"}>
                      {userRole.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(userRole.user_id, userRole.role)}
                    >
                      <UserX className="h-4 w-4 ml-1" />
                      إزالة
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserRoles;
