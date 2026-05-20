import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { adminNav } from "@/components/dashboardNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSettings() {
  const [s, setS] = useState({
    platformName: "Saveur",
    supportEmail: "support@saveur.com",
    commission: 15,
    deliveryFee: 2.99,
    freeDeliveryMin: 35,
    taxRate: 8,
    autoAccept: true,
    notifications: true,
  });

  return (
    <DashboardLayout title="System settings" subtitle="Platform-wide configuration" nav={adminNav} brandLabel="Admin">
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }} className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="card-elevated p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">General</h2>
          <Field label="Platform name" value={s.platformName} onChange={(v) => setS({ ...s, platformName: v })} />
          <Field label="Support email" type="email" value={s.supportEmail} onChange={(v) => setS({ ...s, supportEmail: v })} />
        </div>
        <div className="card-elevated p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Pricing</h2>
          <Field label="Commission %" type="number" value={String(s.commission)} onChange={(v) => setS({ ...s, commission: +v })} />
          <Field label="Default delivery fee ($)" type="number" value={String(s.deliveryFee)} onChange={(v) => setS({ ...s, deliveryFee: +v })} />
          <Field label="Free delivery over ($)" type="number" value={String(s.freeDeliveryMin)} onChange={(v) => setS({ ...s, freeDeliveryMin: +v })} />
          <Field label="Tax rate %" type="number" value={String(s.taxRate)} onChange={(v) => setS({ ...s, taxRate: +v })} />
        </div>
        <div className="card-elevated p-6 space-y-4 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Operations</h2>
          <Toggle label="Auto-accept new orders" checked={s.autoAccept} onChange={(v) => setS({ ...s, autoAccept: v })} />
          <Toggle label="Send order notifications" checked={s.notifications} onChange={(v) => setS({ ...s, notifications: v })} />
        </div>
        <Button type="submit" className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-7 lg:col-span-2 w-fit">
          Save changes
        </Button>
      </form>
    </DashboardLayout>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 cursor-pointer">
      <span className="text-sm font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 accent-primary" />
    </label>
  );
}
