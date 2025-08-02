import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CustomerDashboard from "@/pages/customer-dashboard";
import TechnicianDashboard from "@/pages/technician-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ChatbotPage from "@/pages/chatbot-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => <CustomerDashboard />} />
      <ProtectedRoute path="/admin" component={() => <AdminDashboard />} />
      <ProtectedRoute path="/technician" component={() => <TechnicianDashboard />} />
      <ProtectedRoute path="/chat" component={() => <ChatbotPage />} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
