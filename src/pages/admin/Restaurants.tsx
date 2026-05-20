import { useEffect, useState } from "react";
import { Star, Pencil, Trash2, X, Check, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiRestaurantList, API_BASE, tokenStore } from "@/lib/api";
import { toast } from "sonner";

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<ApiRestaurantList[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ApiRestaurantList & { delivery_time: number }>>({});
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api.listRestaurants();
      setRestaurants(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const remove = async (slug: string, id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/restaurants/${slug}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenStore.access ?? ""}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setRestaurants(prev => prev.filter(r => r.id !== id));
      toast.success("Restaurant removed");
    } catch (e) {
      toast.error("Failed to remove: " + (e as Error).message);
    }
  };

  const startEdit = (r: ApiRestaurantList) => {
    setEditId(r.id);
    setEditDraft({ name: r.name, cuisine: r.cuisine, delivery_time: r.delivery_time, delivery_fee: r.delivery_fee, is_open: r.is_open });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const target = restaurants.find(r => r.id === editId);
      if (!target) return;
      const res = await fetch(`${API_BASE}/restaurants/${target.slug}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.access ?? ""}`,
        },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setRestaurants(prev => prev.map(r => r.id === editId ? { ...r, ...updated } : r));
      toast.success("Restaurant updated");
      setEditId(null);
    } catch (e) {
      toast.error("Failed to update: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async (r: ApiRestaurantList) => {
    try {
      const res = await fetch(`${API_BASE}/restaurants/${r.slug}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.access ?? ""}`,
        },
        body: JSON.stringify({ is_open: !r.is_open }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setRestaurants(prev => prev.map(x => x.id === r.id ? { ...x, ...updated } : x));
      toast.success(`${r.name} is now ${!r.is_open ? "open" : "closed"}`);
    } catch (e) {
      toast.error("Failed to toggle: " + (e as Error).message);
    }
  };

  return (
    <DashboardLayout
      title="Restaurants"
      subtitle={loading ? "Loading…" : `${restaurants.length} active partners`}
      nav={adminNav}
      brandLabel="Admin"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Loading restaurants…</p>
      ) : restaurants.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No restaurants yet. Restaurant users can create one from their dashboard.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map(r => (
            <div key={r.id} className="card-elevated overflow-hidden flex flex-col">
              {r.image ? (
                <img src={r.image} alt={r.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}

              {editId === r.id ? (
                <div className="p-4 space-y-2 flex-1">
                  <input value={editDraft.name || ""} onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
                    placeholder="Name" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <input value={editDraft.cuisine || ""} onChange={e => setEditDraft(d => ({ ...d, cuisine: e.target.value }))}
                    placeholder="Cuisine" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={editDraft.delivery_time || ""} onChange={e => setEditDraft(d => ({ ...d, delivery_time: parseInt(e.target.value) }))}
                      placeholder="Delivery time (min)" className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                    <input type="number" step="0.01" value={editDraft.delivery_fee || ""} onChange={e => setEditDraft(d => ({ ...d, delivery_fee: e.target.value }))}
                      placeholder="Delivery fee" className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={saveEdit} disabled={saving} size="sm" className="rounded-full bg-herb text-white border-0 gap-1 text-xs h-8">
                      <Check className="w-3 h-3" /> {saving ? "Saving…" : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditId(null)} size="sm" className="rounded-full text-xs h-8">
                      <X className="w-3 h-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{r.name}</h3>
                    <button onClick={() => toggleOpen(r)} title={r.is_open ? "Click to close" : "Click to open"}>
                      {r.is_open
                        ? <ToggleRight className="w-6 h-6 text-herb" />
                        : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                      }
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.cuisine}</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border text-xs text-muted-foreground flex-1">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" /> {parseFloat(r.rating).toFixed(1)}
                    </span>
                    <span>{r.delivery_time} min</span>
                    <span>${parseFloat(r.delivery_fee).toFixed(2)} delivery</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => startEdit(r)} variant="outline" size="sm" className="rounded-full gap-1 text-xs h-8 flex-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button onClick={() => remove(r.slug, r.id, r.name)} variant="outline" size="sm" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 text-xs h-8">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
