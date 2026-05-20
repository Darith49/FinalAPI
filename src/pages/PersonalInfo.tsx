import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function PersonalInfo() {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    first_name: user?.name?.split(" ")[0] ?? "",
    last_name:  user?.name?.split(" ").slice(1).join(" ") ?? "",
    email:      user?.email ?? "",
    phone:      user?.phone ?? "",
  });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (pwd.next && pwd.next !== pwd.confirm) {
      toast.error("New passwords don't match."); return;
    }
    if (pwd.next && pwd.next.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
      };
      if (pwd.next) payload.password = pwd.next;
      await api.updateMe(Number(user.id), payload);
      await refreshUser();
      setPwd({ current: "", next: "", confirm: "" });
      toast.success("Profile updated!");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16 max-w-2xl">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Account</p>
        <h1 className="font-display text-4xl font-semibold mt-1 mb-8">Personal info</h1>

        <form onSubmit={save} className="space-y-6">
          {/* Basic info */}
          <div className="card-elevated p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold">Basic information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" value={form.first_name} onChange={upd("first_name")} required />
              <Field label="Last name"  value={form.last_name}  onChange={upd("last_name")} />
            </div>
            <Field label="Email address" type="email" value={form.email} onChange={upd("email")} required />
            <Field label="Phone number"  type="tel"   value={form.phone} onChange={upd("phone")} placeholder="+855 XX XXX XXX" />
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</span>
              <p className="mt-1.5 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-muted-foreground">
                {user?.username} <span className="text-xs">(cannot be changed)</span>
              </p>
            </div>
          </div>

          {/* Change password */}
          <div className="card-elevated p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold">Change password</h2>
            <p className="text-sm text-muted-foreground">Leave blank to keep your current password.</p>
            <div className="relative">
              <Field label="New password" type={showPwd ? "text" : "password"}
                value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))}
                placeholder="Min. 6 characters" />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Field label="Confirm new password" type={showPwd ? "text" : "password"}
              value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Repeat new password" />
          </div>

          <Button type="submit" disabled={saving}
            className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-8 gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>
    </Layout>
  );
}

function Field({ label, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input {...rest}
        className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
    </label>
  );
}
