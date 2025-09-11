import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthHeaders } from "@/lib/auth";
import { DashboardMetrics } from "@/lib/types";
import SalesChart from "@/components/charts/sales-chart";
import CropChart from "@/components/charts/crop-chart";
import {
  TrendingUp,
  ShoppingCart,
  Warehouse,
  DollarSign,
  ArrowUpIcon,
  ArrowDownIcon,
  User,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/metrics", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metrics ? formatCurrency(metrics.totalSales) : "₹0"}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Purchases</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metrics ? formatCurrency(metrics.totalPurchases) : "₹0"}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inventory Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metrics ? formatCurrency(metrics.totalInventoryValue) : "₹0"}
                </p>
                <p className="text-xs text-amber-600 mt-1 flex items-center">
                  <ArrowDownIcon className="w-3 h-3 mr-1" />
                  {metrics?.lowStockItems || 0} low stock items
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Net Profit</p>
                <p className="text-2xl font-bold text-slate-900">
                  {metrics ? formatCurrency(metrics.totalProfit) : "₹0"}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  +15.8% margin
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <CropChart />
      </div>

      {/* Recent Transactions & Outstanding Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Transactions</CardTitle>
              <Badge variant="outline">View All</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowUpIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">No recent transactions</p>
                    <p className="text-xs text-slate-500">Start by adding purchases or sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">₹0</p>
                  <p className="text-xs text-slate-500">-</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Outstanding Balances</CardTitle>
              <Badge variant="outline">Manage</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">No outstanding balances</p>
                    <p className="text-xs text-slate-500">All payments are up to date</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">₹0</p>
                  <p className="text-xs text-slate-500">-</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
