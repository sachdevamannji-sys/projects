import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Book, Download, User, TrendingUp, TrendingDown } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import Header from "@/components/layout/header";
import { LedgerEntry, Party } from "@/lib/types";

export default function Ledger() {
  const [selectedParty, setSelectedParty] = useState("all");

  const { data: ledgerEntries = [], isLoading: ledgerLoading } = useQuery<LedgerEntry[]>({
    queryKey: ["/api/ledger", selectedParty],
    queryFn: async () => {
      const url = selectedParty === "all" 
        ? "/api/ledger" 
        : `/api/ledger?partyId=${selectedParty}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch ledger entries");
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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(value));
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return { label: 'Purchase', color: 'bg-blue-100 text-blue-800' };
      case 'sale':
        return { label: 'Sale', color: 'bg-green-100 text-green-800' };
      case 'payment':
        return { label: 'Payment', color: 'bg-purple-100 text-purple-800' };
      case 'expense':
        return { label: 'Expense', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'Other', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Calculate summary metrics
  const totalDebit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debit || '0'), 0);
  const totalCredit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.credit || '0'), 0);
  const netBalance = totalDebit - totalCredit;

  // Get parties with outstanding balances
  const partiesWithBalances = parties.filter(party => parseFloat(party.balance) !== 0);
  const positiveBalances = partiesWithBalances.filter(party => parseFloat(party.balance) > 0);
  const negativeBalances = partiesWithBalances.filter(party => parseFloat(party.balance) < 0);

  // Export functionality
  const exportToCSV = () => {
    const csvData = ledgerEntries.map(entry => {
      const party = parties.find(p => p.id === entry.partyId);
      const transactionType = getTransactionTypeLabel(entry.transactionType);
      const balance = parseFloat(entry.balance);
      
      return {
        'Date': new Date(entry.transactionDate).toLocaleDateString(),
        'Party': party?.name || 'Unknown Party',
        'Party Type': party?.type || 'Unknown',
        'Transaction Type': transactionType.label,
        'Description': entry.description || '-',
        'Debit': parseFloat(entry.debit || '0') > 0 ? entry.debit : '0',
        'Credit': parseFloat(entry.credit || '0') > 0 ? entry.credit : '0',
        'Balance': Math.abs(balance).toString(),
        'Balance Type': balance >= 0 ? 'Receivable' : 'Payable'
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ledger_report_${selectedParty === 'all' ? 'all_parties' : 'party_' + selectedParty}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (ledgerLoading) {
    return (
      <div>
        <Header title="Ledger Management" subtitle="Track party balances and payments" />
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
      <Header title="Ledger Management" subtitle="Track party balances and payments" />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Debit</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalDebit.toString())}</p>
                <p className="text-xs text-slate-500 mt-1">Money owed to us</p>
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
                <p className="text-sm font-medium text-slate-600">Total Credit</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCredit.toString())}</p>
                <p className="text-xs text-slate-500 mt-1">Money we owe</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(netBalance).toString())}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {netBalance >= 0 ? 'Net receivable' : 'Net payable'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Parties</p>
                <p className="text-2xl font-bold text-slate-900">{partiesWithBalances.length}</p>
                <p className="text-xs text-slate-500 mt-1">With outstanding balances</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Balances Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Receivables</CardTitle>
            <p className="text-slate-600">Parties who owe us money</p>
          </CardHeader>
          <CardContent className="p-0 max-h-64 overflow-y-auto">
            {positiveBalances.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="text-sm">No outstanding receivables</p>
              </div>
            ) : (
              <div className="space-y-0">
                {positiveBalances.map((party) => (
                  <div key={party.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{party.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{party.type}</p>
                      </div>
                      <span className="font-medium text-green-600">
                        {formatCurrency(party.balance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Payables</CardTitle>
            <p className="text-slate-600">Parties we owe money to</p>
          </CardHeader>
          <CardContent className="p-0 max-h-64 overflow-y-auto">
            {negativeBalances.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="text-sm">No outstanding payables</p>
              </div>
            ) : (
              <div className="space-y-0">
                {negativeBalances.map((party) => (
                  <div key={party.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{party.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{party.type}</p>
                      </div>
                      <span className="font-medium text-red-600">
                        {formatCurrency(Math.abs(parseFloat(party.balance)).toString())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ledger Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Ledger Entries</CardTitle>
              <p className="text-slate-600 mt-1">All financial transactions and balances</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="min-w-[200px]">
                <Label className="text-sm font-medium text-slate-700 mb-2">Filter by Party</Label>
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
              <div className="pt-6">
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Book className="w-12 h-12 text-slate-400 mb-4" />
                        <p className="text-slate-600 mb-2">No ledger entries found</p>
                        <p className="text-sm text-slate-500">Start recording transactions to see ledger entries</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerEntries.map((entry) => {
                    const party = parties.find(p => p.id === entry.partyId);
                    const transactionType = getTransactionTypeLabel(entry.transactionType);
                    const balance = parseFloat(entry.balance);
                    
                    return (
                      <TableRow key={entry.id} className="hover:bg-slate-50">
                        <TableCell className="text-slate-600">
                          {new Date(entry.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{party?.name || 'Unknown Party'}</p>
                            <p className="text-xs text-slate-500 capitalize">{party?.type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={transactionType.color}>
                            {transactionType.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {entry.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(entry.debit || '0') > 0 ? (
                            <span className="font-medium text-green-600">
                              {formatCurrency(entry.debit || '0')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(entry.credit || '0') > 0 ? (
                            <span className="font-medium text-blue-600">
                              {formatCurrency(entry.credit || '0')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(balance).toString())}
                          </span>
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
