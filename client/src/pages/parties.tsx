import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Edit, Eye, Trash2, Users, Building } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Party, State, City } from "@/lib/types";

export default function Parties() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    contactNumber: "",
    email: "",
    address: "",
    aadharNumber: "",
    cityId: "",
    stateId: "",
  });

  const { data: parties = [], isLoading } = useQuery<Party[]>({
    queryKey: ["/api/parties"],
    queryFn: async () => {
      const response = await fetch("/api/parties", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch parties");
      return response.json();
    },
  });

  const { data: states = [] } = useQuery<State[]>({
    queryKey: ["/api/states"],
    queryFn: async () => {
      const response = await fetch("/api/states", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch states");
      return response.json();
    },
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const response = await fetch("/api/cities", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json();
    },
  });

  const createPartyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create party");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      handleCloseDialog();
      toast({
        title: "Success",
        description: "Party created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create party",
        variant: "destructive",
      });
    },
  });

  const updatePartyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/parties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update party");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      handleCloseDialog();
      toast({
        title: "Success",
        description: "Party updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update party",
        variant: "destructive",
      });
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/parties/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete party");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      toast({
        title: "Success",
        description: "Party deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete party",
        variant: "destructive",
      });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingParty(null);
    setFormData({
      name: "",
      type: "",
      contactNumber: "",
      email: "",
      address: "",
      cityId: "",
      stateId: "",
    });
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      type: party.type,
      contactNumber: party.contactNumber || "",
      email: party.email || "",
      address: party.address || "",
      cityId: party.cityId?.toString() || "",
      stateId: party.stateId?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this party?")) {
      deletePartyMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      cityId: formData.cityId ? parseInt(formData.cityId) : undefined,
      stateId: formData.stateId ? parseInt(formData.stateId) : undefined,
    };
    
    if (editingParty) {
      updatePartyMutation.mutate({ id: editingParty.id, data });
    } else {
      createPartyMutation.mutate(data);
    }
  };

  const filteredParties = parties.filter((party) => {
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || party.type === selectedType;
    const matchesState = selectedState === "all" || party.stateId?.toString() === selectedState;
    return matchesSearch && matchesType && matchesState;
  });

  const getPartyTypeColor = (type: string) => {
    switch (type) {
      case "farmer":
        return "bg-green-100 text-green-800";
      case "trader":
        return "bg-blue-100 text-blue-800";
      case "exporter":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatBalance = (balance: string) => {
    const amount = parseFloat(balance);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div>
      <Header title="Party Management" subtitle="Manage farmers, traders, and business partners" />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Party Management</CardTitle>
              <p className="text-slate-600 mt-1">Manage farmers, traders, and other business parties</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Party
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingParty ? "Edit Party" : "Add New Party"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Party Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter party name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Party Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmer">Farmer</SelectItem>
                          <SelectItem value="trader">Trader</SelectItem>
                          <SelectItem value="exporter">Exporter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="+91 99999 99999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="party@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="aadharNumber">Aadhar Number (Optional)</Label>
                    <Input
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      placeholder="1234 5678 9012"
                      maxLength={12}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stateId">State</Label>
                      <Select value={formData.stateId} onValueChange={(value) => setFormData({ ...formData, stateId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state..." />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.id.toString()}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cityId">City</Label>
                      <Select value={formData.cityId} onValueChange={(value) => setFormData({ ...formData, cityId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cities
                            .filter((city) => !formData.stateId || city.stateId.toString() === formData.stateId)
                            .map((city) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={createPartyMutation.isPending || updatePartyMutation.isPending}
                    >
                      {createPartyMutation.isPending || updatePartyMutation.isPending 
                        ? (editingParty ? "Updating..." : "Creating...") 
                        : (editingParty ? "Update Party" : "Create Party")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search parties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="trader">Trader</SelectItem>
                  <SelectItem value="exporter">Exporter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name}
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
                  <TableHead>Party Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading parties...
                    </TableCell>
                  </TableRow>
                ) : filteredParties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No parties found. Create your first party to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParties.map((party) => (
                    <TableRow key={party.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            {party.type === "farmer" ? (
                              <Users className="w-4 h-4 text-primary-600" />
                            ) : (
                              <Building className="w-4 h-4 text-primary-600" />
                            )}
                          </div>
                          <span className="font-medium text-slate-900">{party.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPartyTypeColor(party.type)} capitalize`}>
                          {party.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {party.contactNumber || "-"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {party.address || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${parseFloat(party.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatBalance(party.balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(party)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(party.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
