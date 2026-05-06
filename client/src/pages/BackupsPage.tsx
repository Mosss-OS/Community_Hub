import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LuDownload, LuTrash2, LuPlus, LuDatabase, LuCheckCircle, LuClock, LuAlertCircle, LuXCircle } from 'react-icons/lu';
import { format, formatDistanceToNow } from "date-fns";

type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

interface Backup {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  status: BackupStatus;
  backupType: string;
  createdBy: string | null;
  startedAt: string;
  completedAt: string | null;
  organizationId: string | null;
}

async function fetchBackups(): Promise<Backup[]> {
  const response = await fetch(buildApiUrl("/api/backups"));
  if (!response.ok) throw new Error("Failed to fetch backups");
  return response.json();
}

async function createBackup(data: Partial<Backup>): Promise<Backup> {
  const response = await fetch(buildApiUrl("/api/backups"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create backup");
  return response.json();
}

async function updateBackup(id: number, updates: Partial<Backup>): Promise<Backup> {
  const response = await fetch(buildApiUrl(`/api/backups/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update backup");
  return response.json();
}

async function deleteBackup(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/backups/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete backup");
}

const statusIcons: Record<BackupStatus, any> = {
  PENDING: Clock,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
};

const statusColors: Record<BackupStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function BackupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBackup, setNewBackup] = useState({
    fileName: `backup-${new Date().toISOString().split('T')[0]}`,
    backupType: "manual",
  });

  const { data: backups, isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: fetchBackups,
    enabled: user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      setShowCreateDialog(false);
      setNewBackup({ fileName: `backup-${new Date().toISOString().split('T')[0]}`, backupType: "manual" });
      toast({ title: "Success", description: "Backup started successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create backup", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      toast({ title: "Success", description: "Backup deleted" });
    },
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup & Data Management</h1>
          <p className="text-muted-foreground">Manage database backups and exports</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Backup</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Backup</DialogTitle>
              <DialogDescription>Create a backup of your organization's data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Backup Name</Label>
                <Input
                  id="filename"
                  value={newBackup.fileName}
                  onChange={e => setNewBackup({ ...newBackup, fileName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Backup Type</Label>
                <Select value={newBackup.backupType} onValueChange={v => setNewBackup({ ...newBackup, backupType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="auto">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createMutation.mutate(newBackup)}
                disabled={createMutation.isPending || !newBackup.fileName}
                className="w-full"
              >
                {createMutation.isPending ? "Creating..." : "Start Backup"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backups</CardTitle>
          <CardDescription>View and manage your data backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading backups...</div>
          ) : backups?.length ? (
            <div className="space-y-3">
              {backups.map(backup => {
                const StatusIcon = statusIcons[backup.status] || Clock;
                return (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${statusColors[backup.status] || 'bg-gray-100'}`}>
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{backup.fileName}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" /> {backup.status}
                          </span>
                          <span>{formatFileSize(backup.fileSize)}</span>
                          <span>{format(new Date(backup.startedAt), "MMM d, yyyy HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {backup.status === 'COMPLETED' && (
                        <Button size="sm" variant="ghost" onClick={() => window.open(buildApiUrl(`/api/backups/${backup.id}/download`), '_blank')}>
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(backup.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No backups yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>Create Your First Backup</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
