import { useEffect, useState } from "react";
import { Search, UserPlus, Trash2, Pencil, X, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { api, ApiUser, API_BASE, tokenStore } from "@/lib/api";
import { toast } from "sonner";

function displayName(u: ApiUser): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.username;
}

function joinedDate(u: ApiUser & { date_joined?: string; created_at?: string }): string {
  const d = u.date_joined || u.created_at;
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

type ExtUser = ApiUser & { date_joined?: string; created_at?: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<ExtUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ApiUser & { password?: string }>>({});
  const [showInvite, setShowInvite] = useState(false);
  const [inviteDraft, setInviteDraft] = useState({ username: "", email: "", first_name: "", last_name: "", role: "customer" as ApiUser["role"], phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data as ExtUser[]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const filtered = users.filter(u =>
    (filter === "all" || u.role === filter) &&
    (displayName(u) + u.email + u.username).toLowerCase().includes(q.toLowerCase())
  );

  const remove = async (id: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await fetch(`${API_BASE}/users/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenStore.access ?? ""}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User removed");
    } catch {
      toast.error("Failed to remove user");
    }
  };

  const startEdit = (u: ExtUser) => {
    setEditId(u.id);
    setEditDraft({ first_name: u.first_name || "", last_name: u.last_name || "", email: u.email, role: u.role, phone: u.phone || "", password: "" });
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (editDraft.first_name !== undefined) payload.first_name = editDraft.first_name;
      if (editDraft.last_name !== undefined) payload.last_name = editDraft.last_name;
      if (editDraft.email) payload.email = editDraft.email;
      if (editDraft.role) payload.role = editDraft.role;
      if (editDraft.phone !== undefined) payload.phone = editDraft.phone;
      if (editDraft.password) payload.password = editDraft.password;

      const res = await fetch(`${API_BASE}/users/${editId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.access ?? ""}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === editId ? { ...u, ...updated } : u));
      toast.success("User updated");
      setEditId(null);
    } catch (e) {
      toast.error("Failed to update user: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const createUser = async () => {
    if (!inviteDraft.username || !inviteDraft.email || !inviteDraft.password) {
      toast.error("Username, email and password are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteDraft),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("User created successfully");
      setShowInvite(false);
      setInviteDraft({ username: "", email: "", first_name: "", last_name: "", role: "customer", phone: "", password: "" });
      await reload();
    } catch (e) {
      toast.error("Failed to create user: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const ROLES: ApiUser["role"][] = ["customer", "restaurant", "delivery", "admin"];

  return (
    <DashboardLayout title="Users" subtitle={`${users.length} accounts on the platform`} nav={adminNav} brandLabel="Admin">
      <div className="card-elevated p-5 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 bg-secondary rounded-full px-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, username or email"
            className="flex-1 bg-transparent outline-none text-sm py-2.5" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-secondary border-0 rounded-full px-4 py-2.5 text-sm font-semibold outline-none">
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="restaurant">Restaurants</option>
          <option value="delivery">Delivery</option>
          <option value="admin">Admins</option>
        </select>
        <Button onClick={() => setShowInvite(v => !v)} className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm gap-2">
          <UserPlus className="w-4 h-4" /> {showInvite ? "Cancel" : "Add user"}
        </Button>
      </div>

      {/* Create user form */}
      {showInvite && (
        <div className="card-elevated p-6 mb-4 space-y-4">
          <h3 className="font-display font-semibold text-lg">Create new user</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Username *" value={inviteDraft.username} onChange={v => setInviteDraft(d => ({ ...d, username: v }))} />
            <Field label="Email *" value={inviteDraft.email} onChange={v => setInviteDraft(d => ({ ...d, email: v }))} type="email" />
            <Field label="First name" value={inviteDraft.first_name} onChange={v => setInviteDraft(d => ({ ...d, first_name: v }))} />
            <Field label="Last name" value={inviteDraft.last_name} onChange={v => setInviteDraft(d => ({ ...d, last_name: v }))} />
            <Field label="Phone" value={inviteDraft.phone} onChange={v => setInviteDraft(d => ({ ...d, phone: v }))} />
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Role</label>
              <select value={inviteDraft.role} onChange={e => setInviteDraft(d => ({ ...d, role: e.target.value as ApiUser["role"] }))}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Field label="Password *" value={inviteDraft.password} onChange={v => setInviteDraft(d => ({ ...d, password: v }))} type="password" className="sm:col-span-2" />
          </div>
          <Button onClick={createUser} disabled={saving} className="rounded-full bg-foreground text-background gap-2">
            <UserPlus className="w-4 h-4" /> {saving ? "Creating…" : "Create user"}
          </Button>
        </div>
      )}

      <div className="card-elevated overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="text-left">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Username</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  editId === u.id ? (
                    <tr key={u.id} className="bg-secondary/30">
                      <td className="px-5 py-2" colSpan={4}>
                        <div className="grid grid-cols-2 gap-2 my-1">
                          <input placeholder="First name" value={editDraft.first_name || ""} onChange={e => setEditDraft(d => ({ ...d, first_name: e.target.value }))}
                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                          <input placeholder="Last name" value={editDraft.last_name || ""} onChange={e => setEditDraft(d => ({ ...d, last_name: e.target.value }))}
                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                          <input placeholder="Email" value={editDraft.email || ""} onChange={e => setEditDraft(d => ({ ...d, email: e.target.value }))}
                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                          <input placeholder="Phone" value={editDraft.phone || ""} onChange={e => setEditDraft(d => ({ ...d, phone: e.target.value }))}
                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                          <select value={editDraft.role || "customer"} onChange={e => setEditDraft(d => ({ ...d, role: e.target.value as ApiUser["role"] }))}
                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <input placeholder="New password (leave blank to keep)" type="password" value={editDraft.password || ""} onChange={e => setEditDraft(d => ({ ...d, password: e.target.value }))}
                            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
                        </div>
                      </td>
                      <td className="px-5 py-2 text-muted-foreground">{joinedDate(u)}</td>
                      <td className="px-5 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={saveEdit} disabled={saving} className="text-herb hover:bg-herb/10 p-1.5 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditId(null)} className="text-muted-foreground hover:bg-secondary p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={u.id}>
                      <td className="px-5 py-3 font-semibold">{displayName(u)}</td>
                      <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{u.username}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="chip bg-secondary capitalize">{u.role}</span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{joinedDate(u)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(u)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(u.id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, className = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-card transition-colors" />
    </label>
  );
}
