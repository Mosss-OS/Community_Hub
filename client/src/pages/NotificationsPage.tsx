import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LuBell, LuTrash2, LuCircleCheck, LuTriangleAlert, LuCircleAlert, LuMessageSquare, LuUser, LuFileText } from 'react-icons/lu';
import { format, formatDistanceToNow } from "date-fns";

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'TASK_ASSIGNED' | 'EVENT_REMINDER' | 'DONATION_RECEIVED' | 'PRAYER_REQUEST' | 'NEW_MESSAGE' | 'MENTION';

interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  organizationId: string | null;
}

interface NotificationTemplate {
  id: number;
  name: string;
  type: NotificationType;
  subject: string | null;
  bodyTemplate: string;
  channels: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchNotifications(unreadOnly?: boolean): Promise<Notification[]> {
  const url = unreadOnly ? `${buildApiUrl("/api/notifications")}?unread=true` : buildApiUrl("/api/notifications");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

async function fetchTemplates(): Promise<NotificationTemplate[]> {
  const response = await fetch(buildApiUrl("/api/notifications/templates"));
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

async function markAsRead(id: number): Promise<Notification> {
  const response = await fetch(buildApiUrl(`/api/notifications/${id}/read`), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to mark as read");
  return response.json();
}

async function markAllAsRead(): Promise<void> {
  const response = await fetch(buildApiUrl("/api/notifications/read-all"), {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to mark all as read");
  return response.json();
}

async function deleteNotification(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/notifications/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete notification");
}

async function createTemplate(data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
  const response = await fetch(buildApiUrl("/api/notifications/templates"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create template");
  return response.json();
}

const typeIcons: Record<NotificationType, any> = {
  INFO: LuBell,
  SUCCESS: LuCircleCheck,
  WARNING: LuTriangleAlert,
  ERROR: LuCircleAlert,
  TASK_ASSIGNED: LuCircleCheck,
  EVENT_REMINDER: LuBell,
  DONATION_RECEIVED: LuCircleCheck,
  PRAYER_REQUEST: LuMessageSquare,
  NEW_MESSAGE: LuMessageSquare,
  MENTION: LuUser,
};

const typeColors: Record<NotificationType, string> = {
  INFO: "bg-blue-100 text-blue-800",
  SUCCESS: "bg-green-100 text-green-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  ERROR: "bg-red-100 text-red-800",
  TASK_ASSIGNED: "bg-green-100 text-green-800",
  EVENT_REMINDER: "bg-blue-100 text-blue-800",
  DONATION_RECEIVED: "bg-green-100 text-green-800",
  PRAYER_REQUEST: "bg-purple-100 text-purple-800",
  NEW_MESSAGE: "bg-blue-100 text-blue-800",
  MENTION: "bg-orange-100 text-orange-800",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "INFO" as NotificationType,
    subject: "",
    bodyTemplate: "",
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", showUnreadOnly],
    queryFn: () => fetchNotifications(showUnreadOnly || undefined),
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: fetchTemplates,
    enabled: user?.isAdmin,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "Success", description: "All notifications marked as read" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      setShowTemplateDialog(false);
      setNewTemplate({ name: "", type: "INFO", subject: "", bodyTemplate: "" });
      toast({ title: "Success", description: "Template created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create template", variant: "destructive" });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => markAllAsReadMutation.mutate()} disabled={markAllAsReadMutation.isPending}>
              <Check className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
          )}
          {user?.isAdmin && (
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline"><LuFileText className="mr-2 h-4 w-4" /> Templates</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Notification Template</DialogTitle>
                  <DialogDescription>Create a reusable notification template</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input id="name" value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="e.g., Welcome Message" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newTemplate.type} onValueChange={v => setNewTemplate({ ...newTemplate, type: v as NotificationType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="SUCCESS">Success</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="TASK_ASSIGNED">Task Assigned</SelectItem>
                        <SelectItem value="EVENT_REMINDER">Event Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={newTemplate.subject} onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })} placeholder="Notification subject" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Message Template</Label>
                    <Textarea id="body" value={newTemplate.bodyTemplate} onChange={e => setNewTemplate({ ...newTemplate, bodyTemplate: e.target.value })} placeholder="Use {{variable}} for dynamic content" />
                  </div>
                  <Button onClick={() => createTemplateMutation.mutate(newTemplate)} disabled={createTemplateMutation.isPending || !newTemplate.name} className="w-full">
                    {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant={showUnreadOnly ? "default" : "outline"} onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
            <Filter className="mr-2 h-4 w-4" /> {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading notifications...</div>
      ) : notifications?.length ? (
        <div className="space-y-3">
          {notifications.map(notification => {
            const Icon = typeIcons[notification.type] || Info;
            return (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${!notification.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsReadMutation.mutate(notification.id);
                  }
                  setSelectedNotification(notification);
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[notification.type] || 'bg-gray-100'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${!notification.isRead ? 'text-primary' : ''}`}>{notification.title}</h4>
                        {!notification.isRead && <Badge variant="default" className="text-xs">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      )}

      {/* Templates List (Admin) */}
      {user?.isAdmin && templates && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Templates</CardTitle>
            <CardDescription>Manage your notification templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.type}</p>
                  </div>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
