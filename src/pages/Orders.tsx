import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Repeat, Star, X } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { api, ApiOrder, API_BASE, tokenStore } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

// Map API statuses to display-friendly labels
const DELIVERED_STATUSES = ["delivered"] as const;
const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "ready", "out_for_delivery"] as const;

export default function Orders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<ApiOrder | null>(null);
  const [ratings, setRatings] = useState<Record<number, number>>(() => {
    try { return JSON.parse(localStorage.getItem("saveur_ratings") || "{}"); } catch { return {}; }
  });
  const { add, clear } = useCart();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await api.listOrders();
      setOrders(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh every 30 seconds so order status updates without a full page reload
  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const saveRating = async (orderId: number, rating: number, comment: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    // Submit review to backend
    try {
      await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.access ?? ""}`,
        },
        body: JSON.stringify({
          restaurant: order.restaurant,
          order: orderId,
          rating,
          comment,
        }),
      }).then(r => { if (!r.ok) throw new Error("Review failed"); return r.json(); });
    } catch {
      // Still save locally even if backend fails
    }
    const updated = { ...ratings, [orderId]: rating };
    setRatings(updated);
    localStorage.setItem("saveur_ratings", JSON.stringify(updated));
    toast.success("Thanks for your review!");
    setReviewing(null);
  };

  const handleReorder = (order: ApiOrder) => {
    // Clear cart and add all items from this order
    clear();
    order.items.forEach(item => {
      const dish = {
        id: String(item.menu_item ?? `${order.id}-${item.name}`),
        name: item.name,
        description: "",
        price: parseFloat(item.price),
        image: "/placeholder.svg",
        category: "Menu",
        popular: false,
      };
      for (let i = 0; i < item.quantity; i++) {
        add(dish, { slug: "", name: order.restaurant_name });
      }
    });
    toast.success("Items added to cart!");
    navigate("/cart");
  };

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Order history</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold">Your orders</h1>
        </div>

        {loading ? (
          <div className="card-elevated p-12 text-center max-w-xl mx-auto">
            <p className="text-muted-foreground">Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card-elevated p-12 text-center max-w-xl mx-auto">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link to="/restaurants"><Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">Browse restaurants</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => {
              const isDelivered = o.status === "delivered";
              const isActive = ACTIVE_STATUSES.includes(o.status as typeof ACTIVE_STATUSES[number]);
              const hasRating = ratings[o.id];

              return (
                <div key={o.id} className="card-elevated p-5 lg:p-6 grid lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-5 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg font-semibold">{o.restaurant_name}</h3>
                      <StatusBadge status={o.status as never} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {o.items.map(i => `${i.quantity}× ${i.name}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()} · #{o.id}</p>
                  </div>
                  <div className="lg:col-span-2 text-left lg:text-center">
                    <p className="font-display text-xl font-semibold">${parseFloat(o.total).toFixed(2)}</p>
                  </div>
                  <div className="lg:col-span-5 flex gap-2 justify-end flex-wrap">
                    {isActive ? (
                      <Link to={`/track/${o.id}`}>
                        <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">Track order</Button>
                      </Link>
                    ) : isDelivered ? (
                      <>
                        {!hasRating && (
                          <Button variant="outline" className="rounded-full gap-2" onClick={() => setReviewing(o)}>
                            <Star className="w-4 h-4" /> Rate
                          </Button>
                        )}
                        {hasRating && (
                          <span className="chip bg-accent/15 text-foreground">
                            <Star className="w-3.5 h-3.5 fill-accent text-accent" /> Rated {hasRating}/5
                          </span>
                        )}
                        <Button variant="outline" className="rounded-full gap-2" onClick={() => handleReorder(o)}>
                          <Repeat className="w-4 h-4" /> Re-order
                        </Button>
                      </>
                    ) : o.status === "cancelled" ? (
                      <>
                        <span className="text-sm text-muted-foreground">Order cancelled</span>
                        <Button variant="outline" className="rounded-full gap-2" onClick={() => handleReorder(o)}>
                          <Repeat className="w-4 h-4" /> Re-order
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {reviewing && (
        <ReviewModal
          order={reviewing}
          onClose={() => setReviewing(null)}
          onSubmit={(rating, comment) => saveRating(reviewing.id, rating, comment)}
        />
      )}
    </Layout>
  );
}

function ReviewModal({ order, onClose, onSubmit }: { order: ApiOrder; onClose: () => void; onSubmit: (r: number, c: string) => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl p-7 max-w-md w-full shadow-elegant relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-secondary grid place-items-center"><X className="w-4 h-4" /></button>
        <h2 className="font-display text-2xl font-semibold mb-1">Rate your order</h2>
        <p className="text-sm text-muted-foreground mb-5">from {order.restaurant_name}</p>

        <div className="flex justify-center gap-1 mb-5">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} className="p-1">
              <Star className={`w-9 h-9 transition-colors ${n <= rating ? "fill-accent text-accent" : "text-border"}`} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value.slice(0, 500))} rows={4}
          placeholder="Tell us about your meal (optional)…"
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm resize-none mb-4" />
        <Button onClick={() => onSubmit(rating, comment)} className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">
          Submit review
        </Button>
      </div>
    </div>
  );
}
