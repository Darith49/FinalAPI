import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";
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

export default function Signup() {
  const { signup, apiOnline } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast.error("Please accept the Terms to continue."); return; }
    setBusy(true);
    const r = await signup({ name, email, password, role });
    setBusy(false);
    if (!r.ok) { toast.error(r.error || "Signup failed"); return; }
    toast.success(`Welcome, ${r.user!.name}! Your account is ready.`);
    navigate(roleHomes[r.user!.role]);
  };

  return (
    <Layout>
      <section className="container-x py-12 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="max-w-md mx-auto w-full space-y-6 order-2 lg:order-1">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get started</p>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">Create your account</h1>
            <p className="text-muted-foreground">Free forever. No credit card required.</p>
            <p className="text-xs">
              Backend: <span className={apiOnline ? "text-herb font-semibold" : "text-destructive font-semibold"}>
                {apiOnline ? "Django API connected" : "Offline — start: python manage.py runserver"}
              </span>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<User className="w-4 h-4" />} placeholder="Jane Doe" label="Full name"
              value={name} onChange={(e) => setName(e.target.value)} required />
            <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="you@example.com" label="Email"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="At least 6 characters" label="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">I am a</span>
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:bg-card transition-colors">
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant owner</option>
                <option value="delivery">Delivery driver</option>
                <option value="admin">Administrator</option>
              </select>
            </label>

            <label className="text-sm flex items-start gap-2">
              <input type="checkbox" className="accent-primary mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="text-muted-foreground">I agree to Saveur's <Link to="/legal" className="text-primary font-semibold">Terms</Link> and <Link to="/legal" className="text-primary font-semibold">Privacy Policy</Link>.</span>
            </label>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 gap-2">
              {busy ? "Creating…" : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="hidden lg:block relative order-1 lg:order-2">
          <div className="card-elevated p-8 space-y-4">
            <h3 className="font-display text-2xl font-semibold">Why Saveur?</h3>
            <ul className="space-y-3">
              {[
                "Hand-picked restaurants — no junk food",
                "Live order tracking down to the minute",
                "Loyalty stars on every order",
                "App-only deals every week",
              ].map(p => (
                <li key={p} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-herb/10 text-herb grid place-items-center"><Check className="w-3.5 h-3.5" /></span>
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
            <img src={heroImg} alt="" className="rounded-2xl w-full aspect-[4/3] object-cover mt-4" />
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
