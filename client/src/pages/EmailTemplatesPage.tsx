import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LuMail, LuPlus, LuTrash2, LuEdit, LuSend } from 'react-icons/lu';
import { format } from "date-fns";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  bodyTemplate: string;
  emailType: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchTemplates(): Promise<EmailTemplate[]> {
  const response = await fetch(buildApiUrl("/api/email-templates"));
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

async function createTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const response = await fetch(buildApiUrl("/api/email-templates"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create template");
  return response.json();
}

async function updateTemplate(id: number, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const response = await fetch(buildApiUrl(`/api/email-templates/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update template");
  return response.json();
}

async function deleteTemplate(id: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/api/email-templates/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete template");
}

const templateTypes = [
  { value: "WELCOME", label: "Welcome Email" },
  { value: "PRAYER_REQUEST", label: "Prayer Request" },
  { value: "EVENT_REMINDER", label: "Event Reminder" },
  { value: "DONATION_THANK_YOU", label: "Donation Thank You" },
  { value: "TASK_ASSIGNED", label: "Task Assigned" },
  { value: "PASSWORD_RESET", label: "Password Reset" },
  { value: "MEMBER_VERIFICATION", label: "Member Verification" },
  { value: "CUSTOM", label: "Custom" },
];

export default function EmailTemplatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    bodyTemplate: "",
    emailType: "CUSTOM",
    variables: [] as string[],
    isActive: true,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: fetchTemplates,
    enabled: user?.isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      setShowCreateDialog(false);
      setNewTemplate({ name: "", subject: "", bodyTemplate: "", emailType: "CUSTOM", variables: [], isActive: true });
      toast({ title: "Success", description: "Template created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create template", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateTemplate(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast({ title: "Success", description: "Template deleted" });
    },
  });

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
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage email templates for notifications</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>Create a reusable email template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Welcome New Members"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Email Type</Label>
                <Select value={newTemplate.emailType} onValueChange={v => setNewTemplate({ ...newTemplate, emailType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {templateTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject}
                  onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="Welcome to {{church_name}}!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Email Body (HTML)</Label>
                <Textarea
                  id="body"
                  value={newTemplate.bodyTemplate}
                  onChange={e => setNewTemplate({ ...newTemplate, bodyTemplate: e.target.value })}
                  placeholder="<h1>Welcome {{first_name}}!</h1><p>We're glad you're here.</p>"
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {["{{first_name}}", "{{last_name}}", "{{church_name}}", "{{date}}"].map(variable => (
                    <Badge key={variable} variant="outline" className="cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(variable);
                        toast({ title: "Copied!", description: `${variable} copied to clipboard` });
                      }}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate(newTemplate)}
                disabled={createMutation.isPending || !newTemplate.name || !newTemplate.subject}
                className="w-full"
              >
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading templates...</div>
      ) : templates?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </div>
                  <Badge className={template.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.emailType}</Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPreview(template)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActiveMutation.mutate({
                        id: template.id,
                        isActive: !template.isActive
                      })}
                    >
                      {template.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(template.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No email templates yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>Create Your First Template</Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showPreview?.name}</DialogTitle>
            <DialogDescription>Subject: {showPreview?.subject}</DialogDescription>
          </DialogHeader>
          {showPreview && (
            <div className="py-4">
              <div className="border rounded p-6 bg-white">
                <div className="border-b pb-4 mb-4">
                  <p className="text-sm text-muted-foreground">Subject: {showPreview.subject}</p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: showPreview.bodyTemplate || "<p>No content</p>" }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
