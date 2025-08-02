import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("customer"), // customer, technician, admin
  status: text("status").notNull().default("active"), // active, inactive, pending
  createdAt: timestamp("created_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  speed: text("speed").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerPackages = pgTable("customer_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  packageId: varchar("package_id").notNull().references(() => packages.id),
  status: text("status").notNull().default("pending"), // pending, active, suspended, cancelled
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  technicianId: varchar("technician_id").references(() => users.id),
  type: text("type").notNull(), // installation, repair, complaint
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, completed, cancelled
  priority: text("priority").default("normal"), // low, normal, high, urgent
  queuePosition: integer("queue_position"),
  scheduledDate: timestamp("scheduled_date"),
  completedAt: timestamp("completed_at"),
  proofPhotos: jsonb("proof_photos"), // array of {url, gpsCoordinates: {lat, lng}, timestamp}
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  packageId: varchar("package_id").notNull().references(() => packages.id),
  period: text("period").notNull(), // YYYY-MM format
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  createdAt: timestamp("created_at").defaultNow(),
});

export const networkNodes = pgTable("network_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("online"), // online, maintenance, offline
  connectedCustomers: integer("connected_customers").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  customerPackages: many(customerPackages),
  tickets: many(tickets, { relationName: "customerTickets" }),
  assignedTickets: many(tickets, { relationName: "technicianTickets" }),
  bills: many(bills),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  customerPackages: many(customerPackages),
  bills: many(bills),
}));

export const customerPackagesRelations = relations(customerPackages, ({ one }) => ({
  customer: one(users, {
    fields: [customerPackages.customerId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [customerPackages.packageId],
    references: [packages.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  customer: one(users, {
    fields: [tickets.customerId],
    references: [users.id],
    relationName: "customerTickets",
  }),
  technician: one(users, {
    fields: [tickets.technicianId],
    references: [users.id],
    relationName: "technicianTickets",
  }),
}));

export const billsRelations = relations(bills, ({ one }) => ({
  customer: one(users, {
    fields: [bills.customerId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [bills.packageId],
    references: [packages.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  queuePosition: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkNodeSchema = createInsertSchema(networkNodes).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertCustomerPackageSchema = createInsertSchema(customerPackages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type NetworkNode = typeof networkNodes.$inferSelect;
export type InsertNetworkNode = z.infer<typeof insertNetworkNodeSchema>;
export type CustomerPackage = typeof customerPackages.$inferSelect;
export type InsertCustomerPackage = z.infer<typeof insertCustomerPackageSchema>;

// Chatbot API Configuration (Admin only)
export const chatbotConfig = pgTable("chatbot_config", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  provider: text("provider").notNull(), // 'openai', 'gemini', 'deepseek'
  apiKey: text("api_key").notNull(),
  model: text("model").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").default("New Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id").notNull().references(() => chatConversations.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// Insert schemas for new tables
export const insertChatbotConfigSchema = createInsertSchema(chatbotConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type ChatbotConfig = typeof chatbotConfig.$inferSelect;
export type InsertChatbotConfig = z.infer<typeof insertChatbotConfigSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
