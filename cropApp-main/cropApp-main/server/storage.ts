import {
  users, states, cities, crops, parties, purchases, sales, expenses, inventory, ledgerEntries,
  type User, type InsertUser, type State, type InsertState, type City, type InsertCity,
  type Crop, type InsertCrop, type Party, type InsertParty, type Purchase, type InsertPurchase,
  type Sale, type InsertSale, type Expense, type InsertExpense, type Inventory, type InsertInventory,
  type LedgerEntry, type InsertLedgerEntry
} from "@shared/schema-sqlite";
import { db, sqlite } from "./db";
import { eq, desc, asc, and, gte, lte, sql, sum } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;

  // States
  getStates(): Promise<State[]>;
  createState(state: InsertState): Promise<State>;

  // Cities
  getCities(): Promise<City[]>;
  getCitiesByState(stateId: number): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;

  // Crops
  getCrops(): Promise<Crop[]>;
  getCrop(id: number): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: number, crop: Partial<InsertCrop>): Promise<Crop>;
  deleteCrop(id: number): Promise<void>;

  // Parties
  getParties(): Promise<Party[]>;
  getParty(id: number): Promise<Party | undefined>;
  getPartiesByType(type: string): Promise<Party[]>;
  createParty(party: InsertParty): Promise<Party>;
  updateParty(id: number, party: Partial<InsertParty>): Promise<Party>;
  deleteParty(id: number): Promise<void>;
  updatePartyBalance(id: number, amount: string): Promise<void>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  updateSalePaymentStatus(id: number, status: string): Promise<void>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;

  // Inventory
  getInventory(): Promise<Inventory[]>;
  getInventoryByCrop(cropId: number): Promise<Inventory[]>;
  updateInventory(cropId: number, qualityGrade: string, quantity: string, cost: string): Promise<void>;
  
  // Ledger
  getLedgerEntries(partyId?: number): Promise<LedgerEntry[]>;
  createLedgerEntry(entry: InsertLedgerEntry): Promise<LedgerEntry>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalSales: string;
    totalPurchases: string;
    totalInventoryValue: string;
    totalProfit: string;
    lowStockItems: number;
  }>;

  // Dashboard chart data
  getSalesTrendData(period: string): Promise<Array<{
    date: string;
    sales: number;
    purchases: number;
  }>>;
  
  getCropDistributionData(): Promise<Array<{
    name: string;
    value: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
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
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getStates(): Promise<State[]> {
    return db.select().from(states).orderBy(asc(states.name));
  }

  async createState(state: InsertState): Promise<State> {
    const [newState] = await db.insert(states).values(state).returning();
    return newState;
  }

  async getCities(): Promise<City[]> {
    return db.select().from(cities).orderBy(asc(cities.name));
  }

  async getCitiesByState(stateId: number): Promise<City[]> {
    return db.select().from(cities).where(eq(cities.stateId, stateId)).orderBy(asc(cities.name));
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async getCrops(): Promise<Crop[]> {
    return db.select().from(crops).orderBy(asc(crops.name));
  }

  async getCrop(id: number): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop || undefined;
  }

  async createCrop(crop: InsertCrop): Promise<Crop> {
    const [newCrop] = await db.insert(crops).values(crop).returning();
    return newCrop;
  }

  async updateCrop(id: number, crop: Partial<InsertCrop>): Promise<Crop> {
    const [updatedCrop] = await db
      .update(crops)
      .set(crop)
      .where(eq(crops.id, id))
      .returning();
    return updatedCrop;
  }

  async deleteCrop(id: number): Promise<void> {
    await db.delete(crops).where(eq(crops.id, id));
  }

  async getParties(): Promise<Party[]> {
    return db.select().from(parties).orderBy(asc(parties.name));
  }

  async getParty(id: number): Promise<Party | undefined> {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party || undefined;
  }

  async getPartiesByType(type: string): Promise<Party[]> {
    return db.select().from(parties).where(eq(parties.type, type)).orderBy(asc(parties.name));
  }

  async createParty(party: InsertParty): Promise<Party> {
    const [newParty] = await db.insert(parties).values(party).returning();
    return newParty;
  }

  async updateParty(id: number, party: Partial<InsertParty>): Promise<Party> {
    const [updatedParty] = await db
      .update(parties)
      .set(party)
      .where(eq(parties.id, id))
      .returning();
    return updatedParty;
  }

  async deleteParty(id: number): Promise<void> {
    await db.delete(parties).where(eq(parties.id, id));
  }

  async updatePartyBalance(id: number, amount: string): Promise<void> {
    await db
      .update(parties)
      .set({ balance: amount })
      .where(eq(parties.id, id));
  }

  async getPurchases(): Promise<Purchase[]> {
    return db.select().from(purchases).orderBy(desc(purchases.purchaseDate));
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    
    // Update inventory
    await this.updateInventory(
      purchase.cropId,
      purchase.qualityGrade || 'A',
      purchase.quantity,
      purchase.rate
    );
    
    // Create ledger entry for final amount (including expenses)
    await this.createLedgerEntry({
      partyId: purchase.partyId,
      transactionType: 'purchase',
      transactionId: newPurchase.id,
      credit: purchase.finalAmount || purchase.totalAmount,
      debit: '0',
      balance: '0', // Will be calculated
      description: `Purchase - ${purchase.quantity} units ${purchase.expenseAmount && parseFloat(purchase.expenseAmount) > 0 ? `(incl. expenses: ${purchase.expenseAmount})` : ''}`,
      transactionDate: purchase.purchaseDate,
    });

    return newPurchase;
  }

  async getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]> {
    return db
      .select()
      .from(purchases)
      .where(and(
        gte(purchases.purchaseDate, startDate),
        lte(purchases.purchaseDate, endDate)
      ))
      .orderBy(desc(purchases.purchaseDate));
  }

  async getSales(): Promise<Sale[]> {
    return db.select().from(sales).orderBy(desc(sales.saleDate));
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || undefined;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    
    // Update inventory (reduce stock)
    await this.updateInventory(
      sale.cropId,
      sale.qualityGrade || 'A',
      `-${sale.quantity}`,
      '0'
    );
    
    // Create ledger entry
    await this.createLedgerEntry({
      partyId: sale.partyId,
      transactionType: 'sale',
      transactionId: newSale.id,
      debit: sale.totalAmount,
      credit: '0',
      balance: '0', // Will be calculated
      description: `Sale - ${sale.quantity} units`,
      transactionDate: sale.saleDate,
    });

    return newSale;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return db
      .select()
      .from(sales)
      .where(and(
        gte(sales.saleDate, startDate),
        lte(sales.saleDate, endDate)
      ))
      .orderBy(desc(sales.saleDate));
  }

  async updateSalePaymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(sales)
      .set({ paymentStatus: status })
      .where(eq(sales.id, id));
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    
    // If expense is linked to a purchase, create ledger entry for expense tracking
    if (expense.purchaseId) {
      const purchase = await this.getPurchase(expense.purchaseId);
      if (purchase) {
        await this.createLedgerEntry({
          partyId: purchase.partyId,
          transactionType: 'expense',
          transactionId: newExpense.id,
          debit: expense.amount,
          credit: '0',
          balance: '0', // Will be calculated
          description: `${expense.type} expense - ${expense.description || 'Related to purchase'}`,
          transactionDate: expense.expenseDate,
        });
      }
    }
    
    return newExpense;
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return db
      .select()
      .from(expenses)
      .where(and(
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ))
      .orderBy(desc(expenses.expenseDate));
  }

  async getInventory(): Promise<Inventory[]> {
    return db.select().from(inventory).orderBy(asc(inventory.cropId));
  }

  async getInventoryByCrop(cropId: number): Promise<Inventory[]> {
    return db.select().from(inventory).where(eq(inventory.cropId, cropId));
  }

  async updateInventory(cropId: number, qualityGrade: string, quantity: string, cost: string): Promise<void> {
    const [existingInventory] = await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.cropId, cropId),
        eq(inventory.qualityGrade, qualityGrade)
      ));

    const quantityNum = parseFloat(quantity);
    const costNum = parseFloat(cost);

    if (existingInventory) {
      const currentStock = parseFloat(existingInventory.currentStock || '0');
      const currentCost = parseFloat(existingInventory.averageCost || '0');
      
      const newStock = currentStock + quantityNum;
      const newAvgCost = quantityNum > 0 && costNum > 0 
        ? ((currentStock * currentCost) + (quantityNum * costNum)) / newStock
        : currentCost;
      const newTotalValue = newStock * newAvgCost;

      await db
        .update(inventory)
        .set({
          currentStock: newStock.toString(),
          averageCost: newAvgCost.toString(),
          totalValue: newTotalValue.toString(),
          lastUpdated: new Date(),
        })
        .where(eq(inventory.id, existingInventory.id));
    } else if (quantityNum > 0) {
      await db.insert(inventory).values({
        cropId,
        qualityGrade,
        currentStock: quantity,
        averageCost: cost,
        totalValue: (quantityNum * costNum).toString(),
      });
    }
  }

  async getLedgerEntries(partyId?: number): Promise<LedgerEntry[]> {
    const query = db.select().from(ledgerEntries);
    
    if (partyId) {
      return query.where(eq(ledgerEntries.partyId, partyId)).orderBy(desc(ledgerEntries.transactionDate));
    }
    
    return query.orderBy(desc(ledgerEntries.transactionDate));
  }

  async createLedgerEntry(entry: InsertLedgerEntry): Promise<LedgerEntry> {
    // Calculate running balance
    const [lastEntry] = await db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.partyId, entry.partyId))
      .orderBy(desc(ledgerEntries.transactionDate))
      .limit(1);

    const lastBalance = parseFloat(lastEntry?.balance || '0');
    const debit = parseFloat(entry.debit || '0');
    const credit = parseFloat(entry.credit || '0');
    const newBalance = lastBalance + debit - credit;

    const [newEntry] = await db
      .insert(ledgerEntries)
      .values({ ...entry, balance: newBalance.toString() })
      .returning();

    // Update party balance
    await this.updatePartyBalance(entry.partyId, newBalance.toString());

    return newEntry;
  }

  async getDashboardMetrics(): Promise<{
    totalSales: string;
    totalPurchases: string;
    totalInventoryValue: string;
    totalProfit: string;
    lowStockItems: number;
  }> {
    try {
      // Use raw SQL queries for SQLite compatibility
      const salesResult = sqlite.prepare('SELECT SUM(total_amount) as total FROM sales').get() as { total: number | null };
      const purchasesResult = sqlite.prepare('SELECT SUM(total_amount) as total FROM purchases').get() as { total: number | null };
      const inventoryResult = sqlite.prepare('SELECT SUM(total_value) as total FROM inventory').get() as { total: number | null };
      const expensesResult = sqlite.prepare('SELECT SUM(amount) as total FROM expenses').get() as { total: number | null };
      const lowStockResult = sqlite.prepare('SELECT COUNT(*) as count FROM inventory WHERE current_stock < 50').get() as { count: number };

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
        lowStockItems: lowStockResult?.count || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        totalSales: '0',
        totalPurchases: '0',
        totalInventoryValue: '0',
        totalProfit: '0',
        lowStockItems: 0,
      };
    }
  }

  async getSalesTrendData(period: string): Promise<Array<{ date: string; sales: number; purchases: number; }>> {
    try {
      let daysBack = 7;
      if (period === "30days") daysBack = 30;
      else if (period === "3months") daysBack = 90;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      // Get daily aggregated data
      const salesData = sqlite.prepare(`
        SELECT 
          DATE(sale_date) as date,
          SUM(total_amount) as total
        FROM sales
        WHERE sale_date >= ?
        GROUP BY DATE(sale_date)
        ORDER BY DATE(sale_date)
      `).all(startDate.toISOString().split('T')[0]) as Array<{ date: string; total: number }>;

      const purchasesData = sqlite.prepare(`
        SELECT 
          DATE(purchase_date) as date,
          SUM(total_amount) as total
        FROM purchases
        WHERE purchase_date >= ?
        GROUP BY DATE(purchase_date)
        ORDER BY DATE(purchase_date)
      `).all(startDate.toISOString().split('T')[0]) as Array<{ date: string; total: number }>;

      // Create a map for easier lookup
      const salesMap = new Map(salesData.map(s => [s.date, s.total || 0]));
      const purchasesMap = new Map(purchasesData.map(p => [p.date, p.total || 0]));

      // Generate all dates in range
      const result = [];
      for (let i = 0; i < daysBack; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (daysBack - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        result.push({
          date: dateStr,
          sales: salesMap.get(dateStr) || 0,
          purchases: purchasesMap.get(dateStr) || 0,
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching sales trend data:', error);
      return [];
    }
  }

  async getCropDistributionData(): Promise<Array<{ name: string; value: number; }>> {
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
      `).all() as Array<{ name: string; value: number }>;

      return result.map(row => ({
        name: row.name,
        value: parseFloat(row.value?.toString() || '0'),
      }));
    } catch (error) {
      console.error('Error fetching crop distribution data:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
