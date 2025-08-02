import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/i18n';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings, Bot, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { ChatbotConfig } from '@shared/schema';

interface ChatbotConfigFormData {
  provider: string;
  apiKey: string;
  model: string;
}

export function ChatbotConfigManager() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ChatbotConfigFormData>({
    provider: '',
    apiKey: '',
    model: '',
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Fetch chatbot configurations
  const { data: configs = [], isLoading } = useQuery<ChatbotConfig[]>({
    queryKey: ['/api/admin/chatbot-configs'],
    enabled: user?.role === 'administrator',
  });

  // Create configuration
  const createConfigMutation = useMutation({
    mutationFn: async (data: ChatbotConfigFormData) => {
      const res = await apiRequest('POST', '/api/admin/chatbot-configs', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot-configs'] });
      setIsDialogOpen(false);
      setFormData({ provider: '', apiKey: '', model: '' });
      toast({
        title: 'Success',
        description: 'Chatbot configuration created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create chatbot configuration',
        variant: 'destructive',
      });
    },
  });

  // Delete configuration
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/chatbot-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot-configs'] });
      toast({
        title: 'Success',
        description: 'Configuration deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete configuration',
        variant: 'destructive',
      });
    },
  });

  // Activate configuration
  const activateConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/admin/chatbot-configs/${id}/activate`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/chatbot-configs'] });
      toast({
        title: 'Success',
        description: 'Configuration activated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to activate configuration',
        variant: 'destructive',
      });
    },
  });

  // Fetch available models when provider changes
  const fetchModels = async (provider: string) => {
    try {
      const res = await apiRequest('GET', `/api/admin/chatbot-models/${provider}`);
      const models = await res.json();
      setAvailableModels(models);
    } catch (error) {
      setAvailableModels([]);
    }
  };

  const handleProviderChange = (provider: string) => {
    setFormData(prev => ({ ...prev, provider, model: '' }));
    fetchModels(provider);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || !formData.apiKey || !formData.model) {
      return;
    }
    createConfigMutation.mutate(formData);
  };

  if (user?.role !== 'administrator') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Administrator privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chatbot Configuration</h2>
          <p className="text-gray-600">Manage AI chatbot API keys and models</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Chatbot Configuration</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">AI Provider</Label>
                <Select 
                  value={formData.provider} 
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter API key"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select 
                  value={formData.model} 
                  onValueChange={(model) => setFormData(prev => ({ ...prev, model }))}
                  disabled={!formData.provider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createConfigMutation.isPending || !formData.provider || !formData.apiKey || !formData.model}
                >
                  {createConfigMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : configs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Configurations</h3>
            <p className="text-gray-500 mb-4">
              Add your first AI provider configuration to enable the chatbot
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <Card key={config.id} className={config.isActive ? 'ring-2 ring-green-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    {config.provider}
                  </CardTitle>
                  {config.isActive && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Model</p>
                  <p className="text-sm text-gray-600">{config.model}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">API Key</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {'•'.repeat(20)}...{config.apiKey.slice(-4)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(config.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  {!config.isActive && (
                    <Button
                      size="sm"
                      onClick={() => activateConfigMutation.mutate(config.id)}
                      disabled={activateConfigMutation.isPending}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Activate
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteConfigMutation.mutate(config.id)}
                    disabled={deleteConfigMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}