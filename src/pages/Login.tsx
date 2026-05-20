import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Wifi, WifiOff } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/context/AuthContext";
import { toast } from "sonner";
import heroImg from "@/assets/hero-feast.jpg";

const roleHomes: Record<UserRole, string> = {
  admin: "/admin",
  restaurant: "/restaurant",
  delivery: "/delivery",
  customer: "/orders",
};

export default function Login() {
  const { login, apiOnline, checkingApi } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await login(identifier, password);
    setBusy(false);
    if (!r.ok) { toast.error(r.error || "Login failed"); return; }
    toast.success(`Welcome back, ${r.user!.name}`);
    navigate(roleHomes[r.user!.role]);
  };

  return (
    <Layout>
      <section className="container-x py-12 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Welcome back</p>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">Sign in to Saveur</h1>
            <p className="text-muted-foreground">Order from your favourite kitchens in two taps.</p>
            <p className="text-xs inline-flex items-center gap-1.5 mt-1">
              {checkingApi ? (
                <span className="text-muted-foreground">Checking backend…</span>
              ) : apiOnline ? (
                <><Wifi className="w-3.5 h-3.5 text-herb" /> <span className="text-herb font-semibold">Backend connected</span></>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-destructive" /> <span className="text-destructive font-semibold">Backend offline — start Django (python manage.py runserver)</span></>
              )}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="you@example.com" label="Email"
              value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="••••••••" label="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" disabled={busy || !apiOnline} className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 gap-2">
              {busy ? "Signing in…" : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            New here? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </div>

        <div className="hidden lg:block relative">
          <img src={heroImg} alt="" className="rounded-3xl w-full aspect-[4/5] object-cover shadow-elegant" />
          <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur rounded-2xl p-5 shadow-soft">
            <p className="font-display text-lg font-semibold">"Saveur is the only delivery app I keep on my home screen."</p>
            <p className="text-sm text-muted-foreground mt-2">— Amelia R., Brooklyn</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ icon, label, ...rest }: { icon: React.ReactNode; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 bg-secondary/50 border border-border rounded-xl px-4 focus-within:border-primary focus-within:bg-card transition-colors">
        <span className="text-muted-foreground">{icon}</span>
        <input {...rest} className="flex-1 bg-transparent outline-none text-sm py-3" />
      </div>
    </label>
  );
}
