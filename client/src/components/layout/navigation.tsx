import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Wifi, Bell, User, LogOut, Settings, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export function Navigation() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'technician':
        return 'Technician';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'technician':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">ISP Manager</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Chat Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/chat")}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t.chat.title}</span>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplay(user.role)}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  {t.navigation.settings}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.auth.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
