import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertTicketSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ticketFormSchema = insertTicketSchema.pick({
  type: true,
  title: true,
  description: true,
  priority: true,
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSuccess: () => void;
}

export function TicketForm({ onSuccess }: TicketFormProps) {
  const { toast } = useToast();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      type: "complaint",
      title: "",
      description: "",
      priority: "normal",
    }
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest("POST", "/api/tickets", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Ticket Created",
        description: `Your support ticket has been created. Queue position: #${data.queuePosition}`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: TicketFormData) => {
    await createTicketMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="type">Ticket Type</Label>
        <Select
          onValueChange={(value) => form.setValue("type", value as any)}
          defaultValue={form.getValues("type")}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="repair">Repair Request</SelectItem>
            <SelectItem value="installation">Installation</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select
          onValueChange={(value) => form.setValue("priority", value as any)}
          defaultValue={form.getValues("priority")}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.priority && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.priority.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register("title")}
          placeholder="Brief description of the issue"
          className="mt-1"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Detailed description of the issue"
          className="mt-1"
          rows={4}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createTicketMutation.isPending}
      >
        {createTicketMutation.isPending ? "Creating Ticket..." : "Create Ticket"}
      </Button>
    </form>
  );
}
