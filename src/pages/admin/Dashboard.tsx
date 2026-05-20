import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, ShoppingBag, Users, Bike, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { adminNav } from "@/components/dashboardNav";
import { useAuth } from "@/context/AuthContext";
import { api, ApiOrder } from "@/lib/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ords, rests] = await Promise.all([api.listOrders(), api.listRestaurants()]);
        setOrders(ords);
        setRestaurantCount(rests.length);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const revenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + parseFloat(o.total), 0);
  const active = orders.filter(o => ["pending", "preparing", "out_for_delivery"].includes(o.status)).length;
  const recent = orders.slice(0, 6);

  const displayName = user?.name || user?.username || "Admin";

  return (
    <DashboardLayout title={`Welcome back, ${displayName}`} subtitle="Platform-wide overview" nav={adminNav} brandLabel="Admin">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total revenue" value={`$${revenue.toFixed(2)}`} sub="All-time delivered" accent="primary" />
        <StatCard label="Active orders" value={String(active)} sub="In progress now" accent="accent" />
        <StatCard label="Restaurants" value={String(restaurantCount)} sub="Listed partners" accent="herb" />
        <StatCard label="Total orders" value={String(orders.length)} sub="Lifetime" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary font-semibold inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map(o => (
                <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50">
                  <div className="w-10 h-10 rounded-xl bg-secondary grid place-items-center font-mono text-xs font-bold">#{o.id}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{o.customer_name} → {o.restaurant_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={o.status as never} />
                  <span className="font-semibold text-sm w-16 text-right">${parseFloat(o.total).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-elevated p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Quick actions</h2>
          {[
            { to: "/admin/users", icon: Users, label: "Manage users" },
            { to: "/admin/restaurants", icon: ShoppingBag, label: "Manage restaurants" },
            { to: "/admin/delivery", icon: Bike, label: "Manage delivery staff" },
            { to: "/admin/reports", icon: TrendingUp, label: "View reports" },
          ].map(a => (
            <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><a.icon className="w-5 h-5" /></div>
              <span className="font-semibold text-sm flex-1">{a.label}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}