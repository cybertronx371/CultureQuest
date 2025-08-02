import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/layout/navigation";
import { ChatbotConfigManager } from "@/components/admin/chatbot-config";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, AlertCircle, TrendingUp, WifiOff, Settings, Bot } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users?role=technician", { credentials: "include" }).then(res => res.json()),
  });

  const { data: networkNodes = [] } = useQuery({
    queryKey: ["/api/network-nodes"],
  });

  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, technicianId }: { ticketId: string; technicianId: string }) => {
      await apiRequest("POST", `/api/tickets/${ticketId}/assign`, { technicianId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
  });

  const updateNetworkNodeMutation = useMutation({
    mutationFn: async ({ nodeId, status }: { nodeId: string; status: string }) => {
      await apiRequest("PATCH", `/api/network-nodes/${nodeId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-nodes"] });
    },
  });

  const generateBillsMutation = useMutation({
    mutationFn: async () => {
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM format
      await apiRequest("POST", "/api/bills/generate", { period });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "completed":
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
      case "open":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNodeStatusIndicator = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your ISP operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="chatbot">
              <Bot className="h-4 w-4 mr-2" />
              Chatbot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.openTickets || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${stats?.monthlyRevenue || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <WifiOff className="h-8 w-8 text-red-500 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Network Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.networkIssues || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Tickets */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tickets.slice(0, 5).map((ticket: any) => (
                        <div key={ticket.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <Badge className={getStatusColor(ticket.type)}>
                              {ticket.type}
                            </Badge>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{ticket.customer?.name}</p>
                              <p className="text-sm text-gray-600">{ticket.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            {!ticket.technicianId && (
                              <Select 
                                onValueChange={(technicianId) => 
                                  assignTicketMutation.mutate({ ticketId: ticket.id, technicianId })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map((tech: any) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                      {tech.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => generateBillsMutation.mutate()}
                    disabled={generateBillsMutation.isPending}
                  >
                    Generate Monthly Bills
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Customer Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    Network Health Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket: any) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          #{ticket.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{ticket.customer?.name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.type)}>
                            {ticket.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.technician?.name || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!ticket.technicianId && (
                            <Select 
                              onValueChange={(technicianId) => 
                                assignTicketMutation.mutate({ ticketId: ticket.id, technicianId })
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Assign" />
                              </SelectTrigger>
                              <SelectContent>
                                {technicians.map((tech: any) => (
                                  <SelectItem key={tech.id} value={tech.id}>
                                    {tech.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle>FTTH Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networkNodes.map((node: any) => (
                    <div key={node.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{node.name}</h4>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${getNodeStatusIndicator(node.status)}`} />
                          <span className={`text-sm font-medium ${
                            node.status === 'online' ? 'text-green-600' :
                            node.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {node.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3 space-y-1">
                        <p>Coverage: {node.location}</p>
                        <p>Connected Customers: {node.connectedCustomers}</p>
                        <p>Last Update: {new Date(node.lastUpdated).toLocaleString()}</p>
                      </div>

                      <div className="flex space-x-2">
                        <Select 
                          defaultValue={node.status}
                          onValueChange={(status) => 
                            updateNetworkNodeMutation.mutate({ nodeId: node.id, status })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chatbot Configuration Tab */}
          <TabsContent value="chatbot">
            <ChatbotConfigManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
