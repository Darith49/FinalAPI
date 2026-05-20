import { useState, useMemo, useRef } from "react";
import abaQr from "@/assets/ababank.jpg";
import acledaQr from "@/assets/acledabank.jpg";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Wallet, Banknote, Clock, Plus, Home, Briefcase, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useAddresses } from "@/context/AddressContext";
import { toast } from "sonner";

export default function Checkout() {
  const { items, subtotal, count, clear } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { addresses, defaultAddress, add: addAddress } = useAddresses();
  const navigate = useNavigate();
  const [pay, setPay] = useState<"card" | "cash" | "wallet">("card");
  const [walletBank, setWalletBank] = useState<"aba" | "acleda">("aba");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const receiptRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState("asap");
  const [selectedId, setSelectedId] = useState<string>(defaultAddress?.id ?? "new");
  const [notes, setNotes] = useState("");
  const [newForm, setNewForm] = useState({
    label: "Home", recipient: user?.name ?? "", phone: user?.phone ?? "",
    street: "", apt: "", city: "", zip: "", saveToBook: true,
  });

  const selected = useMemo(
    () => addresses.find(a => a.id === selectedId) ?? null,
    [addresses, selectedId]
  );

  const deliveryFee = subtotal > 35 ? 0 : 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  if (count === 0) {
    return (
      <Layout>
        <div className="container-x py-20 text-center">
          <p className="text-muted-foreground mb-4">Your bag is empty.</p>
          <Link to="/restaurants"><Button className="rounded-full">Find restaurants</Button></Link>
        </div>
      </Layout>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    let addr = selected;
    if (selectedId === "new") {
      if (!newForm.recipient || !newForm.phone || !newForm.street || !newForm.city || !newForm.zip) {
        toast.error("Please complete the new address.");
        return;
      }
      if (newForm.saveToBook) {
        addr = addAddress({
          label: newForm.label || "Home",
          recipient: newForm.recipient, phone: newForm.phone,
          street: newForm.street, apt: newForm.apt, city: newForm.city, zip: newForm.zip,
        });
      } else {
        addr = {
          id: "guest", label: newForm.label, recipient: newForm.recipient, phone: newForm.phone,
          street: newForm.street, apt: newForm.apt, city: newForm.city, zip: newForm.zip,
        };
      }
    }
    if (!addr) { toast.error("Select a delivery address."); return; }

    const fullAddress = `${addr.street}${addr.apt ? `, ${addr.apt}` : ""}, ${addr.city} ${addr.zip}`;

    // Group cart items by restaurant slug so we can create one order per restaurant.
    const byRestaurant = new Map<string, { slug: string; name: string; items: typeof items }>();
    for (const item of items) {
      const slug = item.restaurantSlug ?? "__unknown__";
      if (!byRestaurant.has(slug)) {
        byRestaurant.set(slug, { slug, name: item.restaurantName ?? "", items: [] });
      }
      byRestaurant.get(slug)!.items.push(item);
    }

    const restaurantGroups = [...byRestaurant.values()];
    const createdOrderIds: number[] = [];

    try {
      const remote = await import("@/lib/api").then(m => m.api);

      for (const group of restaurantGroups) {
        const groupSubtotal = group.items.reduce((s, i) => s + i.price * i.qty, 0);
        // Pro-rate delivery fee and tax per restaurant group
        const ratio = subtotal > 0 ? groupSubtotal / subtotal : 1 / restaurantGroups.length;
        const groupFee = parseFloat((deliveryFee * ratio).toFixed(2));
        const groupTax = parseFloat((tax * ratio).toFixed(2));
        const groupTotal = parseFloat((groupSubtotal + groupFee + groupTax).toFixed(2));

        try {
          // Look up the restaurant id by slug — needed by the API.
          const rest = await remote.getRestaurant(group.slug);
          const createdOrder = await remote.createOrder({
            restaurant: rest.id,
            subtotal: groupSubtotal,
            delivery_fee: groupFee,
            tax: groupTax,
            total: groupTotal,
            payment_method: pay,
            notes: `${fullAddress}${notes ? ` — ${notes}` : ""}`,
            items: group.items.map(i => ({
              // Cart ID is "restaurantSlug__menuItemId" — extract just the numeric menu item id
              menu_item: Number(i.id.includes("__") ? i.id.split("__")[1] : i.id) || null,
              name: i.name,
              price: i.price,
              quantity: i.qty,
            })),
          });

          createdOrderIds.push(createdOrder.id);

          // Upload e-wallet receipt image if provided (attach to first order only)
          if (pay === "wallet" && receipt && createdOrder?.id && createdOrderIds.length === 1) {
            try {
              await remote.uploadReceipt(createdOrder.id, receipt);
            } catch (uploadErr) {
              console.warn("[checkout] receipt upload failed:", (uploadErr as Error).message);
            }
          }

          // Also create a local order so Track page works
          createOrder({
            customerId: user?.id ?? "guest",
            customerName: addr.recipient,
            customerPhone: addr.phone,
            restaurantSlug: group.slug,
            restaurantName: group.name,
            items: group.items,
            subtotal: groupSubtotal,
            deliveryFee: groupFee,
            tax: groupTax,
            total: groupTotal,
            address: fullAddress,
            notes,
            paymentMethod: pay,
          });
        } catch (err) {
          console.warn(`[checkout] backend order failed for ${group.slug}:`, (err as Error).message);
          // Still create local order so the customer sees something
          createOrder({
            customerId: user?.id ?? "guest",
            customerName: addr.recipient,
            customerPhone: addr.phone,
            restaurantSlug: group.slug,
            restaurantName: group.name,
            items: group.items,
            subtotal: groupSubtotal,
            deliveryFee: groupFee,
            tax: groupTax,
            total: groupTotal,
            address: fullAddress,
            notes,
            paymentMethod: pay,
          });
        }
      }
    } catch (err) {
      console.warn("[checkout] api import failed:", (err as Error).message);
      // Fallback: create local orders for each group
      for (const group of restaurantGroups) {
        const groupSubtotal = group.items.reduce((s, i) => s + i.price * i.qty, 0);
        const ratio = subtotal > 0 ? groupSubtotal / subtotal : 1 / restaurantGroups.length;
        const groupFee = parseFloat((deliveryFee * ratio).toFixed(2));
        const groupTax = parseFloat((tax * ratio).toFixed(2));
        const groupTotal = parseFloat((groupSubtotal + groupFee + groupTax).toFixed(2));
        createOrder({
          customerId: user?.id ?? "guest",
          customerName: addr.recipient,
          customerPhone: addr.phone,
          restaurantSlug: group.slug,
          restaurantName: group.name,
          items: group.items,
          subtotal: groupSubtotal,
          deliveryFee: groupFee,
          tax: groupTax,
          total: groupTotal,
          address: fullAddress,
          notes,
          paymentMethod: pay,
        });
      }
    }

    clear();

    const orderCount = restaurantGroups.length;
    toast.success(
      orderCount > 1
        ? `${orderCount} orders placed — one per restaurant!`
        : "Order placed! Tracking your delivery now."
    );

    // Navigate to orders page so the customer can see all their orders
    navigate("/orders");
  };

  const updNew = (k: keyof typeof newForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Checkout</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold">Almost there</h1>
        </div>

        <form onSubmit={placeOrder} className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Section title="Delivery address" icon={<MapPin className="w-5 h-5" />}>
              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map(a => {
                  const Icon = a.label.toLowerCase() === "home" ? Home : a.label.toLowerCase() === "work" ? Briefcase : MapPin;
                  const active = selectedId === a.id;
                  return (
                    <button type="button" key={a.id} onClick={() => setSelectedId(a.id)}
                      className={`text-left rounded-2xl p-4 border-2 transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"}`}>
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <Icon className="w-4 h-4" /> {a.label}
                        {a.isDefault && <span className="chip bg-primary/10 text-primary text-[10px] ml-auto">Default</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{a.street}{a.apt ? `, ${a.apt}` : ""}<br />{a.city} {a.zip}</p>
                    </button>
                  );
                })}
                <button type="button" onClick={() => setSelectedId("new")}
                  className={`text-left rounded-2xl p-4 border-2 border-dashed transition-all ${selectedId === "new" ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"}`}>
                  <div className="flex items-center gap-2 font-semibold"><Plus className="w-4 h-4" /> New address</div>
                  <p className="text-xs text-muted-foreground mt-1">Use a one-time or save to your address book</p>
                </button>
              </div>

              {selectedId === "new" && (
                <div className="grid sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                  <Input label="Label" value={newForm.label} onChange={updNew("label")} placeholder="Home, Work" />
                  <Input label="Recipient" value={newForm.recipient} onChange={updNew("recipient")} required />
                  <Input label="Phone" value={newForm.phone} onChange={updNew("phone")} required />
                  <div />
                  <Input label="Street address" value={newForm.street} onChange={updNew("street")} className="sm:col-span-2" required />
                  <Input label="Apt / Suite" value={newForm.apt} onChange={updNew("apt")} />
                  <Input label="City" value={newForm.city} onChange={updNew("city")} required />
                  <Input label="ZIP" value={newForm.zip} onChange={updNew("zip")} required />
                  <label className="sm:col-span-2 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newForm.saveToBook}
                      onChange={(e) => setNewForm(p => ({ ...p, saveToBook: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm">Save to my address book</span>
                  </label>
                </div>
              )}

              <label className="block mt-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery notes</span>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Leave at door, please"
                  className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
              </label>
            </Section>

            <Section title="When" icon={<Clock className="w-5 h-5" />}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Choice active={time === "asap"} onClick={() => setTime("asap")} title="As soon as possible" sub="Arrives in 25–35 min" />
                <Choice active={time === "later"} onClick={() => setTime("later")} title="Schedule for later" sub="Pick a 15-min window" />
              </div>
            </Section>

            <Section title="Payment" icon={<CreditCard className="w-5 h-5" />}>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <Choice active={pay === "card"} onClick={() => setPay("card")} title="Card" icon={<CreditCard className="w-5 h-5" />} />
                <Choice active={pay === "wallet"} onClick={() => setPay("wallet")} title="E-wallet" icon={<Wallet className="w-5 h-5" />} />
                <Choice active={pay === "cash"} onClick={() => setPay("cash")} title="Cash" icon={<Banknote className="w-5 h-5" />} />
              </div>
              {pay === "card" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Card number" placeholder="4242 4242 4242 4242" className="sm:col-span-2" />
                  <Input label="Expiry" placeholder="MM/YY" />
                  <Input label="CVC" placeholder="123" />
                </div>
              )}
              {pay === "cash" && (
                <p className="text-sm text-muted-foreground">Pay the courier in cash on delivery.</p>
              )}
              {pay === "wallet" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setWalletBank("aba")}
                      className={"flex-1 rounded-2xl border-2 py-3 px-4 text-sm font-semibold transition-all " + (walletBank === "aba" ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30")}>
                      ABA Bank
                    </button>
                    <button type="button" onClick={() => setWalletBank("acleda")}
                      className={"flex-1 rounded-2xl border-2 py-3 px-4 text-sm font-semibold transition-all " + (walletBank === "acleda" ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30")}>
                      ACLEDA Bank
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">Scan the KHQR code below with your banking app</p>
                    <img
                      src={walletBank === "aba" ? abaQr : acledaQr}
                      alt={walletBank === "aba" ? "ABA Pay KHQR" : "ACLEDA Bank KHQR"}
                      className="w-56 h-auto rounded-2xl border border-border shadow-soft"
                    />
                    <p className="text-xs text-muted-foreground">Pay to: <span className="font-semibold">DY CHANDARITH</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Upload payment receipt</p>
                    <input ref={receiptRef} type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0] ?? null;
                        setReceipt(file);
                        if (file) setReceiptPreview(URL.createObjectURL(file));
                        else setReceiptPreview(null);
                      }} />
                    {receiptPreview ? (
                      <div className="relative inline-block">
                        <img src={receiptPreview} alt="Receipt" className="w-40 h-auto rounded-xl border border-border shadow-soft" />
                        <button type="button" onClick={() => { setReceipt(null); setReceiptPreview(null); }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white grid place-items-center text-xs font-bold">✕</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => receiptRef.current?.click()}
                        className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary py-4 text-sm text-muted-foreground hover:text-primary transition-colors">
                        Click to upload receipt screenshot
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Section>
          </div>

          <aside className="lg:col-span-5">
            <div className="card-elevated p-6 lg:sticky lg:top-24 space-y-4">
              <h3 className="font-display text-xl font-semibold">Your order</h3>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {(() => {
                  const groups = new Map<string, { name: string; items: typeof items }>();
                  for (const item of items) {
                    const key = item.restaurantSlug ?? "__unknown__";
                    if (!groups.has(key)) groups.set(key, { name: item.restaurantName ?? "Restaurant", items: [] });
                    groups.get(key)!.items.push(item);
                  }
                  return [...groups.entries()].map(([slug, group]) => (
                    <div key={slug} className="space-y-2">
                      {groups.size > 1 && (
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider border-t border-border pt-2 first:border-0 first:pt-0">{group.name}</p>
                      )}
                      {group.items.map(i => (
                        <div key={i.id} className="flex justify-between text-sm gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold leading-tight">{i.qty} × {i.name}</p>
                          </div>
                          <span className="font-medium">${(i.price * i.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-display text-xl font-bold pt-3 border-t border-border">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12">
                {(() => {
                  const slugs = new Set(items.map(i => i.restaurantSlug ?? "__unknown__"));
                  return slugs.size > 1
                    ? `Place ${slugs.size} orders · $${total.toFixed(2)}`
                    : `Place order · $${total.toFixed(2)}`;
                })()}
              </Button>
              <p className="text-xs text-muted-foreground text-center">By placing your order you agree to our terms.</p>
            </div>
          </aside>
        </form>
      </section>
    </Layout>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-6 lg:p-7 space-y-5">
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">{icon}{title}</h2>
      {children}
    </div>
  );
}
function Input({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
    </label>
  );
}
function Choice({ active, onClick, title, sub, icon }: { active: boolean; onClick: () => void; title: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left rounded-2xl p-4 border-2 transition-all ${
        active ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
      }`}>
      <div className="flex items-center gap-2 font-semibold">{icon}{title}</div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </button>
  );
}
