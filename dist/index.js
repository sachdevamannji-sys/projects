var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import jwt from "jsonwebtoken";

// shared/schema-sqlite.ts
var schema_sqlite_exports = {};
__export(schema_sqlite_exports, {
  cities: () => cities,
  citiesRelations: () => citiesRelations,
  crops: () => crops,
  cropsRelations: () => cropsRelations,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  insertCitySchema: () => insertCitySchema,
  insertCropSchema: () => insertCropSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertInventorySchema: () => insertInventorySchema,
  insertLedgerEntrySchema: () => insertLedgerEntrySchema,
  insertPartySchema: () => insertPartySchema,
  insertPurchaseSchema: () => insertPurchaseSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertStateSchema: () => insertStateSchema,
  insertUserSchema: () => insertUserSchema,
  inventory: () => inventory,
  inventoryRelations: () => inventoryRelations,
  ledgerEntries: () => ledgerEntries,
  ledgerEntriesRelations: () => ledgerEntriesRelations,
  parties: () => parties,
  partiesRelations: () => partiesRelations,
  purchases: () => purchases,
  purchasesRelations: () => purchasesRelations,
  sales: () => sales,
  salesRelations: () => salesRelations,
  states: () => states,
  statesRelations: () => statesRelations,
  users: () => users
});
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"),
  // admin, operator
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var states = sqliteTable("states", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => states.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var crops = sqliteTable("crops", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull().default("quintal"),
  // quintal, kg, ton
  basePrice: real("base_price"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var parties = sqliteTable("parties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // farmer, trader, exporter
  contactNumber: text("contact_number"),
  email: text("email"),
  address: text("address"),
  cityId: integer("city_id").references(() => cities.id),
  stateId: integer("state_id").references(() => states.id),
  balance: real("balance").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partyId: integer("party_id").notNull().references(() => parties.id),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  quantity: real("quantity").notNull(),
  rate: real("rate").notNull(),
  totalAmount: real("total_amount").notNull(),
  qualityGrade: text("quality_grade"),
  moistureContent: real("moisture_content"),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partyId: integer("party_id").notNull().references(() => parties.id),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  quantity: real("quantity").notNull(),
  rate: real("rate").notNull(),
  totalAmount: real("total_amount").notNull(),
  qualityGrade: text("quality_grade"),
  saleDate: integer("sale_date", { mode: "timestamp" }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending, partial, paid
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  // transport, storage, labor, other
  description: text("description"),
  amount: real("amount").notNull(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  saleId: integer("sale_id").references(() => sales.id),
  expenseDate: integer("expense_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  qualityGrade: text("quality_grade").default("A"),
  currentStock: real("current_stock").notNull().default(0),
  averageCost: real("average_cost").notNull().default(0),
  totalValue: real("total_value").notNull().default(0),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var ledgerEntries = sqliteTable("ledger_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  partyId: integer("party_id").notNull().references(() => parties.id),
  transactionType: text("transaction_type").notNull(),
  // purchase, sale, payment
  transactionId: integer("transaction_id"),
  // references purchase or sale id
  debit: real("debit").notNull().default(0),
  credit: real("credit").notNull().default(0),
  balance: real("balance").notNull().default(0),
  description: text("description"),
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  parties: many(parties)
}));
var citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id]
  }),
  parties: many(parties)
}));
var cropsRelations = relations(crops, ({ many }) => ({
  purchases: many(purchases),
  sales: many(sales),
  inventory: many(inventory)
}));
var partiesRelations = relations(parties, ({ one, many }) => ({
  city: one(cities, {
    fields: [parties.cityId],
    references: [cities.id]
  }),
  state: one(states, {
    fields: [parties.stateId],
    references: [states.id]
  }),
  purchases: many(purchases),
  sales: many(sales),
  ledgerEntries: many(ledgerEntries)
}));
var purchasesRelations = relations(purchases, ({ one, many }) => ({
  party: one(parties, {
    fields: [purchases.partyId],
    references: [parties.id]
  }),
  crop: one(crops, {
    fields: [purchases.cropId],
    references: [crops.id]
  }),
  expenses: many(expenses)
}));
var salesRelations = relations(sales, ({ one, many }) => ({
  party: one(parties, {
    fields: [sales.partyId],
    references: [parties.id]
  }),
  crop: one(crops, {
    fields: [sales.cropId],
    references: [crops.id]
  }),
  expenses: many(expenses)
}));
var expensesRelations = relations(expenses, ({ one }) => ({
  purchase: one(purchases, {
    fields: [expenses.purchaseId],
    references: [purchases.id]
  }),
  sale: one(sales, {
    fields: [expenses.saleId],
    references: [sales.id]
  })
}));
var inventoryRelations = relations(inventory, ({ one }) => ({
  crop: one(crops, {
    fields: [inventory.cropId],
    references: [crops.id]
  })
}));
var ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  party: one(parties, {
    fields: [ledgerEntries.partyId],
    references: [parties.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true
});
var insertCitySchema = createInsertSchema(cities).omit({
  id: true,
  createdAt: true
});
var insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true
});
var insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  createdAt: true,
  balance: true
});
var insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true
});
var insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
});
var insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true
});
var insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
var dbPath = path.join(process.cwd(), "local-database.db");
var sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");
var db = drizzle(sqlite, { schema: schema_sqlite_exports });

// server/storage.ts
import { eq, desc, asc, and, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return user;
  }
  async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  async getStates() {
    return db.select().from(states).orderBy(asc(states.name));
  }
  async createState(state) {
    const [newState] = await db.insert(states).values(state).returning();
    return newState;
  }
  async getCities() {
    return db.select().from(cities).orderBy(asc(cities.name));
  }
  async getCitiesByState(stateId) {
    return db.select().from(cities).where(eq(cities.stateId, stateId)).orderBy(asc(cities.name));
  }
  async createCity(city) {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }
  async getCrops() {
    return db.select().from(crops).orderBy(asc(crops.name));
  }
  async getCrop(id) {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop || void 0;
  }
  async createCrop(crop) {
    const [newCrop] = await db.insert(crops).values(crop).returning();
    return newCrop;
  }
  async updateCrop(id, crop) {
    const [updatedCrop] = await db.update(crops).set(crop).where(eq(crops.id, id)).returning();
    return updatedCrop;
  }
  async deleteCrop(id) {
    await db.delete(crops).where(eq(crops.id, id));
  }
  async getParties() {
    return db.select().from(parties).orderBy(asc(parties.name));
  }
  async getParty(id) {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party || void 0;
  }
  async getPartiesByType(type) {
    return db.select().from(parties).where(eq(parties.type, type)).orderBy(asc(parties.name));
  }
  async createParty(party) {
    const [newParty] = await db.insert(parties).values(party).returning();
    return newParty;
  }
  async updateParty(id, party) {
    const [updatedParty] = await db.update(parties).set(party).where(eq(parties.id, id)).returning();
    return updatedParty;
  }
  async deleteParty(id) {
    await db.delete(parties).where(eq(parties.id, id));
  }
  async updatePartyBalance(id, amount) {
    await db.update(parties).set({ balance: amount }).where(eq(parties.id, id));
  }
  async getPurchases() {
    return db.select().from(purchases).orderBy(desc(purchases.purchaseDate));
  }
  async getPurchase(id) {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || void 0;
  }
  async createPurchase(purchase) {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    await this.updateInventory(
      purchase.cropId,
      purchase.qualityGrade || "A",
      purchase.quantity,
      purchase.rate
    );
    await this.createLedgerEntry({
      partyId: purchase.partyId,
      transactionType: "purchase",
      transactionId: newPurchase.id,
      credit: purchase.finalAmount || purchase.totalAmount,
      debit: "0",
      balance: "0",
      // Will be calculated
      description: `Purchase - ${purchase.quantity} units ${purchase.expenseAmount && parseFloat(purchase.expenseAmount) > 0 ? `(incl. expenses: ${purchase.expenseAmount})` : ""}`,
      transactionDate: purchase.purchaseDate
    });
    return newPurchase;
  }
  async getPurchasesByDateRange(startDate, endDate) {
    return db.select().from(purchases).where(and(
      gte(purchases.purchaseDate, startDate),
      lte(purchases.purchaseDate, endDate)
    )).orderBy(desc(purchases.purchaseDate));
  }
  async getSales() {
    return db.select().from(sales).orderBy(desc(sales.saleDate));
  }
  async getSale(id) {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || void 0;
  }
  async createSale(sale) {
    const [newSale] = await db.insert(sales).values(sale).returning();
    await this.updateInventory(
      sale.cropId,
      sale.qualityGrade || "A",
      `-${sale.quantity}`,
      "0"
    );
    await this.createLedgerEntry({
      partyId: sale.partyId,
      transactionType: "sale",
      transactionId: newSale.id,
      debit: sale.totalAmount,
      credit: "0",
      balance: "0",
      // Will be calculated
      description: `Sale - ${sale.quantity} units`,
      transactionDate: sale.saleDate
    });
    return newSale;
  }
  async getSalesByDateRange(startDate, endDate) {
    return db.select().from(sales).where(and(
      gte(sales.saleDate, startDate),
      lte(sales.saleDate, endDate)
    )).orderBy(desc(sales.saleDate));
  }
  async updateSalePaymentStatus(id, status) {
    await db.update(sales).set({ paymentStatus: status }).where(eq(sales.id, id));
  }
  async getExpenses() {
    return db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }
  async createExpense(expense) {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    if (expense.purchaseId) {
      const purchase = await this.getPurchase(expense.purchaseId);
      if (purchase) {
        await this.createLedgerEntry({
          partyId: purchase.partyId,
          transactionType: "expense",
          transactionId: newExpense.id,
          debit: expense.amount,
          credit: "0",
          balance: "0",
          // Will be calculated
          description: `${expense.type} expense - ${expense.description || "Related to purchase"}`,
          transactionDate: expense.expenseDate
        });
      }
    }
    return newExpense;
  }
  async getExpensesByDateRange(startDate, endDate) {
    return db.select().from(expenses).where(and(
      gte(expenses.expenseDate, startDate),
      lte(expenses.expenseDate, endDate)
    )).orderBy(desc(expenses.expenseDate));
  }
  async getInventory() {
    return db.select().from(inventory).orderBy(asc(inventory.cropId));
  }
  async getInventoryByCrop(cropId) {
    return db.select().from(inventory).where(eq(inventory.cropId, cropId));
  }
  async updateInventory(cropId, qualityGrade, quantity, cost) {
    const [existingInventory] = await db.select().from(inventory).where(and(
      eq(inventory.cropId, cropId),
      eq(inventory.qualityGrade, qualityGrade)
    ));
    const quantityNum = parseFloat(quantity);
    const costNum = parseFloat(cost);
    if (existingInventory) {
      const currentStock = parseFloat(existingInventory.currentStock || "0");
      const currentCost = parseFloat(existingInventory.averageCost || "0");
      const newStock = currentStock + quantityNum;
      const newAvgCost = quantityNum > 0 && costNum > 0 ? (currentStock * currentCost + quantityNum * costNum) / newStock : currentCost;
      const newTotalValue = newStock * newAvgCost;
      await db.update(inventory).set({
        currentStock: newStock.toString(),
        averageCost: newAvgCost.toString(),
        totalValue: newTotalValue.toString(),
        lastUpdated: /* @__PURE__ */ new Date()
      }).where(eq(inventory.id, existingInventory.id));
    } else if (quantityNum > 0) {
      await db.insert(inventory).values({
        cropId,
        qualityGrade,
        currentStock: quantity,
        averageCost: cost,
        totalValue: (quantityNum * costNum).toString()
      });
    }
  }
  async getLedgerEntries(partyId) {
    const query = db.select().from(ledgerEntries);
    if (partyId) {
      return query.where(eq(ledgerEntries.partyId, partyId)).orderBy(desc(ledgerEntries.transactionDate));
    }
    return query.orderBy(desc(ledgerEntries.transactionDate));
  }
  async createLedgerEntry(entry) {
    const [lastEntry] = await db.select().from(ledgerEntries).where(eq(ledgerEntries.partyId, entry.partyId)).orderBy(desc(ledgerEntries.transactionDate)).limit(1);
    const lastBalance = parseFloat(lastEntry?.balance || "0");
    const debit = parseFloat(entry.debit || "0");
    const credit = parseFloat(entry.credit || "0");
    const newBalance = lastBalance + debit - credit;
    const [newEntry] = await db.insert(ledgerEntries).values({ ...entry, balance: newBalance.toString() }).returning();
    await this.updatePartyBalance(entry.partyId, newBalance.toString());
    return newEntry;
  }
  async getDashboardMetrics() {
    try {
      const salesResult = sqlite.prepare("SELECT SUM(total_amount) as total FROM sales").get();
      const purchasesResult = sqlite.prepare("SELECT SUM(total_amount) as total FROM purchases").get();
      const inventoryResult = sqlite.prepare("SELECT SUM(total_value) as total FROM inventory").get();
      const expensesResult = sqlite.prepare("SELECT SUM(amount) as total FROM expenses").get();
      const lowStockResult = sqlite.prepare("SELECT COUNT(*) as count FROM inventory WHERE current_stock < 50").get();
      const totalSales = (salesResult?.total || 0).toString();
      const totalPurchases = (purchasesResult?.total || 0).toString();
      const totalExpenses = (expensesResult?.total || 0).toString();
      const totalInventoryValue = (inventoryResult?.total || 0).toString();
      const totalProfit = ((salesResult?.total || 0) - (purchasesResult?.total || 0) - (expensesResult?.total || 0)).toString();
      return {
        totalSales,
        totalPurchases,
        totalInventoryValue,
        totalProfit,
        lowStockItems: lowStockResult?.count || 0
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return {
        totalSales: "0",
        totalPurchases: "0",
        totalInventoryValue: "0",
        totalProfit: "0",
        lowStockItems: 0
      };
    }
  }
  async getSalesTrendData(period) {
    try {
      let daysBack = 7;
      if (period === "30days") daysBack = 30;
      else if (period === "3months") daysBack = 90;
      const startDate = /* @__PURE__ */ new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const salesData = sqlite.prepare(`
        SELECT 
          DATE(sale_date) as date,
          SUM(total_amount) as total
        FROM sales
        WHERE sale_date >= ?
        GROUP BY DATE(sale_date)
        ORDER BY DATE(sale_date)
      `).all(startDate.toISOString().split("T")[0]);
      const purchasesData = sqlite.prepare(`
        SELECT 
          DATE(purchase_date) as date,
          SUM(total_amount) as total
        FROM purchases
        WHERE purchase_date >= ?
        GROUP BY DATE(purchase_date)
        ORDER BY DATE(purchase_date)
      `).all(startDate.toISOString().split("T")[0]);
      const salesMap = new Map(salesData.map((s) => [s.date, s.total || 0]));
      const purchasesMap = new Map(purchasesData.map((p) => [p.date, p.total || 0]));
      const result = [];
      for (let i = 0; i < daysBack; i++) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() - (daysBack - 1 - i));
        const dateStr = date.toISOString().split("T")[0];
        result.push({
          date: dateStr,
          sales: salesMap.get(dateStr) || 0,
          purchases: purchasesMap.get(dateStr) || 0
        });
      }
      return result;
    } catch (error) {
      console.error("Error fetching sales trend data:", error);
      return [];
    }
  }
  async getCropDistributionData() {
    try {
      const result = sqlite.prepare(`
        SELECT 
          c.name,
          SUM(i.current_stock) as value
        FROM inventory i
        JOIN crops c ON i.crop_id = c.id
        WHERE i.current_stock > 0
        GROUP BY c.id, c.name
        ORDER BY value DESC
      `).all();
      return result.map((row) => ({
        name: row.name,
        value: parseFloat(row.value?.toString() || "0")
      }));
    } catch (error) {
      console.error("Error fetching crop distribution data:", error);
      return [];
    }
  }
};
var storage = new DatabaseStorage();

// shared/schema.ts
import { pgTable, text as text2, serial, integer as integer2, decimal, timestamp } from "drizzle-orm/pg-core";
import { relations as relations2 } from "drizzle-orm";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
var users2 = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text2("username").notNull().unique(),
  email: text2("email").notNull().unique(),
  password: text2("password").notNull(),
  role: text2("role").notNull().default("operator"),
  // admin, operator
  createdAt: timestamp("created_at").defaultNow()
});
var states2 = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text2("name").notNull().unique(),
  code: text2("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var cities2 = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text2("name").notNull(),
  stateId: integer2("state_id").notNull().references(() => states2.id),
  createdAt: timestamp("created_at").defaultNow()
});
var crops2 = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text2("name").notNull().unique(),
  unit: text2("unit").notNull().default("quintal"),
  // quintal, kg, ton
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow()
});
var parties2 = pgTable("parties", {
  id: serial("id").primaryKey(),
  name: text2("name").notNull(),
  type: text2("type").notNull(),
  // farmer, trader, exporter
  contactNumber: text2("contact_number"),
  email: text2("email"),
  address: text2("address"),
  aadharNumber: text2("aadhar_number"),
  // Optional Aadhar number
  cityId: integer2("city_id").references(() => cities2.id),
  stateId: integer2("state_id").references(() => states2.id),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow()
});
var purchases2 = pgTable("purchases", {
  id: serial("id").primaryKey(),
  partyId: integer2("party_id").notNull().references(() => parties2.id),
  cropId: integer2("crop_id").notNull().references(() => crops2.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  expenseAmount: decimal("expense_amount", { precision: 12, scale: 2 }).default("0"),
  // Total expenses for this purchase
  finalAmount: decimal("final_amount", { precision: 12, scale: 2 }).notNull(),
  // Total amount + expenses
  qualityGrade: text2("quality_grade"),
  moistureContent: decimal("moisture_content", { precision: 5, scale: 2 }),
  purchaseDate: timestamp("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var sales2 = pgTable("sales", {
  id: serial("id").primaryKey(),
  partyId: integer2("party_id").notNull().references(() => parties2.id),
  cropId: integer2("crop_id").notNull().references(() => crops2.id),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  qualityGrade: text2("quality_grade"),
  saleDate: timestamp("sale_date").notNull(),
  paymentStatus: text2("payment_status").default("pending"),
  // paid, pending, partial
  createdAt: timestamp("created_at").defaultNow()
});
var expenses2 = pgTable("expenses", {
  id: serial("id").primaryKey(),
  type: text2("type").notNull(),
  // transportation, labor, storage, testing
  description: text2("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purchaseId: integer2("purchase_id").references(() => purchases2.id),
  saleId: integer2("sale_id").references(() => sales2.id),
  expenseDate: timestamp("expense_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var inventory2 = pgTable("inventory", {
  id: serial("id").primaryKey(),
  cropId: integer2("crop_id").notNull().references(() => crops2.id),
  qualityGrade: text2("quality_grade"),
  currentStock: decimal("current_stock", { precision: 10, scale: 3 }).default("0"),
  averageCost: decimal("average_cost", { precision: 10, scale: 2 }).default("0"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default("0"),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var ledgerEntries2 = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  partyId: integer2("party_id").notNull().references(() => parties2.id),
  transactionType: text2("transaction_type").notNull(),
  // purchase, sale, payment, expense
  transactionId: integer2("transaction_id"),
  // references to purchase/sale/expense id
  debit: decimal("debit", { precision: 12, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 12, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  description: text2("description"),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var statesRelations2 = relations2(states2, ({ many }) => ({
  cities: many(cities2),
  parties: many(parties2)
}));
var citiesRelations2 = relations2(cities2, ({ one, many }) => ({
  state: one(states2, {
    fields: [cities2.stateId],
    references: [states2.id]
  }),
  parties: many(parties2)
}));
var cropsRelations2 = relations2(crops2, ({ many }) => ({
  purchases: many(purchases2),
  sales: many(sales2),
  inventory: many(inventory2)
}));
var partiesRelations2 = relations2(parties2, ({ one, many }) => ({
  city: one(cities2, {
    fields: [parties2.cityId],
    references: [cities2.id]
  }),
  state: one(states2, {
    fields: [parties2.stateId],
    references: [states2.id]
  }),
  purchases: many(purchases2),
  sales: many(sales2),
  ledgerEntries: many(ledgerEntries2)
}));
var purchasesRelations2 = relations2(purchases2, ({ one, many }) => ({
  party: one(parties2, {
    fields: [purchases2.partyId],
    references: [parties2.id]
  }),
  crop: one(crops2, {
    fields: [purchases2.cropId],
    references: [crops2.id]
  }),
  expenses: many(expenses2)
}));
var salesRelations2 = relations2(sales2, ({ one, many }) => ({
  party: one(parties2, {
    fields: [sales2.partyId],
    references: [parties2.id]
  }),
  crop: one(crops2, {
    fields: [sales2.cropId],
    references: [crops2.id]
  }),
  expenses: many(expenses2)
}));
var expensesRelations2 = relations2(expenses2, ({ one }) => ({
  purchase: one(purchases2, {
    fields: [expenses2.purchaseId],
    references: [purchases2.id]
  }),
  sale: one(sales2, {
    fields: [expenses2.saleId],
    references: [sales2.id]
  })
}));
var inventoryRelations2 = relations2(inventory2, ({ one }) => ({
  crop: one(crops2, {
    fields: [inventory2.cropId],
    references: [crops2.id]
  })
}));
var ledgerEntriesRelations2 = relations2(ledgerEntries2, ({ one }) => ({
  party: one(parties2, {
    fields: [ledgerEntries2.partyId],
    references: [parties2.id]
  })
}));
var insertUserSchema2 = createInsertSchema2(users2).omit({
  id: true,
  createdAt: true
});
var insertStateSchema2 = createInsertSchema2(states2).omit({
  id: true,
  createdAt: true
});
var insertCitySchema2 = createInsertSchema2(cities2).omit({
  id: true,
  createdAt: true
});
var insertCropSchema2 = createInsertSchema2(crops2).omit({
  id: true,
  createdAt: true
});
var insertPartySchema2 = createInsertSchema2(parties2).omit({
  id: true,
  balance: true,
  createdAt: true
});
var insertPurchaseSchema2 = createInsertSchema2(purchases2).omit({
  id: true,
  createdAt: true
});
var insertSaleSchema2 = createInsertSchema2(sales2).omit({
  id: true,
  createdAt: true
});
var insertExpenseSchema2 = createInsertSchema2(expenses2).omit({
  id: true,
  createdAt: true
});
var insertInventorySchema2 = createInsertSchema2(inventory2).omit({
  id: true,
  lastUpdated: true
});
var insertLedgerEntrySchema2 = createInsertSchema2(ledgerEntries2).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await storage.validatePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema2.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });
  app2.get("/api/states", authenticateToken, async (req, res) => {
    try {
      const states3 = await storage.getStates();
      res.json(states3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });
  app2.post("/api/states", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stateData = insertStateSchema2.parse(req.body);
      const state = await storage.createState(stateData);
      res.status(201).json(state);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.get("/api/cities", authenticateToken, async (req, res) => {
    try {
      const { stateId } = req.query;
      const cities3 = stateId ? await storage.getCitiesByState(parseInt(stateId)) : await storage.getCities();
      res.json(cities3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  app2.post("/api/cities", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const cityData = insertCitySchema2.parse(req.body);
      const city = await storage.createCity(cityData);
      res.status(201).json(city);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.get("/api/crops", authenticateToken, async (req, res) => {
    try {
      const crops3 = await storage.getCrops();
      res.json(crops3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });
  app2.post("/api/crops", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const cropData = insertCropSchema2.parse(req.body);
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.put("/api/crops/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cropData = insertCropSchema2.partial().parse(req.body);
      const crop = await storage.updateCrop(id, cropData);
      res.json(crop);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.delete("/api/crops/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCrop(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });
  app2.get("/api/parties", authenticateToken, async (req, res) => {
    try {
      const { type } = req.query;
      const parties3 = type ? await storage.getPartiesByType(type) : await storage.getParties();
      res.json(parties3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });
  app2.post("/api/parties", authenticateToken, async (req, res) => {
    try {
      const partyData = insertPartySchema2.parse(req.body);
      const party = await storage.createParty(partyData);
      res.status(201).json(party);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.put("/api/parties/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partyData = insertPartySchema2.partial().parse(req.body);
      const party = await storage.updateParty(id, partyData);
      res.json(party);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.delete("/api/parties/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteParty(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete party" });
    }
  });
  app2.get("/api/purchases", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const purchases3 = startDate && endDate ? await storage.getPurchasesByDateRange(new Date(startDate), new Date(endDate)) : await storage.getPurchases();
      res.json(purchases3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });
  app2.post("/api/purchases", authenticateToken, async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        purchaseDate: new Date(req.body.purchaseDate),
        moistureContent: req.body.moistureContent || void 0,
        qualityGrade: req.body.qualityGrade || void 0,
        expenseAmount: req.body.expenseAmount || "0",
        finalAmount: req.body.finalAmount || req.body.totalAmount
      };
      const purchaseData = insertPurchaseSchema2.parse(processedBody);
      const purchase = await storage.createPurchase(purchaseData);
      if (req.body.expenses && Array.isArray(req.body.expenses)) {
        for (const expense of req.body.expenses) {
          if (expense.type && expense.amount) {
            await storage.createExpense({
              type: expense.type,
              description: `${expense.type} expense for Purchase #${purchase.id}`,
              amount: expense.amount,
              purchaseId: purchase.id,
              expenseDate: new Date(req.body.purchaseDate)
            });
          }
        }
      }
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Purchase validation error:", error);
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });
  app2.get("/api/sales", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const sales3 = startDate && endDate ? await storage.getSalesByDateRange(new Date(startDate), new Date(endDate)) : await storage.getSales();
      res.json(sales3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.post("/api/sales", authenticateToken, async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        saleDate: new Date(req.body.saleDate),
        qualityGrade: req.body.qualityGrade || void 0
      };
      const saleData = insertSaleSchema2.parse(processedBody);
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      console.error("Sale validation error:", error);
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });
  app2.put("/api/sales/:id/payment", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateSalePaymentStatus(id, status);
      res.json({ message: "Payment status updated" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.get("/api/expenses", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses3 = startDate && endDate ? await storage.getExpensesByDateRange(new Date(startDate), new Date(endDate)) : await storage.getExpenses();
      res.json(expenses3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/expenses", authenticateToken, async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        expenseDate: new Date(req.body.expenseDate),
        purchaseId: req.body.purchaseId || void 0,
        saleId: req.body.saleId || void 0
      };
      const expenseData = insertExpenseSchema2.parse(processedBody);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Expense validation error:", error);
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });
  app2.get("/api/inventory", authenticateToken, async (req, res) => {
    try {
      const { cropId } = req.query;
      const inventory3 = cropId ? await storage.getInventoryByCrop(parseInt(cropId)) : await storage.getInventory();
      res.json(inventory3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  app2.get("/api/ledger", authenticateToken, async (req, res) => {
    try {
      const { partyId } = req.query;
      const entries = partyId ? await storage.getLedgerEntries(parseInt(partyId)) : await storage.getLedgerEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ledger entries" });
    }
  });
  app2.get("/api/dashboard/sales-trend", authenticateToken, async (req, res) => {
    try {
      const { period = "7days" } = req.query;
      const data = await storage.getSalesTrendData(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales trend data" });
    }
  });
  app2.get("/api/dashboard/crop-distribution", authenticateToken, async (req, res) => {
    try {
      const data = await storage.getCropDistributionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crop distribution data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "./public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5001;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
