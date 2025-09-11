import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"), // admin, operator
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// States table
export const states = sqliteTable("states", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Cities table
export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => states.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Crops table
export const crops = sqliteTable("crops", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull().default("quintal"), // quintal, kg, ton
  basePrice: real("base_price"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Parties table (farmers, traders, etc.)
export const parties = sqliteTable("parties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // farmer, trader, exporter
  contactNumber: text("contact_number"),
  email: text("email"),
  address: text("address"),
  cityId: integer("city_id").references(() => cities.id),
  stateId: integer("state_id").references(() => states.id),
  balance: real("balance").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Purchase transactions
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partyId: integer("party_id").notNull().references(() => parties.id),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  quantity: real("quantity").notNull(),
  rate: real("rate").notNull(),
  totalAmount: real("total_amount").notNull(),
  qualityGrade: text("quality_grade"),
  moistureContent: real("moisture_content"),
  purchaseDate: integer("purchase_date", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Sales transactions
export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partyId: integer("party_id").notNull().references(() => parties.id),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  quantity: real("quantity").notNull(),
  rate: real("rate").notNull(),
  totalAmount: real("total_amount").notNull(),
  qualityGrade: text("quality_grade"),
  saleDate: integer("sale_date", { mode: 'timestamp' }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, partial, paid
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Expenses
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // transport, storage, labor, other
  description: text("description"),
  amount: real("amount").notNull(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  saleId: integer("sale_id").references(() => sales.id),
  expenseDate: integer("expense_date", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Inventory
export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  qualityGrade: text("quality_grade").default("A"),
  currentStock: real("current_stock").notNull().default(0),
  averageCost: real("average_cost").notNull().default(0),
  totalValue: real("total_value").notNull().default(0),
  lastUpdated: integer("last_updated", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Ledger entries
export const ledgerEntries = sqliteTable("ledger_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partyId: integer("party_id").notNull().references(() => parties.id),
  transactionType: text("transaction_type").notNull(), // purchase, sale, payment
  transactionId: integer("transaction_id"), // references purchase or sale id
  debit: real("debit").notNull().default(0),
  credit: real("credit").notNull().default(0),
  balance: real("balance").notNull().default(0),
  description: text("description"),
  transactionDate: integer("transaction_date", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

// Zod schemas for validation
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
  createdAt: true,
  balance: true,
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

// TypeScript types
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