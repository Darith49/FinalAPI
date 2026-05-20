import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Plus, Star, Trash2, Pencil, Home, Briefcase, X, Check, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAddresses, Address } from "@/context/AddressContext";
import { toast } from "sonner";

const empty = { label: "Home", recipient: "", phone: "", street: "", apt: "", city: "", zip: "", notes: "" };

export default function Addresses() {
  const { addresses, add, update, remove, setDefault } = useAddresses();
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);

  const closeModal = () => { setEditing(null); setCreating(false); };

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Address book</p>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold mt-2">Saved addresses</h1>
            <p className="text-muted-foreground mt-2">Save your favorite places for one-tap checkout.</p>
          </div>
          <Button onClick={() => setCreating(true)} className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">
            <Plus className="w-4 h-4 mr-1" /> Add address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <EmptyState onAdd={() => setCreating(true)} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {addresses.map(a => (
              <AddressCard key={a.id}
                address={a}
                onEdit={() => setEditing(a)}
                onRemove={() => { remove(a.id); toast.success("Address removed"); }}
                onDefault={() => { setDefault(a.id); toast.success(`${a.label} is now default`); }}
              />
            ))}
          </div>
        )}
      </section>

      {(editing || creating) && (
        <AddressModal
          initial={editing ?? undefined}
          onClose={closeModal}
          onSave={(data) => {
            if (editing) {
              update(editing.id, data);
              toast.success("Address updated");
            } else {
              add(data);
              toast.success("Address added");
            }
            closeModal();
          }}
        />
      )}
    </Layout>
  );
}

function AddressCard({ address, onEdit, onRemove, onDefault }: { address: Address; onEdit: () => void; onRemove: () => void; onDefault: () => void }) {
  const Icon = address.label.toLowerCase() === "home" ? Home : address.label.toLowerCase() === "work" ? Briefcase : MapPin;
  return (
    <div className={`card-elevated p-6 relative ${address.isDefault ? "ring-2 ring-primary/40" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-warm grid place-items-center text-primary-foreground shadow-warm flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{address.label}</h3>
            {address.isDefault && <span className="chip bg-primary/10 text-primary text-xs"><Star className="w-3 h-3 fill-primary" /> Default</span>}
          </div>
          <p className="text-sm text-muted-foreground">{address.recipient}</p>
        </div>
      </div>
      <div className="text-sm space-y-0.5 mb-4">
        <p>{address.street}{address.apt ? `, ${address.apt}` : ""}</p>
        <p>{address.city} {address.zip}</p>
        <p className="text-muted-foreground">{address.phone}</p>
        {address.notes && <p className="text-xs text-muted-foreground italic mt-2">"{address.notes}"</p>}
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {!address.isDefault && (
          <button onClick={onDefault} className="text-xs font-semibold text-primary hover:underline">Set default</button>
        )}
        <div className="ml-auto flex gap-1">
          <button onClick={onEdit} className="w-8 h-8 rounded-lg hover:bg-secondary grid place-items-center" aria-label="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="w-8 h-8 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center" aria-label="Remove">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card-elevated p-12 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-warm grid place-items-center mx-auto mb-5 text-primary-foreground shadow-warm">
        <MapPin className="w-9 h-9" />
      </div>
      <h2 className="font-display text-2xl font-semibold mb-2">No saved addresses yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">Add your home, work, or favorite spots to make checkout one tap.</p>
      <Button onClick={onAdd} className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">
        <Plus className="w-4 h-4 mr-1" /> Add your first address
      </Button>
    </div>
  );
}

function AddressModal({ initial, onClose, onSave }: { initial?: Address; onClose: () => void; onSave: (data: Omit<Address, "id">) => void }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...empty, isDefault: false });
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient || !form.street || !form.city || !form.zip || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave({
      label: form.label || "Home",
      recipient: form.recipient,
      phone: form.phone,
      street: form.street,
      apt: form.apt,
      city: form.city,
      zip: form.zip,
      notes: form.notes,
      isDefault: !!form.isDefault,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="bg-card rounded-3xl shadow-warm w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">{initial ? "Edit address" : "New address"}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary grid place-items-center" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Label" value={form.label} onChange={upd("label")} placeholder="Home, Work, Mom's" />
          <Field label="Recipient name *" value={form.recipient} onChange={upd("recipient")} required />
          <Field label="Phone *" value={form.phone} onChange={upd("phone")} required />
          <div />
          <Field label="Street address *" value={form.street} onChange={upd("street")} className="sm:col-span-2" required />
          <Field label="Apt / Suite" value={form.apt ?? ""} onChange={upd("apt")} />
          <Field label="City *" value={form.city} onChange={upd("city")} required />
          <Field label="ZIP / Postal code *" value={form.zip} onChange={upd("zip")} required />
          <Field label="Delivery notes" value={form.notes ?? ""} onChange={upd("notes")} placeholder="Leave at door, gate code…" className="sm:col-span-2" />
        </div>

        <label className="flex items-center gap-2 mt-5 cursor-pointer">
          <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm(p => ({ ...p, isDefault: e.target.checked }))}
            className="w-4 h-4 rounded accent-primary" />
          <span className="text-sm">Set as default address</span>
        </label>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" className="rounded-full flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="rounded-full flex-1 bg-gradient-warm text-primary-foreground border-0 shadow-warm">
            <Check className="w-4 h-4 mr-1" /> {initial ? "Save changes" : "Add address"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
    </label>
  );
}
