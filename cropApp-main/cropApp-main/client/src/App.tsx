import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Parties from "@/pages/parties";
import Crops from "@/pages/crops";
import Locations from "@/pages/locations";
import Purchase from "@/pages/purchase";
import Sales from "@/pages/sales";
import Expenses from "@/pages/expenses";
import Inventory from "@/pages/inventory";
import Ledger from "@/pages/ledger";
import Reports from "@/pages/reports";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/parties" component={Parties} />
              <Route path="/crops" component={Crops} />
              <Route path="/locations" component={Locations} />
              <Route path="/purchase" component={Purchase} />
              <Route path="/sales" component={Sales} />
              <Route path="/expenses" component={Expenses} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/ledger" component={Ledger} />
              <Route path="/reports" component={Reports} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
