import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = insertUserSchema.extend({
  packageId: z.string().min(1, "Please select a package"),
}).omit({ role: true, status: true });

type RegistrationData = z.infer<typeof registrationSchema>;

interface CustomerRegistrationProps {
  onSuccess: () => void;
}

export function CustomerRegistration({ onSuccess }: CustomerRegistrationProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const { toast } = useToast();

  const { data: packages = [] } = useQuery({
    queryKey: ["/api/packages"],
  });

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      phone: "",
      address: "",
      packageId: "",
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("POST", "/api/register-customer", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created and an installation ticket has been generated.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: RegistrationData) => {
    await registerMutation.mutateAsync(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Customer Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your full name"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter your email"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...form.register("username")}
                placeholder="Choose a username"
                className="mt-1"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Create a password"
                className="mt-1"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register("phone")}
                placeholder="Enter your phone number"
                className="mt-1"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Installation Address</Label>
              <Textarea
                id="address"
                {...form.register("address")}
                placeholder="Enter your complete address"
                className="mt-1"
                rows={3}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Package Selection */}
          <div>
            <Label className="text-lg font-medium mb-4 block">Choose Your Package</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg: any) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedPackage === pkg.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedPackage(pkg.id);
                    form.setValue("packageId", pkg.id);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <h4 className="text-xl font-medium text-gray-900 mb-2">{pkg.name}</h4>
                    <div className="text-3xl font-bold text-primary mb-2">${pkg.price}</div>
                    <div className="text-gray-600 mb-2">{pkg.speed}</div>
                    <div className="text-sm text-gray-600">{pkg.description}</div>
                    {pkg.name.includes("Standard") && (
                      <Badge className="mt-2 bg-primary text-primary-foreground">POPULAR</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {form.formState.errors.packageId && (
              <p className="text-sm text-destructive mt-2">
                {form.formState.errors.packageId.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating Account..." : "Complete Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
