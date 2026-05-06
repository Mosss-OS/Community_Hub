import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { LuUsers, LuShield, LuCheck, LuX } from "react-icons/lu";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isAdmin: boolean;
  isVerified: boolean;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/users"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!isSuperAdmin,
  });

  if (!isSuperAdmin) return <div className="container mx-auto py-12 text-center">Super Admin access required</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="text-primary" />
        User Management
      </h1>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {users?.map((u: User) => (
            <Card key={u.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{u.firstName} {u.lastName}</CardTitle>
                    <CardDescription>{u.email}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {u.isVerified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                    {u.isAdmin && <Badge>Admin</Badge>}
                    {u.isSuperAdmin && <Badge variant="destructive">Super Admin</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {u.role}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
