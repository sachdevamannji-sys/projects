import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getAuthHeaders } from "@/lib/auth";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function CropChart() {
  const { data: cropData = [], isLoading } = useQuery({
    queryKey: ["/api/dashboard/crop-distribution"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/crop-distribution", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch crop distribution");
      return response.json();
    },
  });

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Crop Distribution</CardTitle>
          <Button variant="link" className="text-sm text-primary-600 hover:text-primary-700">
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-slate-500">Loading distribution data...</div>
          </div>
        ) : cropData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="text-sm">No inventory data</p>
              <p className="text-xs mt-1">Add crops to inventory to see distribution</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cropData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatValue(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
