import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { restaurantNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiMenuItem, ApiRestaurant } from "@/lib/api";
import { toast } from "sonner";

export default function RestaurantMenu() {
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [items, setItems] = useState<ApiMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "", price: "", category: "" });
  const [draftImage, setDraftImage] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const mine = await api.myRestaurants();
      const r = mine[0] ?? null;
      setRestaurant(r);
      if (r) {
        const all = await api.listMenuItems(r.id);
        setItems(all);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!restaurant) return;
    if (!draft.name || !draft.price) { toast.error("Name and price required"); return; }
    try {
      const created = await api.createMenuItemWithImage({
        restaurant: restaurant.id,
        name: draft.name,
        description: draft.description,
        price: draft.price,
        is_available: true,
      }, draftImage);
      setItems(prev => [created, ...prev]);
      setDraft({ name: "", description: "", price: "", category: "" });
      setDraftImage(null);
      setAdding(false);
      toast.success("Menu item added");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    try {
      await api.deleteMenuItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Item removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (loading) {
    return <DashboardLayout title="Menu management" nav={restaurantNav} brandLabel="Restaurant"><div /></DashboardLayout>;
  }
  if (!restaurant) {
    return (
      <DashboardLayout title="Menu management" subtitle="Create your restaurant first" nav={restaurantNav} brandLabel="Restaurant">
        <div className="card-elevated p-10 text-center">
          <p className="text-muted-foreground mb-4">You need to create your restaurant before adding menu items.</p>
          <Button asChild className="rounded-full"><a href="/restaurant">Go to dashboard</a></Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Menu management" subtitle={`${items.length} items on the menu`} nav={restaurantNav} brandLabel="Restaurant">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setAdding(v => !v)} className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm gap-2">
          <Plus className="w-4 h-4" /> Add item
        </Button>
      </div>

      {adding && (
        <div className="card-elevated p-5 mb-4 grid sm:grid-cols-5 gap-3">
          <input placeholder="Name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
            className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2" />
          <input placeholder="Category (optional)" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}
            className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="Price" type="number" step="0.01" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })}
            className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <Button onClick={add} className="rounded-full bg-foreground text-background">Save</Button>
          <input placeholder="Description" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}
            className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-5" />
          <label className="sm:col-span-5 text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider">Image</span>
            <input type="file" accept="image/*" onChange={e => setDraftImage(e.target.files?.[0] ?? null)}
              className="text-xs" />
            {draftImage && <span className="text-foreground">{draftImage.name}</span>}
          </label>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card-elevated p-10 text-center text-muted-foreground">No menu items yet. Click "Add item" to create the first one.</div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(d => (
                  <tr key={d.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {d.image ? (
                          <img src={d.image} alt={d.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary" />
                        )}
                        <div>
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{d.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold">${parseFloat(d.price).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => remove(d.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
