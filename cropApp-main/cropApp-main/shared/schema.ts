import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid } from "drizzle-orm/pg-core";
import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"), // admin, operator
  createdAt: timestamp("created_at").defaultNow(),
});

// States table
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cities table
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => states.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crops table
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull().default("quintal"), // quintal, kg, ton
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parties table (farmers, traders, etc.)
export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // farmer, trader, exporter
  contactNumber: text("contact_number"),
  email: text("email"),
  address: text("address"),
  aadharNumber: text("aadhar_number"), // Optional Aadhar number
  cityId: integer("city_id").references(() => cities.id),
  stateId: integer("state_id").references(() => states.id),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase transactions
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => parties.id),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  expenseAmount: decimal("expense_amount", { precision: 12, scale: 2 }).default("0"), // Total expenses for this purchase
  finalAmount: decimal("final_amount", { precision: 12, scale: 2 }).notNull(), // Total amount + expenses
  qualityGrade: text("quality_grade"),
  moistureContent: decimal("moisture_content", { precision: 5, scale: 2 }),
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales transactions
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => parties.id),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  qualityGrade: text("quality_grade"),
  saleDate: timestamp("sale_date").notNull(),
  paymentStatus: text("payment_status").default("pending"), // paid, pending, partial
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // transportation, labor, storage, testing
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  saleId: integer("sale_id").references(() => sales.id),
  expenseDate: timestamp("expense_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  qualityGrade: text("quality_grade"),
  currentStock: decimal("current_stock", { precision: 10, scale: 3 }).default("0"),
  averageCost: decimal("average_cost", { precision: 10, scale: 2 }).default("0"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default("0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Ledger entries
export const ledgerEntries = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => parties.id),
  transactionType: text("transaction_type").notNull(), // purchase, sale, payment, expense
  transactionId: integer("transaction_id"), // references to purchase/sale/expense id
  debit: decimal("debit", { precision: 12, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 12, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  parties: many(parties),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  parties: many(parties),
}));

export const cropsRelations = relations(crops, ({ many }) => ({
  purchases: many(purchases),
  sales: many(sales),
  inventory: many(inventory),
}));

export const partiesRelations = relations(parties, ({ one, many }) => ({
  city: one(cities, {
    fields: [parties.cityId],
    references: [cities.id],
  }),
  state: one(states, {
    fields: [parties.stateId],
    references: [states.id],
  }),
  purchases: many(purchases),
  sales: many(sales),
  ledgerEntries: many(ledgerEntries),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  party: one(parties, {
    fields: [purchases.partyId],
    references: [parties.id],
  }),
  crop: one(crops, {
    fields: [purchases.cropId],
    references: [crops.id],
  }),
  expenses: many(expenses),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  party: one(parties, {
    fields: [sales.partyId],
    references: [parties.id],
  }),
  crop: one(crops, {
    fields: [sales.cropId],
    references: [crops.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  purchase: one(purchases, {
    fields: [expenses.purchaseId],
    references: [purchases.id],
  }),
  sale: one(sales, {
    fields: [expenses.saleId],
    references: [sales.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  crop: one(crops, {
    fields: [inventory.cropId],
    references: [crops.id],
  }),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  party: one(parties, {
    fields: [ledgerEntries.partyId],
    references: [parties.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true,
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
});

export const insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  balance: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;

export type Party = typeof parties.$inferSelect;
export type InsertParty = z.infer<typeof insertPartySchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
