import { LayoutDashboard, Users, Store, Bike, ClipboardList, BarChart3, Settings, Menu as MenuIcon, MessageSquare, History } from "lucide-react";
import { NavItem } from "@/components/DashboardLayout";

export const adminNav: NavItem[] = [
  { to: "/admin",             label: "Overview",     icon: LayoutDashboard },
  { to: "/admin/restaurants", label: "Restaurants",  icon: Store },
  { to: "/admin/delivery",    label: "Delivery",     icon: Bike },
  { to: "/admin/users",       label: "Users",        icon: Users },
  { to: "/admin/reports",     label: "Reports",      icon: BarChart3 },
  { to: "/admin/settings",    label: "Settings",     icon: Settings },
];

export const restaurantNav: NavItem[] = [
  { to: "/restaurant",         label: "Overview", icon: LayoutDashboard },
  { to: "/restaurant/orders",  label: "Orders",   icon: ClipboardList },
  { to: "/restaurant/menu",    label: "Menu",     icon: MenuIcon },
  { to: "/restaurant/reviews", label: "Reviews",  icon: MessageSquare },
  { to: "/restaurant/sales",   label: "Sales",    icon: BarChart3 },
];

export const deliveryNav: NavItem[] = [
  { to: "/delivery",         label: "Overview",    icon: LayoutDashboard },
  { to: "/delivery/active",  label: "Active jobs", icon: Bike },
  { to: "/delivery/history", label: "History",     icon: History },
];
