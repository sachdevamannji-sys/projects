import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, Building, Edit, Trash2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { State, City } from "@/lib/types";

export default function Locations() {
  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const { toast } = useToast();

  const [stateFormData, setStateFormData] = useState({
    name: "",
    code: "",
  });

  const [cityFormData, setCityFormData] = useState({
    name: "",
    stateId: "",
  });

  // Fetch states
  const { data: states = [], isLoading: statesLoading } = useQuery<State[]>({
    queryKey: ["/api/states"],
    queryFn: async () => {
      const response = await fetch("/api/states", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch states");
      return response.json();
    },
  });

  // Fetch cities
  const { data: cities = [], isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const response = await fetch("/api/cities", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json();
    },
  });

  // State mutations
  const createStateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/states", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create state");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      handleCloseStateDialog();
      toast({
        title: "Success",
        description: "State created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create state",
        variant: "destructive",
      });
    },
  });

  const updateStateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/states/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update state");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      handleCloseStateDialog();
      toast({
        title: "Success",
        description: "State updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update state",
        variant: "destructive",
      });
    },
  });

  const deleteStateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/states/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete state");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/states"] });
      toast({
        title: "Success",
        description: "State deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete state",
        variant: "destructive",
      });
    },
  });

  // City mutations
  const createCityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create city");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      handleCloseCityDialog();
      toast({
        title: "Success",
        description: "City created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create city",
        variant: "destructive",
      });
    },
  });

  const updateCityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/cities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update city");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      handleCloseCityDialog();
      toast({
        title: "Success",
        description: "City updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update city",
        variant: "destructive",
      });
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cities/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete city");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: "City deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete city",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleCloseStateDialog = () => {
    setIsStateDialogOpen(false);
    setEditingState(null);
    setStateFormData({ name: "", code: "" });
  };

  const handleCloseCityDialog = () => {
    setIsCityDialogOpen(false);
    setEditingCity(null);
    setCityFormData({ name: "", stateId: "" });
  };

  const handleEditState = (state: State) => {
    setEditingState(state);
    setStateFormData({
      name: state.name,
      code: state.code,
    });
    setIsStateDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityFormData({
      name: city.name,
      stateId: city.stateId.toString(),
    });
    setIsCityDialogOpen(true);
  };

  const handleDeleteState = (id: number) => {
    if (window.confirm("Are you sure you want to delete this state?")) {
      deleteStateMutation.mutate(id);
    }
  };

  const handleDeleteCity = (id: number) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      deleteCityMutation.mutate(id);
    }
  };

  const handleStateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingState) {
      updateStateMutation.mutate({ id: editingState.id, data: stateFormData });
    } else {
      createStateMutation.mutate(stateFormData);
    }
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...cityFormData,
      stateId: parseInt(cityFormData.stateId),
    };
    if (editingCity) {
      updateCityMutation.mutate({ id: editingCity.id, data });
    } else {
      createCityMutation.mutate(data);
    }
  };

  const getStateName = (stateId: number) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : "Unknown";
  };

  return (
    <div>
      <Header title="Location Management" subtitle="Manage states and cities for geographical organization" />
      
      <Tabs defaultValue="states" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="states" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            States
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Cities
          </TabsTrigger>
        </TabsList>

        {/* States Tab */}
        <TabsContent value="states">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">State Management</CardTitle>
                  <p className="text-slate-600 mt-1">Manage states and their information</p>
                </div>
                <Dialog open={isStateDialogOpen} onOpenChange={setIsStateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add State
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingState ? "Edit State" : "Add New State"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleStateSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="stateName">State Name *</Label>
                        <Input
                          id="stateName"
                          value={stateFormData.name}
                          onChange={(e) => setStateFormData({ ...stateFormData, name: e.target.value })}
                          placeholder="Enter state name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="stateCode">State Code *</Label>
                        <Input
                          id="stateCode"
                          value={stateFormData.code}
                          onChange={(e) => setStateFormData({ ...stateFormData, code: e.target.value.toUpperCase() })}
                          placeholder="Enter state code (e.g., UP, MH)"
                          maxLength={3}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center justify-end space-x-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseStateDialog}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={createStateMutation.isPending || updateStateMutation.isPending}
                        >
                          {createStateMutation.isPending || updateStateMutation.isPending 
                            ? (editingState ? "Updating..." : "Creating...") 
                            : (editingState ? "Update State" : "Create State")}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {statesLoading ? (
                <div className="text-center py-8">Loading states...</div>
              ) : states.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No states found. Add your first state to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {states.map((state) => (
                      <TableRow key={state.id}>
                        <TableCell className="font-medium">{state.name}</TableCell>
                        <TableCell>{state.code}</TableCell>
                        <TableCell>{new Date(state.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditState(state)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteState(state.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">City Management</CardTitle>
                  <p className="text-slate-600 mt-1">Manage cities under different states</p>
                </div>
                <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add City
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCity ? "Edit City" : "Add New City"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCitySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="cityName">City Name *</Label>
                        <Input
                          id="cityName"
                          value={cityFormData.name}
                          onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                          placeholder="Enter city name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cityState">State *</Label>
                        <Select value={cityFormData.stateId} onValueChange={(value) => setCityFormData({ ...cityFormData, stateId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id.toString()}>
                                {state.name} ({state.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseCityDialog}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={createCityMutation.isPending || updateCityMutation.isPending || !cityFormData.stateId}
                        >
                          {createCityMutation.isPending || updateCityMutation.isPending 
                            ? (editingCity ? "Updating..." : "Creating...") 
                            : (editingCity ? "Update City" : "Create City")}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {citiesLoading ? (
                <div className="text-center py-8">Loading cities...</div>
              ) : cities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No cities found. Add states first, then add cities.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City Name</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">{city.name}</TableCell>
                        <TableCell>{getStateName(city.stateId)}</TableCell>
                        <TableCell>{new Date(city.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditCity(city)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCity(city.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
