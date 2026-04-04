import { Link } from "wouter";
import { Link, useLocation } from "wouter";
import { Flame, LayoutDashboard, Bell, Cpu, Activity, Settings } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/alerts",  label: "Alerts",    icon: Bell },
  { href: "/sensors", label: "Sensors",   icon: Cpu },
  { href: "/demo",    label: "ML Demo",   icon: Activity },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl h-full flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Flame className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
          FireGuard<span className="text-primary">AI</span>
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
       {NAV_ITEMS.map((item) => {
  const isActive = location === item.href;

  return (
    <Link key={item.href} href={item.href}>
      <a
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
          isActive
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
        <span className="font-medium text-sm">{item.label}</span>
      </a>
    </Link>
  );
})}
          
     </nav>

<div className="p-4 border-t border-sidebar-border/50">
  {/* ✅ SETTINGS BUTTON FIXED */}
  <Link href="/settings">
    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
      <Settings className="w-5 h-5" />
      <span className="font-medium text-sm">Settings</span>
    </a>
  </Link>

  {/* SYSTEM STATUS (UNCHANGED) */}
  <div className="mt-4 p-4 rounded-xl bg-card border border-border/50">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        SYSTEM STATUS
      </span>
    </div>
    <p className="text-sm font-medium text-foreground">
      All systems operational
    </p>
  </div>
</div>
