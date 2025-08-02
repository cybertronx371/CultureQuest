import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/navigation";
import { TicketForm } from "@/components/forms/ticket-form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wifi, FastForward, Receipt, HandHelping, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  const { data: tickets = [], refetch: refetchTickets } = useQuery({
    queryKey: ["/api/tickets"],
  });

  const { data: bills = [] } = useQuery({
    queryKey: ["/api/bills"],
  });

  const handlePayBill = async (billId: string) => {
    await apiRequest("POST", `/api/bills/${billId}/pay`);
    window.location.reload(); // Simple refresh for demo
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
          <p className="text-gray-600">Manage your internet service and account</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wifi className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FastForward className="h-8 w-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <p className="text-lg font-semibold text-gray-900">50 Mbps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-yellow-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding Bills</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    {bills.filter((bill: any) => bill.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HandHelping className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {tickets.filter((ticket: any) => ['open', 'in_progress'].includes(ticket.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bills.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bills found</p>
                ) : (
                  bills.slice(0, 5).map((bill: any) => (
                    <div key={bill.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{bill.period}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-900">
                          ${bill.amount}
                        </span>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                        {bill.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayBill(bill.id)}
                            className="ml-2"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* HandHelping Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>HandHelping Tickets</CardTitle>
              <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">New Ticket</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create HandHelping Ticket</DialogTitle>
                  </DialogHeader>
                  <TicketForm 
                    onSuccess={() => {
                      setIsTicketDialogOpen(false);
                      refetchTickets();
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tickets found</p>
                ) : (
                  tickets.slice(0, 5).map((ticket: any) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                            {ticket.queuePosition && (
                              <span>Queue Position: #{ticket.queuePosition}</span>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
