import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { deliveryNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiOrder } from "@/lib/api";
import { MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DeliveryActive() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [available, setAvailable] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const [mine, pool] = await Promise.all([api.listOrders(), api.availableDeliveries().catch(() => [])]);
      setOrders(mine);
      setAvailable(pool);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, []);

  const myActive = orders.filter(o => o.status === "out_for_delivery");

  const accept = async (id: number) => {
    try {
      await api.acceptDelivery(id);
      toast.success("Job accepted!");
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const complete = async (id: number) => {
    try {
      await api.updateOrderStatus(id, "delivered");
      toast.success(`Order #${id} marked delivered`);
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <DashboardLayout title="Active jobs" subtitle="Deliveries assigned to you and the open pool" nav={deliveryNav} brandLabel="Delivery">
      <h2 className="font-display text-xl font-semibold mb-3">Your active deliveries</h2>
      <div className="space-y-3 mb-8">
        {loading ? (
          <p className="text-sm text-muted-foreground card-elevated p-6 text-center">Loading…</p>
        ) : myActive.length === 0 ? (
          <p className="text-sm text-muted-foreground card-elevated p-6 text-center">No active deliveries.</p>
        ) : (
          myActive.map(o => (
            <div key={o.id} className="card-elevated p-5 grid lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold">#{o.id}</span>
                  <StatusBadge status={o.status as never} />
                </div>
                <p className="text-sm font-semibold mt-1">{o.restaurant_name} → {o.customer_name}</p>
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {o.notes || "—"}</p>
              </div>
              <div className="lg:col-span-3 font-semibold">${parseFloat(o.total).toFixed(2)}</div>
              <div className="lg:col-span-3">
                <Button onClick={() => complete(o.id)}
                  className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm gap-2 text-xs h-9">
                  <CheckCircle2 className="w-4 h-4" /> Confirm delivered
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold">Available pickups (open pool)</h2>
        <Button variant="outline" onClick={reload} className="rounded-full text-xs h-8">Refresh</Button>
      </div>
      <div className="space-y-3">
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground card-elevated p-6 text-center">No orders awaiting pickup right now.</p>
        ) : (
          available.map(o => (
            <div key={o.id} className="card-elevated p-5 grid lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold">#{o.id}</span>
                  <StatusBadge status={o.status as never} />
                </div>
                <p className="text-sm font-semibold mt-1">{o.restaurant_name}</p>
                <p className="text-xs text-muted-foreground">{o.items.map(i => `${i.quantity}× ${i.name}`).join(", ")}</p>
              </div>
              <div className="lg:col-span-2 font-semibold">${parseFloat(o.total).toFixed(2)}</div>
              <div className="lg:col-span-3">
                <Button onClick={() => accept(o.id)} className="w-full rounded-full bg-foreground text-background text-xs h-9">
                  Accept job
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
