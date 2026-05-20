import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { restaurantNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiOrder } from "@/lib/api";
import { toast } from "sonner";

const flow: Partial<Record<ApiOrder["status"], { next: ApiOrder["status"]; label: string }>> = {
  pending:          { next: "preparing",        label: "Accept & start preparing" },
  preparing:        { next: "ready",            label: "Mark as ready for pickup" },
  ready:            { next: "out_for_delivery", label: "Mark out for delivery" },
  out_for_delivery: { next: "delivered",        label: "Mark as delivered" },
};

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptOrder, setReceiptOrder] = useState<ApiOrder | null>(null);

  const load = async () => {
    setLoading(true);
    try { setOrders(await api.listOrders()); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Auto-refresh every 30 seconds so new orders appear without manual reload
  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const advance = async (o: ApiOrder, next: ApiOrder["status"]) => {
    try {
      const updated = await api.updateOrderStatus(o.id, next);
      setOrders(prev => prev.map(p => p.id === o.id ? updated : p));
      toast.success(`Order #${o.id} → ${next.replace(/_/g, " ")}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <DashboardLayout title="Orders" subtitle={`${orders.length} orders received`} nav={restaurantNav} brandLabel="Restaurant">
      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const next = flow[o.status];
            return (
              <div key={o.id} className="card-elevated p-5 grid lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold">#{o.id}</span>
                    <StatusBadge status={o.status as never} />
                  </div>
                  <p className="text-sm font-semibold mt-1">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.notes}</p>
                </div>
                <div className="lg:col-span-4 text-sm text-muted-foreground">
                  {o.items.map((i, idx) => <p key={idx}>{i.quantity}× {i.name}</p>)}
                </div>
                <div className="lg:col-span-1 font-semibold">${parseFloat(o.total).toFixed(2)}</div>
                <div className="lg:col-span-2 flex flex-col gap-2">
                  {o.payment_method === "wallet" && o.payment_receipt && (
                    <button
                      onClick={() => setReceiptOrder(o)}
                      className="text-xs font-semibold text-primary underline underline-offset-2 text-left">
                      📄 View receipt
                    </button>
                  )}
                  {o.payment_method === "wallet" && !o.payment_receipt && (
                    <span className="text-xs text-muted-foreground italic">Awaiting receipt</span>
                  )}
                  {next && (
                    <Button onClick={() => advance(o, next.next)}
                      className="rounded-full bg-gradient-warm text-primary-foreground border-0 text-xs h-9">
                      {next.label}
                    </Button>
                  )}
                  {(o.status === "pending" || o.status === "preparing") && (
                    <Button variant="outline" onClick={() => advance(o, "cancelled")}
                      className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-9">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {receiptOrder && receiptOrder.payment_receipt && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setReceiptOrder(null)}>
          <div
            className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-elegant space-y-4 relative"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Payment Receipt</h2>
              <button onClick={() => setReceiptOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-secondary grid place-items-center text-muted-foreground">✕</button>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Order <span className="font-semibold text-foreground">#{receiptOrder.id}</span> · {receiptOrder.customer_name}</p>
              <p>Total: <span className="font-semibold text-foreground">${parseFloat(receiptOrder.total).toFixed(2)}</span> via E-wallet</p>
            </div>
            <img
              src={receiptOrder.payment_receipt}
              alt="Payment receipt"
              className="w-full rounded-2xl border border-border shadow-soft"
            />
            <a
              href={receiptOrder.payment_receipt}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs font-semibold text-primary underline underline-offset-2">
              Open full image ↗
            </a>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
