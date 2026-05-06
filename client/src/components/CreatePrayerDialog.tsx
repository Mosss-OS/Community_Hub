import { useState } from "react";
import { useForm } from "react-hook-form";
// @ts-ignore
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePrayerRequest } from "@/hooks/use-prayer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LuPenTool } from 'react-icons/lu';

// Client-side prayer request schema
const insertPrayerRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  authorName: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false),
  userId: z.number().optional(),
});

// Extension of the schema to require content
const formSchema = insertPrayerRequestSchema.extend({
  content: z.string().min(10, "Please share a bit more detail (min 10 characters)."),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePrayerDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: createRequest, isPending } = useCreatePrayerRequest();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      authorName: user?.firstName || "",
      isAnonymous: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    // If authenticated, we link the user ID on the backend via session
    // but we can also pass it explicitly if needed, though schema handles it.
    
    // Convert user.id to string to match the expected type
    const payload = {
      ...data,
      content: data.content || "",
      userId: user?.id ? String(user.id) : undefined,
    } as any;

    createRequest(payload, {
      onSuccess: () => {
        toast({
          title: "Request Shared",
          description: "Our community will be praying for you.",
        });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <PenTool size={16} />
          Share Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Prayer Request</DialogTitle>
          <DialogDescription>
            Let our community know how we can pray for you today.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I'm asking for prayer regarding..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Post Anonymously</FormLabel>
                    <FormDescription>
                      Your name will not be displayed on the prayer wall.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sharing..." : "Share Request"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
