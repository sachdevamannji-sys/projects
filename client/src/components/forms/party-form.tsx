import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { State, City, Party } from "@/lib/types";

const partyFormSchema = z.object({
  name: z.string().min(1, "Party name is required"),
  type: z.string().min(1, "Party type is required"),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  cityId: z.string().optional(),
  stateId: z.string().optional(),
});

type PartyFormData = z.infer<typeof partyFormSchema>;

interface PartyFormProps {
  party?: Party;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PartyForm({ party, onSuccess, onCancel }: PartyFormProps) {
  const { toast } = useToast();
  const isEditing = !!party;

  const form = useForm<PartyFormData>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: party?.name || "",
      type: party?.type || "",
      contactNumber: party?.contactNumber || "",
      email: party?.email || "",
      address: party?.address || "",
      cityId: party?.cityId?.toString() || "",
      stateId: party?.stateId?.toString() || "",
    },
  });

  const selectedStateId = form.watch("stateId");

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
    queryKey: ["/api/cities", selectedStateId],
    queryFn: async () => {
      const url = selectedStateId 
        ? `/api/cities?stateId=${selectedStateId}`
        : "/api/cities";
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json();
    },
    enabled: !!selectedStateId,
  });

  const createPartyMutation = useMutation({
    mutationFn: async (data: PartyFormData) => {
      const url = isEditing ? `/api/parties/${party.id}` : "/api/parties";
      const method = isEditing ? "PUT" : "POST";
      
      const requestData = {
        ...data,
        cityId: data.cityId ? parseInt(data.cityId) : undefined,
        stateId: data.stateId ? parseInt(data.stateId) : undefined,
        email: data.email || undefined,
        contactNumber: data.contactNumber || undefined,
        address: data.address || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} party`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      toast({
        title: "Success",
        description: `Party ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} party`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PartyFormData) => {
    createPartyMutation.mutate(data);
  };

  // Reset city when state changes
  const handleStateChange = (value: string) => {
    form.setValue("stateId", value);
    form.setValue("cityId", "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter party name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="exporter">Exporter</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 99999 99999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="party@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter complete address"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={handleStateChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-end space-x-4 pt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="bg-primary-600 text-white hover:bg-primary-700"
            disabled={createPartyMutation.isPending}
          >
            {createPartyMutation.isPending 
              ? (isEditing ? "Updating..." : "Saving...") 
              : (isEditing ? "Update Party" : "Save Party")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
