import { useEffect, useState } from "react";
import { Bike, Trash2, Pencil, X, Check, Phone } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiUser, ApiOrder, API_BASE, tokenStore } from "@/lib/api";
import { toast } from "sonner";

function displayName(u: ApiUser): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.username;
}

export default function AdminDelivery() {
  const [drivers, setDrivers] = useState<ApiUser[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ first_name: string; last_name: string; email: string; phone: string }>({ first_name: "", last_name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      // Fetch all orders (bypass pagination by requesting a large page_size)
      const [drvs, ordsRaw] = await Promise.all([
        api.listUsers("delivery"),
        fetch(`${API_BASE}/orders/?page_size=10000`, {
          headers: { Authorization: `Bearer ${tokenStore.access ?? ""}` },
        }).then(r => r.json()),
      ]);
      const ords: ApiOrder[] = Array.isArray(ordsRaw) ? ordsRaw : (ordsRaw.results ?? []);
      setDrivers(drvs);
      setOrders(ords);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const remove = async (id: number) => {
    if (!confirm("Remove this driver? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenStore.access ?? ""}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setDrivers(prev => prev.filter(d => d.id !== id));
      toast.success("Driver removed");
    } catch (e) {
      toast.error("Failed: " + (e as Error).message);
    }
  };

  const startEdit = (d: ApiUser) => {
    setEditId(d.id);
    setEditDraft({ first_name: d.first_name || "", last_name: d.last_name || "", email: d.email, phone: d.phone || "" });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/users/${editId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.access ?? ""}`,
        },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setDrivers(prev => prev.map(d => d.id === editId ? { ...d, ...updated } : d));
      toast.success("Driver updated");
      setEditId(null);
    } catch (e) {
      toast.error("Failed: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (driver: ApiUser) => {
    const currentlyAvailable = !(driver as ApiUser & { is_available?: boolean }).is_available;
    try {
      const res = await fetch(`${API_BASE}/users/${driver.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.access ?? ""}`,
        },
        body: JSON.stringify({ is_available: currentlyAvailable }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, ...updated } : d));
      toast.success(`Driver marked as ${currentlyAvailable ? "Available" : "Unavailable"}`);
    } catch {
      // Optimistic update even if backend doesn't support the field
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, is_available: currentlyAvailable } as ApiUser : d));
      toast.success(`Driver marked as ${currentlyAvailable ? "Available" : "Unavailable"}`);
    }
  };

  const driverStats = (driverId: number) => {
    // Use Number() coercion — the API may return driver as string in some Django versions
    const driverOrders = orders.filter(o => o.driver !== null && Number(o.driver) === Number(driverId));
    const delivered = driverOrders.filter(o => o.status === "delivered").length;
    const active = driverOrders.filter(o => o.status === "out_for_delivery").length;
    const total = driverOrders.length;
    return { delivered, active, total };
  };

  return (
    <DashboardLayout
      title="Delivery staff"
      subtitle={loading ? "Loading…" : `${drivers.length} riders on the network`}
      nav={adminNav}
      brandLabel="Admin"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Loading drivers…</p>
      ) : drivers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No delivery accounts yet. Users can sign up with the Delivery role.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(d => {
            const { delivered, active, total } = driverStats(d.id);
            return (
              <div key={d.id} className="card-elevated p-5 space-y-3">
                {editId === d.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="First name" value={editDraft.first_name} onChange={e => setEditDraft(x => ({ ...x, first_name: e.target.value }))}
                        className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                      <input placeholder="Last name" value={editDraft.last_name} onChange={e => setEditDraft(x => ({ ...x, last_name: e.target.value }))}
                        className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <input placeholder="Email" value={editDraft.email} onChange={e => setEditDraft(x => ({ ...x, email: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                    <input placeholder="Phone" value={editDraft.phone} onChange={e => setEditDraft(x => ({ ...x, phone: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} disabled={saving} size="sm" className="rounded-full bg-herb text-white border-0 gap-1 text-xs h-8">
                        <Check className="w-3 h-3" /> {saving ? "Saving…" : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditId(null)} size="sm" className="rounded-full text-xs h-8">
                        <X className="w-3 h-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-warm text-primary-foreground grid place-items-center font-display font-bold text-lg shrink-0">
                        {displayName(d)[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{displayName(d)}</p>
                        <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Bike className="w-3.5 h-3.5" /> Delivery
                      </span>
                      {d.phone && (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {d.phone}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-secondary/50 rounded-xl py-2">
                        <p className="font-bold text-base">{total}</p>
                        <p className="text-muted-foreground">Total</p>
                      </div>
                      <div className="bg-herb/10 rounded-xl py-2">
                        <p className="font-bold text-base text-herb">{delivered}</p>
                        <p className="text-herb/70">Delivered</p>
                      </div>
                      <div className={`rounded-xl py-2 ${active > 0 ? "bg-primary/10 text-primary" : "bg-secondary/50"}`}>
                        <p className="font-bold text-base">{active}</p>
                        <p className={active > 0 ? "text-primary/70" : "text-muted-foreground"}>Active</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(d)}
                      title="Click to toggle availability"
                      className={"chip w-full justify-center cursor-pointer hover:opacity-80 transition-opacity " + (
                        active > 0
                          ? "bg-primary/10 text-primary"
                          : (d as ApiUser & { is_available?: boolean }).is_available === false
                            ? "bg-destructive/10 text-destructive"
                            : "bg-herb/10 text-herb"
                      )}>
                      {active > 0 ? "🚴 On delivery" : (d as ApiUser & { is_available?: boolean }).is_available === false ? "⛔ Unavailable" : "✅ Available"}
                    </button>
                    <div className="flex gap-2">
                      <Button onClick={() => startEdit(d)} variant="outline" size="sm" className="rounded-full gap-1 text-xs h-8 flex-1">
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button onClick={() => remove(d.id)} variant="outline" size="sm" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}