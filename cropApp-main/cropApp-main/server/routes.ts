import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import {
  insertUserSchema, insertStateSchema, insertCitySchema, insertCropSchema,
  insertPartySchema, insertPurchaseSchema, insertSaleSchema, insertExpenseSchema
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
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
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // States routes
  app.get("/api/states", authenticateToken, async (req, res) => {
    try {
      const states = await storage.getStates();
      res.json(states);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.post("/api/states", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stateData = insertStateSchema.parse(req.body);
      const state = await storage.createState(stateData);
      res.status(201).json(state);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Cities routes
  app.get("/api/cities", authenticateToken, async (req, res) => {
    try {
      const { stateId } = req.query;
      const cities = stateId 
        ? await storage.getCitiesByState(parseInt(stateId as string))
        : await storage.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.post("/api/cities", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const cityData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(cityData);
      res.status(201).json(city);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Crops routes
  app.get("/api/crops", authenticateToken, async (req, res) => {
    try {
      const crops = await storage.getCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });

  app.post("/api/crops", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const cropData = insertCropSchema.parse(req.body);
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put("/api/crops/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cropData = insertCropSchema.partial().parse(req.body);
      const crop = await storage.updateCrop(id, cropData);
      res.json(crop);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/crops/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCrop(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });

  // Parties routes
  app.get("/api/parties", authenticateToken, async (req, res) => {
    try {
      const { type } = req.query;
      const parties = type 
        ? await storage.getPartiesByType(type as string)
        : await storage.getParties();
      res.json(parties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });

  app.post("/api/parties", authenticateToken, async (req, res) => {
    try {
      const partyData = insertPartySchema.parse(req.body);
      const party = await storage.createParty(partyData);
      res.status(201).json(party);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put("/api/parties/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partyData = insertPartySchema.partial().parse(req.body);
      const party = await storage.updateParty(id, partyData);
      res.json(party);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/parties/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteParty(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete party" });
    }
  });

  // Purchases routes
  app.get("/api/purchases", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const purchases = startDate && endDate
        ? await storage.getPurchasesByDateRange(new Date(startDate as string), new Date(endDate as string))
        : await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", authenticateToken, async (req, res) => {
    try {
      // Convert date string to Date object before validation
      const processedBody = {
        ...req.body,
        purchaseDate: new Date(req.body.purchaseDate),
        moistureContent: req.body.moistureContent || undefined,
        qualityGrade: req.body.qualityGrade || undefined,
        expenseAmount: req.body.expenseAmount || "0",
        finalAmount: req.body.finalAmount || req.body.totalAmount,
      };
      
      const purchaseData = insertPurchaseSchema.parse(processedBody);
      const purchase = await storage.createPurchase(purchaseData);
      
      // Create expenses if provided
      if (req.body.expenses && Array.isArray(req.body.expenses)) {
        for (const expense of req.body.expenses) {
          if (expense.type && expense.amount) {
            await storage.createExpense({
              type: expense.type,
              description: `${expense.type} expense for Purchase #${purchase.id}`,
              amount: expense.amount,
              purchaseId: purchase.id,
              expenseDate: new Date(req.body.purchaseDate),
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

  // Sales routes
  app.get("/api/sales", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const sales = startDate && endDate
        ? await storage.getSalesByDateRange(new Date(startDate as string), new Date(endDate as string))
        : await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", authenticateToken, async (req, res) => {
    try {
      // Convert date string to Date object before validation
      const processedBody = {
        ...req.body,
        saleDate: new Date(req.body.saleDate),
        qualityGrade: req.body.qualityGrade || undefined,
      };
      
      const saleData = insertSaleSchema.parse(processedBody);
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      console.error("Sale validation error:", error);
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  app.put("/api/sales/:id/payment", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateSalePaymentStatus(id, status);
      res.json({ message: "Payment status updated" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Expenses routes
  app.get("/api/expenses", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses = startDate && endDate
        ? await storage.getExpensesByDateRange(new Date(startDate as string), new Date(endDate as string))
        : await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", authenticateToken, async (req, res) => {
    try {
      // Convert date string to Date object before validation
      const processedBody = {
        ...req.body,
        expenseDate: new Date(req.body.expenseDate),
        purchaseId: req.body.purchaseId || undefined,
        saleId: req.body.saleId || undefined,
      };
      
      const expenseData = insertExpenseSchema.parse(processedBody);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Expense validation error:", error);
      res.status(400).json({ message: "Invalid input", error: error.message });
    }
  });

  // Inventory routes
  app.get("/api/inventory", authenticateToken, async (req, res) => {
    try {
      const { cropId } = req.query;
      const inventory = cropId 
        ? await storage.getInventoryByCrop(parseInt(cropId as string))
        : await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Ledger routes
  app.get("/api/ledger", authenticateToken, async (req, res) => {
    try {
      const { partyId } = req.query;
      const entries = partyId 
        ? await storage.getLedgerEntries(parseInt(partyId as string))
        : await storage.getLedgerEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ledger entries" });
    }
  });

  // Dashboard chart data routes
  app.get("/api/dashboard/sales-trend", authenticateToken, async (req, res) => {
    try {
      const { period = "7days" } = req.query;
      const data = await storage.getSalesTrendData(period as string);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales trend data" });
    }
  });

  app.get("/api/dashboard/crop-distribution", authenticateToken, async (req, res) => {
    try {
      const data = await storage.getCropDistributionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crop distribution data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
