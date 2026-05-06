import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/lib/api-config";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuHistory, LuCheckCircle, LuXCircle, LuAlertTriangle } from "react-icons/lu";
import { format } from "date-fns";

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  details: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/admin/audit-logs"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!isSuperAdmin,
  });

  if (!isSuperAdmin) return <div className="container mx-auto py-12 text-center">Super Admin access required</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <History className="text-primary" />
        Audit Logs
      </h1>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {logs?.map((log: AuditLog) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {log.action.includes("delete") ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : log.action.includes("create") ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      {log.action} {log.entity}
                    </CardTitle>
                    <CardDescription>
                      Entity ID: {log.entityId} • User: {log.userId}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{log.entity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(log.createdAt), "PPpp")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
