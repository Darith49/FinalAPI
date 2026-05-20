import { useEffect, useState } from "react";
import { Plus, X, Truck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { restaurantNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiOrder, ApiRestaurant, ApiMenuItem } from "@/lib/api";
import { toast } from "sonner";

const flow: Partial<Record<ApiOrder["status"], { next: ApiOrder["status"]; label: string }>> = {
  pending:          { next: "preparing",        label: "Accept & start preparing" },
  preparing:        { next: "ready",            label: "Mark as ready for pickup" },
  ready:            { next: "out_for_delivery", label: "Mark out for delivery" },
  out_for_delivery: { next: "delivered",        label: "Mark as delivered" },
};

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<ApiOrder | null>(null);
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New delivery order form state
  const [showCreate, setShowCreate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | "">("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const mine = await api.myRestaurants();
      const r = mine[0] ?? null;
      setRestaurant(r);
      if (r) {
        const [ords, items] = await Promise.all([
          api.listOrders(),
          api.listMenuItems(r.id),
        ]);
        setOrders(ords);
        setMenuItems(items.filter(i => i.is_available));
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const advance = async (o: ApiOrder, next: ApiOrder["status"]) => {
    try {
      const updated = await api.updateOrderStatus(o.id, next);
      setOrders(prev => prev.map(p => p.id === o.id ? updated : p));
      toast.success(`Order #${o.id} → ${next.replace(/_/g, " ")}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const createDeliveryOrder = async () => {
    if (!restaurant || !selectedItem) {
      toast.error("Please select a menu item.");
      return;
    }
    const item = menuItems.find(i => i.id === Number(selectedItem));
    if (!item) return;

    setSubmitting(true);
    try {
      const price = parseFloat(item.price);
      const subtotal = price * qty;
      const deliveryFee = parseFloat(String(restaurant.delivery_fee)) || 0;
      const total = subtotal + deliveryFee;

      await api.createDeliveryOrder({
        restaurant: restaurant.id,
        subtotal,
        delivery_fee: deliveryFee,
        tax: 0,
        total,
        notes: notes.trim(),
        items: [{ menu_item: item.id, name: item.name, price, quantity: qty }],
      });
      toast.success("Delivery order created — drivers can now pick it up!");
      setShowCreate(false);
      setSelectedItem("");
      setQty(1);
      setNotes("");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Orders" subtitle={`${orders.length} orders received`} nav={restaurantNav} brandLabel="Restaurant">

      {/* Create delivery order button */}
      {restaurant && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setShowCreate(v => !v)}
            className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm gap-2"
          >
            {showCreate ? <X className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            {showCreate ? "Cancel" : "Create Delivery Order"}
          </Button>
        </div>
      )}

      {/* Create delivery form */}
      {showCreate && restaurant && (
        <div className="card-elevated p-5 mb-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">New delivery order</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Creates an order with status <strong>Ready</strong> so delivery drivers can immediately pick it up.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Menu item *</label>
              <select
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Select an item…</option>
                {menuItems.map(i => (
                  <option key={i.id} value={i.id}>{i.name} — ${parseFloat(i.price).toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Quantity</label>
              <input
                type="number" min={1} value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Notes (optional)</label>
              <input
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Delivery address or instructions…"
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          {selectedItem && (
            <p className="text-sm text-muted-foreground">
              Total: <strong className="text-foreground">
                ${((parseFloat(menuItems.find(i => i.id === Number(selectedItem))?.price ?? "0")) * qty + (parseFloat(String(restaurant.delivery_fee)) || 0)).toFixed(2)}
              </strong> (incl. ${parseFloat(String(restaurant.delivery_fee)).toFixed(2)} delivery fee)
            </p>
          )}
          <Button
            onClick={createDeliveryOrder}
            disabled={submitting || !selectedItem}
            className="rounded-full bg-foreground text-background gap-2"
          >
            <Plus className="w-4 h-4" /> {submitting ? "Creating…" : "Send to delivery pool"}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No orders yet. Use "Create Delivery Order" above to dispatch your first delivery.
        </p>
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
              <p>Restaurant: <span className="font-semibold text-foreground">{receiptOrder.restaurant_name}</span></p>
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