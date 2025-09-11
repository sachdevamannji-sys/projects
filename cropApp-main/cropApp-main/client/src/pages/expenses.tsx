import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Receipt, Search, Download, DollarSign, Calendar, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import Header from "@/components/layout/header";
import { Expense, Purchase, Sale } from "@/lib/types";

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    amount: "",
    purchaseId: "",
    saleId: "",
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    queryFn: async () => {
      const response = await fetch("/api/expenses", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch expenses");
      return response.json();
    },
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
    queryFn: async () => {
      const response = await fetch("/api/purchases", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch purchases");
      return response.json();
    },
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    queryFn: async () => {
      const response = await fetch("/api/sales", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (expenseData: any) => apiRequest("/api/expenses", "POST", expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });
      setShowForm(false);
      setFormData({
        type: "",
        description: "",
        amount: "",
        purchaseId: "",
        saleId: "",
        expenseDate: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record expense",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      type: formData.type,
      description: formData.description,
      amount: formData.amount,
      purchaseId: formData.purchaseId && formData.purchaseId !== "none" ? parseInt(formData.purchaseId) : undefined,
      saleId: formData.saleId && formData.saleId !== "none" ? parseInt(formData.saleId) : undefined,
      expenseDate: formData.expenseDate,
    };

    createExpenseMutation.mutate(data);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = !searchTerm || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || expense.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const transportExpenses = expenses.filter(exp => exp.type === 'transport').reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const storageExpenses = expenses.filter(exp => exp.type === 'storage').reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const otherExpenses = expenses.filter(exp => exp.type === 'other').reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case 'transport':
        return { label: 'Transport', color: 'bg-blue-100 text-blue-800' };
      case 'storage':
        return { label: 'Storage', color: 'bg-green-100 text-green-800' };
      case 'labor':
        return { label: 'Labor', color: 'bg-purple-100 text-purple-800' };
      case 'processing':
        return { label: 'Processing', color: 'bg-amber-100 text-amber-800' };
      case 'other':
        return { label: 'Other', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const exportToCSV = () => {
    const csvData = filteredExpenses.map(expense => {
      const expenseType = getExpenseTypeLabel(expense.type);
      
      return {
        'Date': new Date(expense.expenseDate).toLocaleDateString(),
        'Type': expenseType.label,
        'Description': expense.description || 'N/A',
        'Amount': expense.amount,
        'Purchase ID': expense.purchaseId || 'N/A',
        'Sale ID': expense.saleId || 'N/A',
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (expensesLoading) {
    return (
      <div>
        <Header title="Expense Management" subtitle="Track and categorize business expenses" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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

  return (
    <div>
      <Header title="Expense Management" subtitle="Track and categorize business expenses" />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-slate-500 mt-1">All time expenses</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Transport Costs</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(transportExpenses)}</p>
                <p className="text-xs text-slate-500 mt-1">Transportation expenses</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Storage Costs</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(storageExpenses)}</p>
                <p className="text-xs text-slate-500 mt-1">Storage and handling</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Other Expenses</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(otherExpenses)}</p>
                <p className="text-xs text-slate-500 mt-1">Miscellaneous costs</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Record New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Expense Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                    Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="purchaseId" className="text-sm font-medium text-slate-700">
                    Related Purchase (Optional)
                  </Label>
                  <Select value={formData.purchaseId} onValueChange={(value) => setFormData({...formData, purchaseId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purchase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {purchases.map((purchase) => (
                        <SelectItem key={purchase.id} value={purchase.id.toString()}>
                          Purchase #{purchase.id} - {formatCurrency(purchase.totalAmount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="saleId" className="text-sm font-medium text-slate-700">
                    Related Sale (Optional)
                  </Label>
                  <Select value={formData.saleId} onValueChange={(value) => setFormData({...formData, saleId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {sales.map((sale) => (
                        <SelectItem key={sale.id} value={sale.id.toString()}>
                          Sale #{sale.id} - {formatCurrency(sale.totalAmount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expenseDate" className="text-sm font-medium text-slate-700">
                    Expense Date *
                  </Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createExpenseMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createExpenseMutation.isPending ? "Recording..." : "Record Expense"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Expense Records</CardTitle>
              <p className="text-slate-600 mt-1">Track all business expenses</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by description or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Sale ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Receipt className="w-12 h-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 mb-2">No expenses recorded yet</p>
                        <p className="text-sm text-slate-500">Click "Add Expense" to record your first expense</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => {
                    const expenseType = getExpenseTypeLabel(expense.type);
                    
                    return (
                      <TableRow key={expense.id} className="hover:bg-slate-50">
                        <TableCell className="text-slate-600">
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={expenseType.color}>
                            {expenseType.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-900">
                          {expense.description || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {expense.purchaseId ? `#${expense.purchaseId}` : '-'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {expense.saleId ? `#${expense.saleId}` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
