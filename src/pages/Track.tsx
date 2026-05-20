import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChefHat, Bike, Home, Phone, MessageCircle, MapPin, Star, X } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useOrders, OrderStatus } from "@/context/OrdersContext";
import StatusBadge from "@/components/StatusBadge";

const stepDef: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: "pending",          label: "Order confirmed",        icon: Check },
  { key: "preparing",        label: "Restaurant is preparing", icon: ChefHat },
  { key: "out_for_delivery", label: "Out for delivery",       icon: Bike },
  { key: "delivered",        label: "Delivered",              icon: Home },
];

export default function Track() {
  const { id } = useParams();
  const { orders } = useOrders();
  const order = id ? orders.find(o => o.id === id) : orders.find(o => o.status === "out_for_delivery") ?? orders[0];

  if (!order) {
    return (
      <Layout>
        <div className="container-x py-20 text-center">
          <p className="text-muted-foreground mb-4">No order to track yet.</p>
          <Link to="/restaurants"><Button className="rounded-full">Browse restaurants</Button></Link>
        </div>
      </Layout>
    );
  }

  const activeIdx = order.status === "cancelled" ? -1 : stepDef.findIndex(s => s.key === order.status);

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Order {order.id}</p>
              <StatusBadge status={order.status} />
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold">
              {order.status === "delivered" ? "Order delivered ✓" :
               order.status === "cancelled" ? "Order cancelled" :
               "Your meal is on its way"}
            </h1>
            <p className="text-muted-foreground">From <span className="font-semibold text-foreground">{order.restaurantName}</span> · Total ${order.total.toFixed(2)}</p>
          </div>

          {/* Map mock */}
          <div className="relative h-72 lg:h-96 rounded-3xl overflow-hidden border border-border bg-gradient-cream">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "linear-gradient(hsl(var(--ink)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink)) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 300">
              <path d="M40,260 C 100,200 150,220 200,160 S 320,80 360,40" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="6 6" fill="none" strokeLinecap="round" />
            </svg>
            <div className="absolute left-[10%] bottom-[15%] flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-ink text-background grid place-items-center shadow-elegant">
                <Home className="w-5 h-5" />
              </div>
              <span className="mt-1 text-xs font-semibold bg-background px-2 py-0.5 rounded-full shadow-soft">You</span>
            </div>
            <div className="absolute right-[8%] top-[12%] flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-warm">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="mt-1 text-xs font-semibold bg-background px-2 py-0.5 rounded-full shadow-soft">{order.restaurantName.split(" ")[0]}</span>
            </div>
            {order.status === "out_for_delivery" && (
              <div className="absolute left-[55%] top-[45%]">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-warm text-primary-foreground grid place-items-center shadow-warm">
                    <Bike className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {order.driverName && (
            <div className="card-elevated p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary grid place-items-center font-display text-xl font-bold">
                {order.driverName[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{order.driverName}</p>
                <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" /> 4.9 · Your courier
                </p>
              </div>
              <Button variant="outline" size="icon" className="rounded-full"><MessageCircle className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-full"><Phone className="w-4 h-4" /></Button>
            </div>
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="card-elevated p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Live status</h2>

            {order.status === "cancelled" ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive">
                <X className="w-5 h-5" /> This order was cancelled.
              </div>
            ) : (
              <ol className="space-y-1">
                {stepDef.map((s, i) => {
                  const done = i < activeIdx;
                  const current = i === activeIdx;
                  const Icon = s.icon;
                  return (
                    <li key={s.key} className="flex gap-4 relative">
                      {i < stepDef.length - 1 && (
                        <div className={`absolute left-5 top-10 bottom-0 w-px ${done ? "bg-primary" : "bg-border"}`} />
                      )}
                      <div className={`relative z-10 w-10 h-10 rounded-full grid place-items-center flex-shrink-0 ${
                        done ? "bg-primary text-primary-foreground" :
                        current ? "bg-gradient-warm text-primary-foreground shadow-warm" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 pb-6">
                        <p className={`font-semibold ${current || done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                        {current && <p className="text-xs text-muted-foreground mt-0.5">In progress</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">Delivery to</p>
                  <p className="text-muted-foreground">{order.address}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Items: {order.items.map(i => `${i.qty}× ${i.name}`).join(", ")}
              </div>
            </div>
            <Link to="/orders"><Button variant="outline" className="w-full rounded-full">View all orders</Button></Link>
          </div>
        </aside>
      </section>
    </Layout>
  );
}
