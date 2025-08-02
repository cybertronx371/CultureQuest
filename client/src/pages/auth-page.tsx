import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerRegistration } from "@/components/forms/customer-registration";
import { Wifi, Shield, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" }
  });

  // Redirect if already authenticated
  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' 
                       : user.role === 'technician' ? '/technician' 
                       : '/';
    setLocation(redirectPath);
    return null;
  }

  const handleLogin = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Wifi className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">ISP Manager</h1>
            <p className="text-gray-600 mt-2">Comprehensive internet service management</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign in to your account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username or Email</Label>
                      <Input
                        id="username"
                        {...loginForm.register("username")}
                        placeholder="Enter your username or email"
                        className="mt-1"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        placeholder="Enter your password"
                        className="mt-1"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <CustomerRegistration onSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Modern ISP Management
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Streamline your internet service operations with comprehensive customer management, 
            technician dispatch, and network monitoring tools.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Customer Portal</h3>
                <p className="text-gray-600">Self-service billing and support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Field Management</h3>
                <p className="text-gray-600">GPS-tracked technician workflows</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Wifi className="h-8 w-8 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Network Monitoring</h3>
                <p className="text-gray-600">Real-time infrastructure status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
