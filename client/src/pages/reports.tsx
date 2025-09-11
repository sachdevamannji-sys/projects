import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  ShoppingCart, 
  Calculator, 
  FileText, 
  Search, 
  FileDown, 
  Download,
  TrendingUp,
  Package,
  DollarSign,
  Hash
} from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import Header from "@/components/layout/header";
import { Sale, Purchase, Party, Crop } from "@/lib/types";

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedParty, setSelectedParty] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/sales?startDate=${startDate}&endDate=${endDate}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch sales");
      return response.json();
    },
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/purchases?startDate=${startDate}&endDate=${endDate}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch purchases");
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

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const generateReport = () => {
    // This would trigger the actual report generation
    console.log('Generating report with filters:', {
      reportType,
      startDate,
      endDate,
      selectedParty,
      selectedCrop
    });
  };

  const getFilteredData = () => {
    const data = reportType === "sales" ? sales : purchases;
    return data.filter(item => {
      const party = parties.find(p => p.id === item.partyId);
      const crop = crops.find(c => c.id === item.cropId);
      
      const matchesParty = selectedParty === "all" || item.partyId.toString() === selectedParty;
      const matchesCrop = selectedCrop === "all" || item.cropId.toString() === selectedCrop;
      const matchesSearch = !searchTerm || 
        party?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.totalAmount.toString().includes(searchTerm) ||
        item.quantity.toString().includes(searchTerm) ||
        item.rate.toString().includes(searchTerm);
      
      return matchesParty && matchesCrop && matchesSearch;
    });
  };

  const calculateSummary = () => {
    const data = getFilteredData();
    const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
    const totalQuantity = data.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    const avgRate = data.length > 0 ? totalAmount / totalQuantity : 0;
    
    return {
      totalAmount,
      totalQuantity,
      transactions: data.length,
      avgRate
    };
  };

  const summary = calculateSummary();

  // Export functionality
  const exportToCSV = () => {
    const data = getFilteredData();
    const csvData = data.map(item => {
      const party = parties.find(p => p.id === item.partyId);
      const crop = crops.find(c => c.id === item.cropId);
      const date = new Date(reportType === "sales" ? (item as Sale).saleDate : (item as Purchase).purchaseDate);
      
      return {
        'Date': date.toLocaleDateString(),
        'Party': party?.name || 'Unknown Party',
        'Party Type': party?.type || 'Unknown',
        'Crop': crop?.name || 'Unknown Crop',
        'Quantity': parseFloat(item.quantity).toLocaleString(),
        'Rate': item.rate,
        'Total Amount': item.totalAmount,
        ...(reportType === "sales" && { 'Payment Status': (item as Sale).paymentStatus || 'N/A' }),
        ...(reportType === "purchases" && { 'Quality Grade': (item as Purchase).qualityGrade || 'N/A' }),
        ...(reportType === "purchases" && { 'Moisture Content': (item as Purchase).moistureContent || 'N/A' })
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${startDate}_to_${endDate}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    // For now, we'll use the same CSV export
    // In a real implementation, you'd use a library like jsPDF
    exportToCSV();
  };

  return (
    <div>
      <Header title="Reports & Analytics" subtitle="Generate detailed business reports" />
      
      {/* Report Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setReportType("sales")}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Sales Report</h3>
                <p className="text-sm text-slate-600">View sales analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setReportType("purchases")}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Purchase Report</h3>
                <p className="text-sm text-slate-600">Track purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">P&L Statement</h3>
                <p className="text-sm text-slate-600">Profit & loss analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Custom Report</h3>
                <p className="text-sm text-slate-600">Generate custom reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Report Generator</CardTitle>
              <p className="text-slate-600 mt-1">Generate detailed reports with custom filters</p>
            </div>
          </div>
        </CardHeader>

        {/* Report Filters */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-slate-700 mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search parties, crops, amounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Summary</SelectItem>
                  <SelectItem value="purchases">Purchase Summary</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="ledger">Party Ledger</SelectItem>
                  <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Date From</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Date To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Party</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label className="text-sm font-medium text-slate-700 mb-2">Crop</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id.toString()}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Search className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </div>

        {/* Report Results */}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {reportType === "sales" ? "Sales Summary Report" : "Purchase Summary Report"}
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={exportToPDF}>
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" className="text-green-600 hover:text-green-700" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total {reportType === "sales" ? "Sales" : "Purchases"}</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total Quantity</p>
                    <p className="text-xl font-bold text-slate-900">{summary.totalQuantity.toLocaleString()} Quintals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Hash className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Transactions</p>
                    <p className="text-xl font-bold text-slate-900">{summary.transactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-slate-600">Avg. Rate</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.avgRate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  {reportType === "sales" && <TableHead>Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={reportType === "sales" ? 7 : 6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 mb-2">No data found for the selected filters</p>
                        <p className="text-sm text-slate-500">Try adjusting your filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  getFilteredData().map((item) => {
                    const party = parties.find(p => p.id === item.partyId);
                    const crop = crops.find(c => c.id === item.cropId);
                    const date = new Date(reportType === "sales" ? (item as Sale).saleDate : (item as Purchase).purchaseDate);
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="text-slate-600">
                          {date.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {party?.name || 'Unknown Party'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {crop?.name || 'Unknown Crop'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {parseFloat(item.quantity).toLocaleString()} Quintals
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatCurrency(item.rate)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {formatCurrency(item.totalAmount)}
                        </TableCell>
                        {reportType === "sales" && (
                          <TableCell>
                            <Badge className={
                              (item as Sale).paymentStatus === "paid" 
                                ? "bg-green-100 text-green-800"
                                : (item as Sale).paymentStatus === "partial"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }>
                              {(item as Sale).paymentStatus}
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Report Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-900">
                  Total: {formatCurrency(summary.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
