import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Store, Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { restaurantNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api, ApiRestaurant, ApiOrder } from "@/lib/api";
import { toast } from "sonner";

export default function RestaurantDashboard() {
  const { user, refreshUser } = useAuth();
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", cuisine: "", address: "", phone: "", description: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const mine = await api.myRestaurants();
      setRestaurant(mine[0] ?? null);
      if (mine[0]) {
        const allOrders = await api.listOrders();
        setOrders(allOrders.filter(o => o.restaurant === mine[0].id));
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadAll(); }, []);

  const onPickLogo = (f: File | null) => {
    setLogoFile(f);
    setLogoPreview(f ? URL.createObjectURL(f) : null);
  };

  const createRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.cuisine.trim() || !draft.address.trim()) {
      toast.error("Name, cuisine and address are required.");
      return;
    }
    setCreating(true);
    try {
      const r = await api.createRestaurantWithImage(
        {
          name: draft.name.trim(),
          cuisine: draft.cuisine.trim(),
          address: draft.address.trim(),
          phone: draft.phone.trim(),
          description: draft.description.trim(),
          is_active: true,
          is_open: true,
        },
        logoFile,
      );
      setRestaurant(r);
      toast.success(`${r.name} created!`);
      await refreshUser();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <DashboardLayout title="Loading…" nav={restaurantNav} brandLabel="Restaurant"><div /></DashboardLayout>;
  }

  // No restaurant yet — show create form
  if (!restaurant) {
    return (
      <DashboardLayout title={`Welcome, ${user?.name ?? "Owner"}`} subtitle="Set up your restaurant to get started" nav={restaurantNav} brandLabel="Restaurant">
        <div className="card-elevated p-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center"><Store className="w-6 h-6" /></div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Create your restaurant</h2>
              <p className="text-sm text-muted-foreground">Once created you can add menu items and start receiving orders.</p>
            </div>
          </div>
          <form onSubmit={createRestaurant} className="grid sm:grid-cols-2 gap-4">
            <Input label="Restaurant name *" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} className="sm:col-span-2" />
            <Input label="Cuisine *" value={draft.cuisine} onChange={v => setDraft({ ...draft, cuisine: v })} placeholder="Italian, Mexican, Burgers…" />
            <Input label="Phone" value={draft.phone} onChange={v => setDraft({ ...draft, phone: v })} />
            <Input label="Address *" value={draft.address} onChange={v => setDraft({ ...draft, address: v })} className="sm:col-span-2" />
            <Input label="Description" value={draft.description} onChange={v => setDraft({ ...draft, description: v })} className="sm:col-span-2" />

            <div className="sm:col-span-2 flex items-center gap-4 p-4 rounded-xl bg-secondary/40 border border-border">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary grid place-items-center shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restaurant logo</p>
                <p className="text-xs text-muted-foreground truncate">{logoFile?.name ?? "Optional. PNG or JPG."}</p>
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => onPickLogo(e.target.files?.[0] ?? null)} />
                <span className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2 inline-block">Choose file</span>
              </label>
            </div>

            <Button type="submit" disabled={creating} className="sm:col-span-2 rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 gap-2">
              <Plus className="w-4 h-4" /> {creating ? "Creating…" : "Create restaurant"}
            </Button>
          </form>
        </div>
      </DashboardLayout>
    );
  }

  const today = orders.filter(o => Date.parse(o.created_at) > Date.now() - 86_400_000);
  const revenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
  const pending = orders.filter(o => o.status === "pending").length;

  return (
    <DashboardLayout title={`Welcome, ${user?.name ?? "Owner"}`} subtitle={restaurant.name} nav={restaurantNav} brandLabel="Restaurant">
      <div className="card-elevated p-5 mb-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary grid place-items-center">
          {restaurant.image ? (
            <img src={restaurant.image} alt="logo" className="w-full h-full object-cover" />
          ) : (
            <Store className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">Restaurant logo / cover</p>
          <p className="text-xs text-muted-foreground">PNG, JPG up to a few MB.</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || !restaurant) return;
              try {
                const updated = await api.uploadRestaurantImage(restaurant.slug, f);
                setRestaurant(updated);
                toast.success("Image uploaded");
              } catch (err) { toast.error((err as Error).message); }
            }} />
          <span className="rounded-full bg-foreground text-background text-xs font-semibold px-4 py-2 inline-block">Upload</span>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's orders" value={String(today.length)} accent="primary" />
        <StatCard label="Pending action" value={String(pending)} sub="Need acceptance" accent="accent" />
        <StatCard label="Lifetime revenue" value={`$${revenue.toFixed(2)}`} accent="herb" />
        <StatCard label="Menu items" value={String(restaurant.menu_items.length)} sub="Available now" />
      </div>

      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <Link to="/restaurant/orders" className="text-sm text-primary font-semibold inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50">
                <div className="w-10 h-10 rounded-xl bg-secondary grid place-items-center font-mono text-xs font-bold">#{o.id}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.items.map(i => `${i.quantity}× ${i.name}`).join(", ")}</p>
                </div>
                <StatusBadge status={o.status as never} />
                <span className="font-semibold text-sm w-16 text-right">${parseFloat(o.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Input({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:bg-card transition-colors" />
    </label>
  );
}
