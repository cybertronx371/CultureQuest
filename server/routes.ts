import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { chatbotService } from "./chatbot-service";
import { 
  insertTicketSchema, insertPackageSchema, insertNetworkNodeSchema,
  insertChatbotConfigSchema, insertChatConversationSchema, insertChatMessageSchema
} from "@shared/schema";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user!.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Package routes
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post("/api/packages", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const packageData = insertPackageSchema.parse(req.body);
      const newPackage = await storage.createPackage(packageData);
      res.status(201).json(newPackage);
    } catch (error) {
      res.status(400).json({ message: "Invalid package data" });
    }
  });

  // Customer registration with package selection
  app.post("/api/register-customer", async (req, res) => {
    try {
      const { packageId, ...userData } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user account
      const user = await storage.createUser({
        ...userData,
        role: 'customer',
        status: 'pending'
      });

      // Create customer package association
      await storage.createCustomerPackage({
        customerId: user.id,
        packageId,
        status: 'pending'
      });

      // Create installation ticket
      await storage.createTicket({
        customerId: user.id,
        type: 'installation',
        title: 'New Customer Installation',
        description: `Installation request for ${userData.name} at ${userData.address}`,
        status: 'open',
        priority: 'normal'
      });

      res.status(201).json({ message: "Registration successful, installation ticket created" });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Ticket routes
  app.get("/api/tickets", requireAuth, async (req, res) => {
    try {
      let tickets;
      
      if (req.user!.role === 'customer') {
        tickets = await storage.getTicketsByCustomer(req.user!.id);
      } else if (req.user!.role === 'technician') {
        tickets = await storage.getTicketsByTechnician(req.user!.id);
      } else {
        tickets = await storage.getTickets();
      }
      
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", requireAuth, requireRole(['customer']), async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        customerId: req.user!.id
      });
      
      const ticket = await storage.createTicket(ticketData);
      const queuePosition = await storage.getQueuePosition(ticket.id);
      
      // Broadcast notification to admins
      broadcastToRole('admin', {
        type: 'new_ticket',
        message: `New ${ticket.type} ticket created by ${req.user!.name}`,
        ticketId: ticket.id
      });

      res.status(201).json({ ...ticket, queuePosition });
    } catch (error) {
      res.status(400).json({ message: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const ticket = await storage.updateTicket(id, updates);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Broadcast status update to customer
      if (ticket.customerId) {
        broadcastToUser(ticket.customerId, {
          type: 'ticket_update',
          message: `Ticket ${ticket.title} status updated to ${ticket.status}`,
          ticketId: ticket.id
        });
      }

      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Failed to update ticket" });
    }
  });

  app.post("/api/tickets/:id/assign", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { technicianId } = req.body;

      await storage.assignTicket(id, technicianId);
      
      // Notify technician
      broadcastToUser(technicianId, {
        type: 'ticket_assigned',
        message: 'A new ticket has been assigned to you',
        ticketId: id
      });

      res.json({ message: "Ticket assigned successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to assign ticket" });
    }
  });

  // Photo upload with GPS coordinates
  app.post("/api/tickets/:id/photos", requireAuth, requireRole(['technician']), upload.array('photos', 5), async (req, res) => {
    try {
      const { id } = req.params;
      const { gpsCoordinates } = req.body;
      
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No photos uploaded" });
      }

      const photos = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        gpsCoordinates: JSON.parse(gpsCoordinates),
        timestamp: new Date().toISOString()
      }));

      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const existingPhotos = ticket.proofPhotos as any[] || [];
      const updatedPhotos = [...existingPhotos, ...photos];

      await storage.updateTicket(id, { proofPhotos: updatedPhotos });
      
      res.json({ message: "Photos uploaded successfully", photos });
    } catch (error) {
      res.status(400).json({ message: "Failed to upload photos" });
    }
  });

  // Bill routes
  app.get("/api/bills", requireAuth, requireRole(['customer']), async (req, res) => {
    try {
      const bills = await storage.getBillsByCustomer(req.user!.id);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills/:id/pay", requireAuth, requireRole(['customer']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markBillAsPaid(id);
      res.json({ message: "Bill marked as paid" });
    } catch (error) {
      res.status(400).json({ message: "Failed to process payment" });
    }
  });

  app.post("/api/bills/generate", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { period } = req.body;
      await storage.generateMonthlyBills(period);
      res.json({ message: "Bills generated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to generate bills" });
    }
  });

  // User management routes
  app.get("/api/users", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { role } = req.query;
      let users;
      
      if (role) {
        users = await storage.getUsersByRole(role as string);
      } else {
        users = await storage.getUsersByRole('customer');
      }
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Network monitoring routes
  app.get("/api/network-nodes", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const nodes = await storage.getNetworkNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch network nodes" });
    }
  });

  app.patch("/api/network-nodes/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const node = await storage.updateNetworkNode(id, updates);
      if (!node) {
        return res.status(404).json({ message: "Network node not found" });
      }
      
      res.json(node);
    } catch (error) {
      res.status(400).json({ message: "Failed to update network node" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const customers = await storage.getUsersByRole('customer');
      const allTickets = await storage.getTickets();
      const openTickets = allTickets.filter(t => ['open', 'in_progress'].includes(t.status));
      
      res.json({
        totalCustomers: customers.length,
        openTickets: openTickets.length,
        monthlyRevenue: 0, // This would be calculated from bills
        networkIssues: 0 // This would be calculated from network nodes
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket[]>();

  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          
          if (!clients.has(userId!)) {
            clients.set(userId!, []);
          }
          clients.get(userId!)!.push(ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        const userClients = clients.get(userId) || [];
        const index = userClients.indexOf(ws);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          clients.delete(userId);
        }
      }
    });
  });

  function broadcastToUser(userId: string, message: any) {
    const userClients = clients.get(userId) || [];
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  function broadcastToRole(role: string, message: any) {
    // This would require storing user roles in the WebSocket connection
    // For simplicity, we'll broadcast to all admin users
    clients.forEach((clientList, userId) => {
      clientList.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    });
  }

  // ============ CHATBOT ADMIN ROUTES (Admin only) ============
  // Get all chatbot configurations
  app.get("/api/admin/chatbot-configs", requireAuth, requireRole(['administrator']), async (req, res) => {
    try {
      const configs = await storage.getChatbotConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chatbot configurations" });
    }
  });

  // Create new chatbot configuration
  app.post("/api/admin/chatbot-configs", requireAuth, requireRole(['administrator']), async (req, res) => {
    try {
      const validatedData = insertChatbotConfigSchema.parse(req.body);
      const config = await storage.createChatbotConfig(validatedData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chatbot configuration" });
    }
  });

  // Update chatbot configuration
  app.patch("/api/admin/chatbot-configs/:id", requireAuth, requireRole(['administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const config = await storage.updateChatbotConfig(id, updates);
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to update chatbot configuration" });
    }
  });

  // Delete chatbot configuration
  app.delete("/api/admin/chatbot-configs/:id", requireAuth, requireRole(['administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteChatbotConfig(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chatbot configuration" });
    }
  });

  // Activate specific chatbot configuration
  app.post("/api/admin/chatbot-configs/:id/activate", requireAuth, requireRole(['administrator']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.activateChatbotConfig(id);
      res.json({ message: "Configuration activated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate chatbot configuration" });
    }
  });

  // Get available models for a provider
  app.get("/api/admin/chatbot-models/:provider", requireAuth, requireRole(['administrator']), async (req, res) => {
    try {
      const { provider } = req.params;
      const models = chatbotService.getAvailableModels(provider);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  // ============ CHATBOT USER ROUTES ============
  // Get user's conversations
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.user!.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create new conversation
  app.post("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const conversationData = insertChatConversationSchema.parse({
        userId: req.user!.id,
        title: req.body.title || "New Chat"
      });
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Get conversation with messages
  app.get("/api/chat/conversations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check if user owns this conversation
      if (conversation.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send message and get AI response
  app.post("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Verify conversation ownership
      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Add user message
      const userMessageData = insertChatMessageSchema.parse({
        conversationId: id,
        role: 'user',
        content: content.trim()
      });
      const userMessage = await storage.addMessage(userMessageData);

      // Generate AI response
      try {
        const messages = conversation.messages.concat([userMessage]).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

        const aiResponse = await chatbotService.generateResponse(messages);
        
        // Add AI message
        const aiMessageData = insertChatMessageSchema.parse({
          conversationId: id,
          role: 'assistant',
          content: aiResponse
        });
        const aiMessage = await storage.addMessage(aiMessageData);

        res.json({
          userMessage,
          aiMessage
        });
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        res.status(500).json({ 
          message: "Failed to generate AI response. Please check the chatbot configuration.",
          userMessage
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Update conversation title
  app.patch("/api/chat/conversations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      // Verify conversation ownership
      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      await storage.updateConversationTitle(id, title);
      res.json({ message: "Conversation title updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/chat/conversations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Verify conversation ownership
      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add authentication check for file access
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  });

  return httpServer;
}
