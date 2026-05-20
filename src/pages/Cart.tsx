import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Cart() {
  const { items, setQty, remove, subtotal, count, clear } = useCart();
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  const deliveryFee = subtotal > 0 ? (subtotal > 35 ? 0 : 2.99) : 0;
  const serviceFee = subtotal * 0.05;
  const tax = (subtotal - discount) * 0.08;
  const total = Math.max(0, subtotal - discount + deliveryFee + serviceFee + tax);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "SAVEUR10") setDiscount(subtotal * 0.1);
    else setDiscount(0);
  };

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your bag</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold">Review your order</h1>
        </div>

        {count === 0 ? (
          <div className="card-elevated p-12 text-center max-w-xl mx-auto space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary grid place-items-center">
              <ShoppingBag className="w-9 h-9 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Your bag is empty</h2>
            <p className="text-muted-foreground">Browse restaurants and add a few of your favourites.</p>
            <Link to="/restaurants">
              <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">Find restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              {(() => {
                const groups = new Map<string, { name: string; items: typeof items }>();
                for (const item of items) {
                  const key = item.restaurantSlug ?? "__unknown__";
                  if (!groups.has(key)) groups.set(key, { name: item.restaurantName ?? "Restaurant", items: [] });
                  groups.get(key)!.items.push(item);
                }
                const showHeaders = groups.size > 1;
                return [...groups.entries()].map(([slug, group]) => (
                  <div key={slug} className="space-y-3">
                    {showHeaders && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-primary">{group.name}</p>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    {group.items.map(item => (
                      <div key={item.id} className="card-elevated p-4 flex gap-4 items-center">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold leading-tight line-clamp-1">{item.name}</h3>
                          {!showHeaders && item.restaurantName && <p className="text-xs text-muted-foreground">{item.restaurantName}</p>}
                          <p className="text-sm font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
                          <button onClick={() => setQty(item.id, item.qty - 1)} className="w-8 h-8 rounded-full bg-background grid place-items-center hover:bg-card transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                          <button onClick={() => setQty(item.id, item.qty + 1)} className="w-8 h-8 rounded-full bg-background grid place-items-center hover:bg-card transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-full hover:bg-secondary grid place-items-center text-muted-foreground"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                ));
              })()}
              <div className="flex justify-between pt-2">
                <Link to="/restaurants" className="text-sm font-semibold text-primary hover:underline">+ Add more items</Link>
                <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">Clear bag</button>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="card-elevated p-6 lg:p-7 space-y-5 lg:sticky lg:top-24">
                <h2 className="font-display text-xl font-semibold">Order summary</h2>

                <div className="flex gap-2">
                  <div className="flex-1 bg-secondary rounded-full px-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code (try SAVEUR10)" className="flex-1 bg-transparent outline-none text-sm py-2.5" />
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={applyPromo}>Apply</Button>
                </div>

                <div className="space-y-2.5 text-sm pt-2 border-t border-border">
                  <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                  {discount > 0 && <Row label="Discount" value={`-$${discount.toFixed(2)}`} accent />}
                  <Row label="Delivery" value={deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`} />
                  <Row label="Service fee" value={`$${serviceFee.toFixed(2)}`} />
                  <Row label="Estimated tax" value={`$${tax.toFixed(2)}`} />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-display text-xl font-semibold">Total</span>
                  <span className="font-display text-2xl font-bold">${total.toFixed(2)}</span>
                </div>

                <Link to="/checkout">
                  <Button className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 gap-2">
                    {(() => {
                      const slugs = new Set(items.map(i => i.restaurantSlug ?? "__unknown__"));
                      return slugs.size > 1
                        ? `Checkout (${slugs.size} restaurants)`
                        : "Continue to checkout";
                    })()} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                {(() => {
                  const slugs = new Set(items.map(i => i.restaurantSlug ?? "__unknown__"));
                  return slugs.size > 1 ? (
                    <p className="text-xs text-muted-foreground text-center">
                      You'll get {slugs.size} separate orders — one per restaurant
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center">Free delivery on orders over $35</p>
                  );
                })()}
              </div>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "text-herb font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
