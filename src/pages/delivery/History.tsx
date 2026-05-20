import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { deliveryNav } from "@/components/dashboardNav";
import { api, ApiOrder } from "@/lib/api";
import { toast } from "sonner";

export default function DeliveryHistory() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await api.listOrders();
        setOrders(all.filter(o => o.status === "delivered"));
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout title="Delivery history" subtitle={`${orders.length} completed deliveries`} nav={deliveryNav} brandLabel="Delivery">
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Restaurant</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No completed deliveries yet.</td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td className="px-5 py-3 font-mono font-semibold">#{o.id}</td>
                  <td className="px-5 py-3">{o.restaurant_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.customer_name}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{o.items.map(i => `${i.quantity}× ${i.name}`).join(", ")}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(o.updated_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-semibold">${parseFloat(o.total).toFixed(2)}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status as never} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
