import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/navigation";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wrench, Clock, CheckCircle, MapPin, Phone, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const { data: tickets = [], refetch } = useQuery({
    queryKey: ["/api/tickets"],
  });

  const handleStartTask = async (ticketId: string) => {
    await apiRequest("PATCH", `/api/tickets/${ticketId}`, {
      status: 'in_progress'
    });
    refetch();
  };

  const handleCompleteTask = async (ticketId: string) => {
    await apiRequest("PATCH", `/api/tickets/${ticketId}`, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    refetch();
    setSelectedTicket(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "installation":
        return <Wrench className="h-5 w-5" />;
      case "repair":
        return <Wrench className="h-5 w-5" />;
      default:
        return <Wrench className="h-5 w-5" />;
    }
  };

  const pendingTasks = tickets.filter((t: any) => t.status === 'open');
  const inProgressTasks = tickets.filter((t: any) => t.status === 'in_progress');
  const completedToday = tickets.filter((t: any) => 
    t.status === 'completed' && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Technician Portal</h1>
          <p className="text-gray-600">Manage your assigned tasks and workload</p>
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks assigned</p>
              ) : (
                tickets.map((ticket: any) => (
                  <div key={ticket.id} className={`border rounded-lg p-4 ${
                    ticket.status === 'in_progress' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Badge className={getStatusColor(ticket.type)}>
                            {getTypeIcon(ticket.type)}
                            <span className="ml-1">{ticket.type}</span>
                          </Badge>
                          {ticket.priority === 'high' && (
                            <Badge variant="destructive" className="ml-2">High Priority</Badge>
                          )}
                        </div>

                        <h4 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Customer</p>
                            <p className="text-sm text-gray-900">{ticket.customer?.name}</p>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Phone className="h-4 w-4 mr-1" />
                              {ticket.customer?.phone}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-600">Address</p>
                            <div className="flex items-start text-sm text-gray-900">
                              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                              {ticket.customer?.address}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span className="mx-3">•</span>
                          <span>Ticket #{ticket.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        
                        {ticket.status === 'open' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartTask(ticket.id)}
                            className="whitespace-nowrap"
                          >
                            Start Task
                          </Button>
                        )}

                        {ticket.status === 'in_progress' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedTicket(ticket)}
                                className="whitespace-nowrap"
                              >
                                Upload Photos
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Upload Completion Photos</DialogTitle>
                              </DialogHeader>
                              <PhotoUpload 
                                ticketId={ticket.id}
                                onSuccess={() => handleCompleteTask(ticket.id)}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
