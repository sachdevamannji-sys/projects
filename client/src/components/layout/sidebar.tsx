import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  BarChart3,
  Users,
  Wheat,
  MapPin,
  ShoppingCart,
  ScanBarcode,
  Receipt,
  Warehouse,
  Book,
  FileText,
  LogOut,
  User,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

const masterItems = [
  { name: "Parties", href: "/parties", icon: Users },
  { name: "Crops", href: "/crops", icon: Wheat },
  { name: "Locations", href: "/locations", icon: MapPin },
];

const transactionItems = [
  { name: "Purchase", href: "/purchase", icon: ShoppingCart },
  { name: "Sales", href: "/sales", icon: ScanBarcode },
  { name: "Expenses", href: "/expenses", icon: Receipt },
];

const reportItems = [
  { name: "Inventory", href: "/inventory", icon: Warehouse },
  { name: "Ledger", href: "/ledger", icon: Book },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
      <div className="flex items-center justify-center h-16 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🌱</span>
          </div>
          <span className="text-xl font-semibold text-slate-800">KCAgri-Trade</span>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
          
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Masters</p>
            <div className="mt-2 space-y-1">
              {masterItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</p>
            <div className="mt-2 space-y-1">
              {transactionItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports</p>
            <div className="mt-2 space-y-1">
              {reportItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{user?.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
