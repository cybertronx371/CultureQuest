import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/i18n';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Plus, Trash2, Bot, User } from 'lucide-react';
import type { ChatConversation, ChatMessage } from '@shared/schema';

interface ConversationWithMessages extends ChatConversation {
  messages: ChatMessage[];
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<ChatConversation[]>({
    queryKey: ['/api/chat/conversations'],
  });

  // Fetch selected conversation with messages
  const { data: currentConversation, isLoading: isLoadingConversation } = useQuery<ConversationWithMessages>({
    queryKey: ['/api/chat/conversations', selectedConversation],
    enabled: !!selectedConversation,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest('POST', '/api/chat/conversations', { title });
      return await res.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setSelectedConversation(newConversation.id);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const res = await apiRequest('POST', `/api/chat/conversations/${conversationId}/messages`, { content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations', selectedConversation] });
      setMessageInput('');
    },
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest('DELETE', `/api/chat/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      if (selectedConversation && conversations.length > 1) {
        const remainingConversations = conversations.filter(c => c.id !== selectedConversation);
        setSelectedConversation(remainingConversations[0]?.id || null);
      } else {
        setSelectedConversation(null);
      }
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput.trim(),
    });
  };

  const handleNewChat = () => {
    createConversationMutation.mutate('New Chat');
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button 
            onClick={handleNewChat}
            className="w-full"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.chat?.newChat || 'New Chat'}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer mb-2 group relative ${
                  selectedConversation === conversation.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <MessageCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentConversation.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t.chat?.ispSupport || 'ISP Customer Support Assistant'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation.messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t.chat?.welcomeMessage || 'Welcome! How can I help you today?'}</p>
                  </div>
                ) : (
                  currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex space-x-3 max-w-2xl ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.chat?.typeMessage || 'Type your message...'}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t.chat?.noChatSelected || 'No chat selected'}
              </h3>
              <p className="text-gray-500 mb-4">
                {t.chat?.selectOrCreateChat || 'Select a conversation or create a new one to get started'}
              </p>
              <Button onClick={handleNewChat} disabled={createConversationMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {t.chat?.startNewChat || 'Start New Chat'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}