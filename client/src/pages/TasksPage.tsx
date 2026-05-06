import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  LuPlus as Plus,
  LuCircleCheck as CheckCircle,
  LuClock,
  LuTriangleAlert,
  LuCircleX as XCircle,
  LuUser as User,
  LuCalendar as Calendar,
} from "react-icons/lu";
import { format } from "date-fns";

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  leaderId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string | null;
}

interface Task {
  id: number;
  projectId: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  createdBy: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string | null;
}

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(buildApiUrl("/api/projects"));
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

async function fetchTasks(filters?: { status?: string; assignedTo?: string }): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
  const response = await fetch(`${buildApiUrl("/api/tasks")}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
}

async function createProject(data: Partial<Project>): Promise<Project> {
  const response = await fetch(buildApiUrl("/api/projects"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
}

async function createTask(data: Partial<Task>): Promise<Task> {
  const response = await fetch(buildApiUrl("/api/tasks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
}

async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const response = await fetch(buildApiUrl(`/api/tasks/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
}

const statusIcons: Record<TaskStatus, any> = {
  TODO: LuClock,
  IN_PROGRESS: LuTriangleAlert,
  IN_REVIEW: LuClock,
  DONE: CheckCircle,
  CANCELED: XCircle,
};

const statusColors: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus | "ALL">("ALL");

  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    projectId: null as number | null,
    dueDate: "",
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", activeTab],
    queryFn: () => fetchTasks(activeTab !== "ALL" ? { status: activeTab } : undefined),
  });

  const { data: myTasks, isLoading: myTasksLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => fetchTasks({ assignedTo: user?.id }),
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowProjectDialog(false);
      setNewProject({ title: "", description: "" });
      toast({ title: "Success", description: "Project created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowTaskDialog(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", projectId: null, dueDate: "" });
      toast({ title: "Success", description: "Task created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Task> }) => updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Success", description: "Task updated!" });
    },
  });

  const filteredTasks = tasks?.filter(t => !selectedProject || t.projectId === selectedProject);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks & Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track tasks</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Create a new project to organize tasks</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Title</Label>
                  <Input id="project-title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} placeholder="Project title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-desc">Description</Label>
                  <Textarea id="project-desc" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Project description" />
                </div>
                <Button onClick={() => createProjectMutation.mutate(newProject)} disabled={createProjectMutation.isPending || !newProject.title} className="w-full">
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to a project</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input id="task-title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-desc">Description</Label>
                  <Textarea id="task-desc" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Task description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v as TaskPriority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="datetime-local" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                </div>
                <Button onClick={() => createTaskMutation.mutate(newTask)} disabled={createTaskMutation.isPending || !newTask.title} className="w-full">
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TaskStatus | "ALL")}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="TODO">To Do</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="IN_REVIEW">In Review</TabsTrigger>
          <TabsTrigger value="DONE">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Projects Sidebar */}
        <div className="space-y-2">
          <h3 className="font-semibold mb-2">Projects</h3>
          {projectsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className={`p-3 border rounded cursor-pointer ${!selectedProject ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => setSelectedProject(null)}
              >
                <p className="font-medium">All Tasks</p>
              </div>
              {projects?.map(project => (
                <div
                  key={project.id}
                  className={`p-3 border rounded cursor-pointer ${selectedProject === project.id ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <p className="font-medium">{project.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="md:col-span-3 space-y-3">
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTasks?.length ? (
            filteredTasks.map(task => {
              const StatusIcon = statusIcons[task.status];
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className="h-4 w-4" />
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge className={statusColors[task.status]}>{task.status}</Badge>
                          <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.assignedTo && (
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Assigned</span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(task.dueDate), "MMM d")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {task.status !== "DONE" && (
                          <Button size="sm" variant="ghost" onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { status: "DONE", completedAt: new Date().toISOString() } })}>
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No tasks found. Create a new task to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
