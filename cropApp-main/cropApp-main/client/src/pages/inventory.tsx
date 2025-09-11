import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Download, Plus, Warehouse, Wheat, TriangleAlert, DollarSign } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import Header from "@/components/layout/header";
import { InventoryItem, Crop } from "@/lib/types";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const response = await fetch("/api/inventory", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch inventory");
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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getStockStatus = (stock: string) => {
    const stockValue = parseFloat(stock);
    if (stockValue === 0) return { status: "out-of-stock", label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stockValue < 50) return { status: "low-stock", label: "Low Stock", color: "bg-amber-100 text-amber-800" };
    return { status: "in-stock", label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const filteredInventory = inventory.filter((item) => {
    const crop = crops.find(c => c.id === item.cropId);
    const cropName = crop?.name?.toLowerCase() || "";
    const matchesSearch = cropName.includes(searchTerm.toLowerCase());
    
    const stockStatus = getStockStatus(item.currentStock);
    const matchesStatus = selectedStatus === "all" || stockStatus.status === selectedStatus;
    
    const matchesCrop = selectedCrop === "all" || item.cropId.toString() === selectedCrop;
    
    return matchesSearch && matchesStatus && matchesCrop;
  });

  // Calculate summary metrics
  const totalStock = inventory.reduce((sum, item) => sum + parseFloat(item.currentStock || '0'), 0);
  const totalValue = inventory.reduce((sum, item) => sum + parseFloat(item.totalValue || '0'), 0);
  const lowStockItems = inventory.filter(item => parseFloat(item.currentStock || '0') < 50).length;
  const uniqueCrops = new Set(inventory.map(item => item.cropId)).size;

  // Export functionality
  const exportToCSV = () => {
    const csvData = filteredInventory.map(item => {
      const crop = crops.find(c => c.id === item.cropId);
      const stockStatus = getStockStatus(item.currentStock);
      
      return {
        'Crop Name': crop?.name || 'Unknown Crop',
        'Quality Grade': item.qualityGrade || 'N/A',
        'Current Stock': parseFloat(item.currentStock || '0').toLocaleString(),
        'Unit': crop?.unit || 'Quintals',
        'Average Cost': item.averageCost || '0',
        'Total Value': item.totalValue || '0',
        'Stock Status': stockStatus.label,
        'Last Updated': new Date(item.lastUpdated).toLocaleDateString()
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (inventoryLoading) {
    return (
      <div>
        <Header title="Inventory Management" subtitle="Monitor stock levels and valuations" />
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
      <Header title="Inventory Management" subtitle="Monitor stock levels and valuations" />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Stock</p>
                <p className="text-2xl font-bold text-slate-900">{totalStock.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Quintals</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Crop Types</p>
                <p className="text-2xl font-bold text-slate-900">{uniqueCrops}</p>
                <p className="text-xs text-slate-500 mt-1">Different crops</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wheat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Low Stock Alert</p>
                <p className="text-2xl font-bold text-slate-900">{lowStockItems}</p>
                <p className="text-xs text-slate-500 mt-1">Items below threshold</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TriangleAlert className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue.toString())}</p>
                <p className="text-xs text-slate-500 mt-1">Current market value</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Current Inventory</CardTitle>
              <p className="text-slate-600 mt-1">Real-time stock levels and valuations</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Adjust Stock
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Search Crop</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by crop name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Stock Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Crop Type</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id.toString()}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Avg. Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Warehouse className="w-12 h-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 mb-2">No inventory items found</p>
                        <p className="text-sm text-slate-500">Start recording purchases to build your inventory</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const crop = crops.find(c => c.id === item.cropId);
                    const stockStatus = getStockStatus(item.currentStock);
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Wheat className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium text-slate-900">{crop?.name || 'Unknown Crop'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.qualityGrade || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {parseFloat(item.currentStock || '0').toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {crop?.unit || 'Quintals'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatCurrency(item.averageCost || '0')}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {formatCurrency(item.totalValue || '0')}
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(item.lastUpdated).toLocaleDateString()}
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
