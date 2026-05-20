import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bike, MapPin } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { deliveryNav } from "@/components/dashboardNav";
import { useAuth } from "@/context/AuthContext";
import { api, ApiOrder } from "@/lib/api";
import { toast } from "sonner";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [available, setAvailable] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mine, pool] = await Promise.all([api.listOrders(), api.availableDeliveries().catch(() => [])]);
        if (cancelled) return;
        setOrders(mine);
        setAvailable(pool);
      } catch (e) { toast.error((e as Error).message); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const active = orders.filter(o => o.status === "out_for_delivery");
  const completed = orders.filter(o => o.status === "delivered");
  const earnings = completed.length * 4.5;

  return (
    <DashboardLayout title={`Hello, ${user?.name?.split(" ")[0] ?? "Driver"}`} subtitle="Your delivery overview" nav={deliveryNav} brandLabel="Delivery">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active jobs" value={String(active.length)} accent="primary" />
        <StatCard label="Available pickups" value={String(available.length)} accent="accent" sub="Open pool" />
        <StatCard label="Total deliveries" value={String(completed.length)} accent="herb" />
        <StatCard label="Estimated earnings" value={`$${earnings.toFixed(2)}`} sub="$4.50 per delivery" />
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Active deliveries</h2>
          <Link to="/delivery/active" className="text-sm text-primary font-semibold inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        ) : active.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No active deliveries. Take a break! ☕</p>
        ) : (
          <div className="space-y-3">
            {active.map(o => (
              <div key={o.id} className="p-4 rounded-2xl border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center"><Bike className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">#{o.id}</p>
                    <StatusBadge status={o.status as never} />
                  </div>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {o.notes || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${parseFloat(o.total).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{o.restaurant_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
