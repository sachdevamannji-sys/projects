import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ShoppingCart, Search, Download, Edit, Trash2, User, Package, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import Header from "@/components/layout/header";
import { Sale, Party, Crop } from "@/lib/types";

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    partyId: "",
    cropId: "",
    quantity: "",
    rate: "",
    qualityGrade: "",
    paymentStatus: "pending",
    saleDate: new Date().toISOString().split('T')[0],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    queryFn: async () => {
      const response = await fetch("/api/sales", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  const { data: parties = [] } = useQuery<Party[]>({
    queryKey: ["/api/parties"],
    queryFn: async () => {
      const response = await fetch("/api/parties", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch parties");
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

  const createSaleMutation = useMutation({
    mutationFn: (saleData: any) => apiRequest("/api/sales", "POST", saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ledger"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
      setShowForm(false);
      setFormData({
        partyId: "",
        cropId: "",
        quantity: "",
        rate: "",
        qualityGrade: "",
        paymentStatus: "pending",
        saleDate: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record sale",
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

    const data = {
      partyId: parseInt(formData.partyId),
      cropId: parseInt(formData.cropId),
      quantity: formData.quantity,
      rate: formData.rate,
      totalAmount: totalAmount.toString(),
      qualityGrade: formData.qualityGrade || undefined,
      paymentStatus: formData.paymentStatus,
      saleDate: formData.saleDate,
    };

    createSaleMutation.mutate(data);
  };

  const filteredSales = sales.filter((sale) => {
    const party = parties.find(p => p.id === sale.partyId);
    const crop = crops.find(c => c.id === sale.cropId);
    
    const matchesSearch = !searchTerm || 
      party?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesParty = selectedParty === "all" || sale.partyId.toString() === selectedParty;
    const matchesStatus = selectedStatus === "all" || sale.paymentStatus === selectedStatus;
    
    return matchesSearch && matchesParty && matchesStatus;
  });

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + parseFloat(sale.quantity), 0);
  const pendingSales = sales.filter(sale => sale.paymentStatus === 'pending');
  const paidSales = sales.filter(sale => sale.paymentStatus === 'paid');

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const exportToCSV = () => {
    const csvData = filteredSales.map(sale => {
      const party = parties.find(p => p.id === sale.partyId);
      const crop = crops.find(c => c.id === sale.cropId);
      
      return {
        'Date': new Date(sale.saleDate).toLocaleDateString(),
        'Party': party?.name || 'Unknown Party',
        'Crop': crop?.name || 'Unknown Crop',
        'Quantity': parseFloat(sale.quantity).toLocaleString(),
        'Rate': sale.rate,
        'Total Amount': sale.totalAmount,
        'Quality Grade': sale.qualityGrade || 'N/A',
        'Payment Status': sale.paymentStatus,
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (salesLoading) {
    return (
      <div>
        <Header title="Sales Management" subtitle="Manage sales to traders and exporters" />
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
      <Header title="Sales Management" subtitle="Manage sales to traders and exporters" />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
                <p className="text-xs text-slate-500 mt-1">All time sales</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Quantity</p>
                <p className="text-2xl font-bold text-slate-900">{totalQuantity.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Quintals sold</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                <p className="text-2xl font-bold text-slate-900">{pendingSales.length}</p>
                <p className="text-xs text-slate-500 mt-1">Awaiting payment</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed Sales</p>
                <p className="text-2xl font-bold text-slate-900">{paidSales.length}</p>
                <p className="text-xs text-slate-500 mt-1">Paid transactions</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Record New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="partyId" className="text-sm font-medium text-slate-700">
                    Customer/Trader *
                  </Label>
                  <Select value={formData.partyId} onValueChange={(value) => setFormData({...formData, partyId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.filter(p => p.type === 'trader' || p.type === 'exporter').map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name} ({party.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cropId" className="text-sm font-medium text-slate-700">
                    Crop *
                  </Label>
                  <Select value={formData.cropId} onValueChange={(value) => setFormData({...formData, cropId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id.toString()}>
                          {crop.name} ({crop.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="rate" className="text-sm font-medium text-slate-700">
                    Rate per Unit *
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="Enter rate"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="qualityGrade" className="text-sm font-medium text-slate-700">
                    Quality Grade
                  </Label>
                  <Select value={formData.qualityGrade} onValueChange={(value) => setFormData({...formData, qualityGrade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentStatus" className="text-sm font-medium text-slate-700">
                    Payment Status *
                  </Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({...formData, paymentStatus: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="saleDate" className="text-sm font-medium text-slate-700">
                    Sale Date *
                  </Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Total Amount
                  </Label>
                  <div className="mt-1 p-3 bg-slate-50 rounded-md">
                    <span className="text-lg font-semibold text-slate-900">
                      {formData.quantity && formData.rate ? 
                        formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.rate)) : 
                        "₹0.00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSaleMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createSaleMutation.isPending ? "Recording..." : "Record Sale"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Sales Records</CardTitle>
              <p className="text-slate-600 mt-1">Track all sales transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Sale
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by party or crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id.toString()}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
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
                  <TableHead>Party</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Quality Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="w-12 h-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 mb-2">No sales recorded yet</p>
                        <p className="text-sm text-slate-500">Click "Add Sale" to record your first sale</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => {
                    const party = parties.find(p => p.id === sale.partyId);
                    const crop = crops.find(c => c.id === sale.cropId);
                    
                    return (
                      <TableRow key={sale.id} className="hover:bg-slate-50">
                        <TableCell className="text-slate-600">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{party?.name || 'Unknown Party'}</p>
                              <p className="text-xs text-slate-500 capitalize">{party?.type}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium text-slate-900">{crop?.name || 'Unknown Crop'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {parseFloat(sale.quantity).toLocaleString()} {crop?.unit || 'Quintals'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatCurrency(sale.rate)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              sale.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {sale.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {sale.qualityGrade || 'N/A'}
                          </Badge>
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
