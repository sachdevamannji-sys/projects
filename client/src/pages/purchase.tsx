import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Save, X, Clock } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Party, Crop, Purchase } from "@/lib/types";

export default function PurchasePage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    partyId: "",
    cropId: "",
    quantity: "",
    rate: "",
    qualityGrade: "",
    moistureContent: "",
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [expenses, setExpenses] = useState([
    { type: "", amount: "" }
  ]);

  const { data: farmers = [] } = useQuery<Party[]>({
    queryKey: ["/api/parties", { type: "farmer" }],
    queryFn: async () => {
      const response = await fetch("/api/parties?type=farmer", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch farmers");
      return response.json();
    },
  });

  const { data: crops = [] } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    queryFn: async () => {
      const response = await fetch("/api/crops", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch crops");
      return response.json();
    },
  });

  const { data: recentPurchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
    queryFn: async () => {
      const response = await fetch("/api/purchases", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch purchases");
      return response.json();
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create purchase");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setFormData({
        partyId: "",
        cropId: "",
        quantity: "",
        rate: "",
        qualityGrade: "",
        moistureContent: "",
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      setExpenses([{ type: "", amount: "" }]);
      toast({
        title: "Success",
        description: "Purchase recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record purchase",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partyId || !formData.cropId || !formData.quantity || !formData.rate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const rate = parseFloat(formData.rate);
    const totalAmount = quantity * rate;
    const totalExpenseAmount = calculateTotalExpenses();

    const data = {
      partyId: parseInt(formData.partyId),
      cropId: parseInt(formData.cropId),
      quantity: formData.quantity,
      rate: formData.rate,
      totalAmount: totalAmount.toString(),
      expenseAmount: totalExpenseAmount.toString(),
      finalAmount: (totalAmount + totalExpenseAmount).toString(),
      qualityGrade: formData.qualityGrade || undefined,
      moistureContent: formData.moistureContent ? formData.moistureContent : undefined,
      purchaseDate: formData.purchaseDate,
      expenses: expenses.filter(exp => exp.type && exp.amount),
    };

    createPurchaseMutation.mutate(data);
  };

  const addExpense = () => {
    setExpenses([...expenses, { type: "", amount: "" }]);
  };

  const removeExpense = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const updateExpense = (index: number, field: string, value: string) => {
    const updated = expenses.map((expense, i) => 
      i === index ? { ...expense, [field]: value } : expense
    );
    setExpenses(updated);
  };

  const calculateSubtotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return quantity * rate;
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => {
      return total + (parseFloat(expense.amount) || 0);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div>
      <Header title="Purchase Management" subtitle="Record crop purchases from farmers" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">New Purchase</CardTitle>
              <p className="text-slate-600">Record crop purchase from farmers</p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partyId">Select Farmer *</Label>
                    <Select value={formData.partyId} onValueChange={(value) => setFormData({ ...formData, partyId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a farmer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id.toString()}>
                            {farmer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cropId">Crop Type *</Label>
                    <Select value={formData.cropId} onValueChange={(value) => setFormData({ ...formData, cropId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop..." />
                      </SelectTrigger>
                      <SelectContent>
                        {crops.map((crop) => (
                          <SelectItem key={crop.id} value={crop.id.toString()}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity (Quintals) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.001"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rate">Rate per Quintal (₹) *</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualityGrade">Quality Grade</Label>
                    <Select value={formData.qualityGrade} onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A</SelectItem>
                        <SelectItem value="B">Grade B</SelectItem>
                        <SelectItem value="C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="moistureContent">Moisture Content (%)</Label>
                    <Input
                      id="moistureContent"
                      type="number"
                      step="0.1"
                      value={formData.moistureContent}
                      onChange={(e) => setFormData({ ...formData, moistureContent: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-800">Associated Expenses</h3>
                    <Button type="button" variant="outline" onClick={addExpense}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {expenses.map((expense, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Expense Type</Label>
                          <Select 
                            value={expense.type} 
                            onValueChange={(value) => updateExpense(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="transportation">Transportation</SelectItem>
                              <SelectItem value="labor">Labor</SelectItem>
                              <SelectItem value="storage">Storage</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Amount (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={expense.amount}
                            onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => removeExpense(index)}
                            disabled={expenses.length === 1}
                            className="w-full"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Calculation */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Total Expenses:</span>
                    <span className="font-medium">{formatCurrency(calculateTotalExpenses())}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(calculateSubtotal() + calculateTotalExpenses())}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createPurchaseMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createPurchaseMutation.isPending ? "Recording..." : "Record Purchase"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        partyId: "",
                        cropId: "",
                        quantity: "",
                        rate: "",
                        qualityGrade: "",
                        moistureContent: "",
                        purchaseDate: new Date().toISOString().split('T')[0],
                      });
                      setExpenses([{ type: "", amount: "" }]);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {recentPurchases.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">No recent purchases</p>
                  <p className="text-xs mt-1">Record your first purchase to see it here</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {recentPurchases.slice(0, 10).map((purchase) => {
                    const farmer = farmers.find(f => f.id === purchase.partyId);
                    const crop = crops.find(c => c.id === purchase.cropId);
                    
                    return (
                      <div key={purchase.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-slate-900">{farmer?.name || 'Unknown Farmer'}</span>
                          <span className="text-sm text-slate-500">
                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {crop?.name || 'Unknown Crop'} - {purchase.quantity} Quintals
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">
                            ₹{parseFloat(purchase.rate).toLocaleString()}/quintal
                          </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(parseFloat(purchase.totalAmount))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
