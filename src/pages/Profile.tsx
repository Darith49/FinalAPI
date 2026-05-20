import { Link, useNavigate } from "react-router-dom";
import { User, MapPin, CreditCard, Heart, LogOut, ChevronRight, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAddresses } from "@/context/AddressContext";

const FAVS_KEY = "saveur_favs";
function getFavCount(): number {
  try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]").length; } catch { return 0; }
}
const CARDS_KEY = "saveur_payment_cards";
const WALLETS_KEY = "saveur_payment_wallets";
function getPaymentSummary(): string {
  try {
    const cards = JSON.parse(localStorage.getItem(CARDS_KEY) || "[]");
    const wallets = JSON.parse(localStorage.getItem(WALLETS_KEY) || "[]");
    const total = cards.length + wallets.length;
    if (total === 0) return "No payment methods saved";
    const def = cards.find((c: { isDefault: boolean; brand: string; last4: string }) => c.isDefault);
    if (def) return `${def.brand} •••• ${def.last4}${total > 1 ? ` and ${total - 1} more` : ""}`;
    return `${total} method${total > 1 ? "s" : ""} saved`;
  } catch { return "Manage payment methods"; }
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { addresses } = useAddresses();
  const navigate = useNavigate();

  const sections = [
    {
      icon: User,
      title: "Personal info",
      body: "Name, email, phone & password",
      to: "/profile/info",
    },
    {
      icon: MapPin,
      title: "Saved addresses",
      body: `${addresses.length} address${addresses.length === 1 ? "" : "es"} saved`,
      to: "/addresses",
    },
    {
      icon: CreditCard,
      title: "Payment methods",
      body: getPaymentSummary(),
      to: "/profile/payment",
    },
    {
      icon: Heart,
      title: "Favourites",
      body: `${getFavCount()} restaurant${getFavCount() === 1 ? "" : "s"} saved`,
      to: "/profile/favourites",
    },
  ];

  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4">
            <div className="card-elevated p-7 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-warm grid place-items-center text-primary-foreground font-display text-4xl font-bold shadow-warm">
                {initial}
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold">{user?.name ?? "Guest"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex items-center justify-center gap-2 chip bg-accent/15 text-foreground">
                <Star className="w-3.5 h-3.5 fill-accent text-accent" /> Gold member · 1,240 stars
              </div>
              <Link to="/orders">
                <Button variant="outline" className="w-full rounded-full">Order history</Button>
              </Link>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-3">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold mb-4">Account settings</h1>

            {sections.map(s => (
              <Link to={s.to} key={s.title}
                className="block w-full text-left card-elevated p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-secondary grid place-items-center flex-shrink-0">
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ))}

            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full text-left card-elevated p-5 flex items-center gap-4 hover:border-destructive/30 transition-colors mt-6">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive grid place-items-center flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-destructive">Sign out</p>
                <p className="text-sm text-muted-foreground">You can sign back in anytime</p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
