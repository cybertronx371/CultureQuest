import { 
  users, packages, tickets, bills, networkNodes, customerPackages,
  chatbotConfig, chatConversations, chatMessages,
  type User, type InsertUser, type Package, type InsertPackage,
  type Ticket, type InsertTicket, type Bill, type InsertBill,
  type NetworkNode, type InsertNetworkNode, type CustomerPackage, 
  type InsertCustomerPackage, type ChatbotConfig, type InsertChatbotConfig,
  type ChatConversation, type InsertChatConversation, type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;

  // Package operations
  getPackages(): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package | undefined>;

  // Customer package operations
  getCustomerPackage(customerId: string): Promise<CustomerPackage & { package: Package } | undefined>;
  createCustomerPackage(customerPackage: InsertCustomerPackage): Promise<CustomerPackage>;
  updateCustomerPackageStatus(customerId: string, status: string): Promise<void>;

  // Ticket operations
  getTickets(): Promise<(Ticket & { customer: User; technician: User | null })[]>;
  getTicket(id: string): Promise<Ticket & { customer: User; technician: User | null } | undefined>;
  getTicketsByCustomer(customerId: string): Promise<Ticket[]>;
  getTicketsByTechnician(technicianId: string): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<InsertTicket>): Promise<Ticket | undefined>;
  getQueuePosition(ticketId: string): Promise<number>;
  assignTicket(ticketId: string, technicianId: string): Promise<void>;

  // Bill operations
  getBillsByCustomer(customerId: string): Promise<(Bill & { package: Package })[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: string, updates: Partial<InsertBill>): Promise<Bill | undefined>;
  markBillAsPaid(id: string): Promise<void>;
  generateMonthlyBills(period: string): Promise<void>;

  // Network operations
  getNetworkNodes(): Promise<NetworkNode[]>;
  updateNetworkNode(id: string, updates: Partial<InsertNetworkNode>): Promise<NetworkNode | undefined>;

  // Chatbot operations (Admin only)
  getChatbotConfigs(): Promise<ChatbotConfig[]>;
  getActiveChatbotConfig(): Promise<ChatbotConfig | undefined>;
  createChatbotConfig(config: InsertChatbotConfig): Promise<ChatbotConfig>;
  updateChatbotConfig(id: string, updates: Partial<InsertChatbotConfig>): Promise<ChatbotConfig | undefined>;
  deleteChatbotConfig(id: string): Promise<void>;
  activateChatbotConfig(id: string): Promise<void>;

  // Chat operations
  getUserConversations(userId: string): Promise<ChatConversation[]>;
  createConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getConversation(id: string): Promise<ChatConversation & { messages: ChatMessage[] } | undefined>;
  addMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateConversationTitle(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Package operations
  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.isActive, true)).orderBy(asc(packages.price));
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg || undefined;
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [newPackage] = await db.insert(packages).values(pkg).returning();
    return newPackage;
  }

  async updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package | undefined> {
    const [pkg] = await db.update(packages).set(updates).where(eq(packages.id, id)).returning();
    return pkg || undefined;
  }

  // Customer package operations
  async getCustomerPackage(customerId: string): Promise<CustomerPackage & { package: Package } | undefined> {
    const [result] = await db
      .select()
      .from(customerPackages)
      .innerJoin(packages, eq(customerPackages.packageId, packages.id))
      .where(eq(customerPackages.customerId, customerId));
    
    if (!result) return undefined;
    
    return {
      ...result.customer_packages,
      package: result.packages
    };
  }

  async createCustomerPackage(customerPackage: InsertCustomerPackage): Promise<CustomerPackage> {
    const [newCustomerPackage] = await db.insert(customerPackages).values(customerPackage).returning();
    return newCustomerPackage;
  }

  async updateCustomerPackageStatus(customerId: string, status: string): Promise<void> {
    await db
      .update(customerPackages)
      .set({ status, activatedAt: status === 'active' ? new Date() : null })
      .where(eq(customerPackages.customerId, customerId));
  }

  // Ticket operations
  async getTickets(): Promise<(Ticket & { customer: User; technician: User | null })[]> {
    const result = await db
      .select()
      .from(tickets)
      .innerJoin(users, eq(tickets.customerId, users.id))
      .leftJoin(users as any, eq(tickets.technicianId, (users as any).id))
      .orderBy(desc(tickets.createdAt));

    return result.map(row => ({
      ...row.tickets,
      customer: row.users,
      technician: (row as any).users_1 || null
    }));
  }

  async getTicket(id: string): Promise<Ticket & { customer: User; technician: User | null } | undefined> {
    const [result] = await db
      .select()
      .from(tickets)
      .innerJoin(users, eq(tickets.customerId, users.id))
      .leftJoin(users as any, eq(tickets.technicianId, (users as any).id))
      .where(eq(tickets.id, id));

    if (!result) return undefined;

    return {
      ...result.tickets,
      customer: result.users,
      technician: (result as any).users_1 || null
    };
  }

  async getTicketsByCustomer(customerId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.customerId, customerId)).orderBy(desc(tickets.createdAt));
  }

  async getTicketsByTechnician(technicianId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.technicianId, technicianId)).orderBy(asc(tickets.createdAt));
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    // Calculate queue position
    const [queueCount] = await db
      .select({ count: count() })
      .from(tickets)
      .where(sql`status IN ('open', 'in_progress')`);

    const queuePosition = (queueCount.count || 0) + 1;

    const [newTicket] = await db
      .insert(tickets)
      .values({ ...ticket, queuePosition })
      .returning();
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const [ticket] = await db.update(tickets).set(updates).where(eq(tickets.id, id)).returning();
    return ticket || undefined;
  }

  async getQueuePosition(ticketId: string): Promise<number> {
    const [ticket] = await db.select({ queuePosition: tickets.queuePosition }).from(tickets).where(eq(tickets.id, ticketId));
    return ticket?.queuePosition || 0;
  }

  async assignTicket(ticketId: string, technicianId: string): Promise<void> {
    await db
      .update(tickets)
      .set({ technicianId, status: 'in_progress' })
      .where(eq(tickets.id, ticketId));
  }

  // Bill operations
  async getBillsByCustomer(customerId: string): Promise<(Bill & { package: Package })[]> {
    const result = await db
      .select()
      .from(bills)
      .innerJoin(packages, eq(bills.packageId, packages.id))
      .where(eq(bills.customerId, customerId))
      .orderBy(desc(bills.createdAt));

    return result.map(row => ({
      ...row.bills,
      package: row.packages
    }));
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async updateBill(id: string, updates: Partial<InsertBill>): Promise<Bill | undefined> {
    const [bill] = await db.update(bills).set(updates).where(eq(bills.id, id)).returning();
    return bill || undefined;
  }

  async markBillAsPaid(id: string): Promise<void> {
    await db
      .update(bills)
      .set({ status: 'paid', paidAt: new Date() })
      .where(eq(bills.id, id));
  }

  async generateMonthlyBills(period: string): Promise<void> {
    const activeCustomers = await db
      .select()
      .from(customerPackages)
      .innerJoin(packages, eq(customerPackages.packageId, packages.id))
      .where(eq(customerPackages.status, 'active'));

    const billsToCreate = activeCustomers.map(({ customer_packages, packages: pkg }) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

      return {
        customerId: customer_packages.customerId,
        packageId: customer_packages.packageId,
        period,
        amount: pkg.price,
        dueDate,
        status: 'pending' as const,
      };
    });

    if (billsToCreate.length > 0) {
      await db.insert(bills).values(billsToCreate);
    }
  }

  // Network operations
  async getNetworkNodes(): Promise<NetworkNode[]> {
    return await db.select().from(networkNodes).orderBy(asc(networkNodes.name));
  }

  async updateNetworkNode(id: string, updates: Partial<InsertNetworkNode>): Promise<NetworkNode | undefined> {
    const [node] = await db
      .update(networkNodes)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(networkNodes.id, id))
      .returning();
    return node || undefined;
  }

  // Chatbot operations (Admin only)
  async getChatbotConfigs(): Promise<ChatbotConfig[]> {
    return await db.select().from(chatbotConfig).orderBy(desc(chatbotConfig.createdAt));
  }

  async getActiveChatbotConfig(): Promise<ChatbotConfig | undefined> {
    const [config] = await db.select().from(chatbotConfig).where(eq(chatbotConfig.isActive, true));
    return config || undefined;
  }

  async createChatbotConfig(config: InsertChatbotConfig): Promise<ChatbotConfig> {
    // Deactivate all existing configs
    await db.update(chatbotConfig).set({ isActive: false });
    
    const [newConfig] = await db
      .insert(chatbotConfig)
      .values({ ...config, isActive: true })
      .returning();
    return newConfig;
  }

  async updateChatbotConfig(id: string, updates: Partial<InsertChatbotConfig>): Promise<ChatbotConfig | undefined> {
    const [config] = await db
      .update(chatbotConfig)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatbotConfig.id, id))
      .returning();
    return config || undefined;
  }

  async deleteChatbotConfig(id: string): Promise<void> {
    await db.delete(chatbotConfig).where(eq(chatbotConfig.id, id));
  }

  async activateChatbotConfig(id: string): Promise<void> {
    // Deactivate all configs
    await db.update(chatbotConfig).set({ isActive: false });
    // Activate the specified one
    await db.update(chatbotConfig).set({ isActive: true }).where(eq(chatbotConfig.id, id));
  }

  // Chat operations
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt));
  }

  async createConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getConversation(id: string): Promise<ChatConversation & { messages: ChatMessage[] } | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id));
    
    if (!conversation) return undefined;

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, id))
      .orderBy(asc(chatMessages.createdAt));

    return { ...conversation, messages };
  }

  async addMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();

    // Update conversation timestamp
    await db
      .update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));

    return newMessage;
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await db
      .update(chatConversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(chatConversations.id, id));
  }

  async deleteConversation(id: string): Promise<void> {
    // Delete messages first (due to foreign key constraint)
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
    // Then delete conversation
    await db.delete(chatConversations).where(eq(chatConversations.id, id));
  }
}

export const storage = new DatabaseStorage();
