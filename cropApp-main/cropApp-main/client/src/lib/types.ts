export interface DashboardMetrics {
  totalSales: string;
  totalPurchases: string;
  totalInventoryValue: string;
  totalProfit: string;
  lowStockItems: number;
}

export interface Party {
  id: number;
  name: string;
  type: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  aadharNumber?: string;
  cityId?: number;
  stateId?: number;
  balance: string;
  createdAt: string;
}

export interface Crop {
  id: number;
  name: string;
  unit: string;
  basePrice?: string;
  createdAt: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  createdAt: string;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
  createdAt: string;
}

export interface Purchase {
  id: number;
  partyId: number;
  cropId: number;
  quantity: string;
  rate: string;
  totalAmount: string;
  expenseAmount: string;
  finalAmount: string;
  qualityGrade?: string;
  moistureContent?: string;
  purchaseDate: string;
  createdAt: string;
}

export interface Sale {
  id: number;
  partyId: number;
  cropId: number;
  quantity: string;
  rate: string;
  totalAmount: string;
  qualityGrade?: string;
  saleDate: string;
  paymentStatus: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  type: string;
  description?: string;
  amount: string;
  purchaseId?: number;
  saleId?: number;
  expenseDate: string;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  cropId: number;
  qualityGrade?: string;
  currentStock: string;
  averageCost: string;
  totalValue: string;
  lastUpdated: string;
}

export interface LedgerEntry {
  id: number;
  partyId: number;
  transactionType: string;
  transactionId?: number;
  debit: string;
  credit: string;
  balance: string;
  description?: string;
  transactionDate: string;
  createdAt: string;
}
