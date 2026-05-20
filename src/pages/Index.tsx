import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Clock, Bike, Shield, Sparkles, ArrowRight, Quote, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import RestaurantCard from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { cuisines, Restaurant } from "@/data/menu";
import { api, ApiRestaurantList } from "@/lib/api";
import heroImg from "@/assets/hero-feast.jpg";
import riderImg from "@/assets/delivery-rider.jpg";

const PLACEHOLDER = "/placeholder.svg";

function adapt(api: ApiRestaurantList): Restaurant {
  return {
    id: String(api.id), slug: api.slug, name: api.name, cuisine: api.cuisine,
    description: "", image: api.image || PLACEHOLDER,
    rating: parseFloat(api.rating) || 0, reviews: 0,
    deliveryTime: `${api.delivery_time} min`,
    deliveryFee: parseFloat(api.delivery_fee) || 0,
    minOrder: 0, distance: "", priceLevel: 2,
    tags: api.is_open ? [] : ["Closed"], menu: [],
  };
}

export default function Index() {
  const [featured, setFeatured] = useState<Restaurant[]>([]);
  useEffect(() => {
    api.listRestaurants().then(d => setFeatured(d.map(adapt).slice(0, 6))).catch(() => {});
  }, []);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-sunset">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(hsl(var(--ink)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="container-x relative grid lg:grid-cols-12 gap-10 lg:gap-8 pt-12 lg:pt-20 pb-16 lg:pb-24 items-center">
          <div className="lg:col-span-6 space-y-7 animate-fade-up">
            <span className="chip bg-background/80 backdrop-blur border border-border/60 text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Real food, delivered hot
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight">
              The flavours <br className="hidden sm:block" />
              you crave, <em className="text-gradient-warm not-italic">at your door.</em>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Order from kitchens nearby. Real chefs, honest ingredients, delivered hot in 30 minutes or less.
            </p>

            <form className="bg-card border border-border rounded-full p-1.5 pl-5 flex items-center gap-2 shadow-soft max-w-xl">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input type="text" placeholder="Enter your delivery address"
                className="flex-1 bg-transparent outline-none text-sm py-3 placeholder:text-muted-foreground" />
              <Link to="/restaurants">
                <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm hover:opacity-95 h-12 px-6 gap-2">
                  Find food <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </form>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm">
              <Stat icon={<Clock className="w-4 h-4" />} label="Fast delivery" />
              <Stat icon={<Star className="w-4 h-4 fill-accent text-accent" />} label="Top-rated kitchens" />
              <Stat icon={<Shield className="w-4 h-4" />} label="100% safe & contactless" />
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-square max-w-xl mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-warm blur-3xl opacity-30" />
              <img src={heroImg} alt="A spread of gourmet meals" width={1920} height={1280}
                className="relative rounded-full w-full h-full object-cover shadow-elegant border-8 border-background animate-float" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-16 lg:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Browse</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Explore by cuisine</h2>
          </div>
          <Link to="/restaurants" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4">
          {cuisines.map(c => (
            <Link key={c.name} to="/restaurants"
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface hover:bg-surface-strong transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-background grid place-items-center text-2xl shadow-soft transition-transform group-hover:scale-110">
                {c.emoji}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-center">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Discover</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Restaurants on Saveur</h2>
          </div>
          <Link to="/restaurants"><Button variant="outline" className="rounded-full">See all</Button></Link>
        </div>
        {featured.length === 0 ? (
          <div className="card-elevated p-10 text-center text-muted-foreground">
            No restaurants yet. <Link to="/signup" className="text-primary font-semibold">Sign up as a restaurant owner</Link> to add the first one!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(r => <RestaurantCard key={r.id} r={r} />)}
          </div>
        )}
      </section>

      <section className="bg-gradient-cream">
        <div className="container-x py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Simple</p>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">Three steps to a great meal.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { n: "01", title: "Set your address", body: "We instantly show kitchens and dishes available where you are." },
              { n: "02", title: "Choose your meal", body: "Browse menus, customise items, and add everything to your bag." },
              { n: "03", title: "Track to your door", body: "Watch your order live — from the kitchen to your hallway." },
            ].map((s, i) => (
              <div key={s.n} className="card-elevated p-8 space-y-4 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 font-display text-8xl font-black text-primary/5 select-none">{s.n}</div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-warm text-primary-foreground grid place-items-center font-display font-bold shadow-warm">
                  {i + 1}
                </div>
                <h3 className="font-display text-2xl font-semibold">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pb-16 lg:pb-24 pt-12">
        <div className="grid md:grid-cols-2 gap-6">
          <CtaCard title="Bring your kitchen to more diners" body="Sign up as a restaurant owner — add your menu, accept orders, grow."
            cta="Become a partner" to="/signup" tone="primary" />
          <CtaCard title="Earn on your own schedule" body="Sign up as a delivery driver and pick up jobs from any kitchen."
            cta="Start riding" to="/signup" tone="dark" image={riderImg} />
        </div>
      </section>
    </Layout>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="inline-flex items-center gap-2 text-foreground/80">{icon}<span className="font-medium">{label}</span></div>;
}

function CtaCard({ title, body, cta, to, tone, image }: { title: string; body: string; cta: string; to: string; tone: "primary" | "dark"; image?: string }) {
  const isDark = tone === "dark";
  return (
    <Link to={to} className={`relative overflow-hidden rounded-3xl p-8 lg:p-10 group transition-all hover:-translate-y-1 ${
      isDark ? "bg-ink text-background" : "bg-gradient-warm text-primary-foreground"
    } shadow-soft hover:shadow-elegant min-h-[260px] flex flex-col justify-end`}>
      {image && (<>
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      </>)}
      <div className="relative space-y-3">
        <h3 className="font-display text-2xl lg:text-3xl font-semibold leading-tight max-w-md">{title}</h3>
        <p className={`max-w-md ${isDark ? "text-background/75" : "text-primary-foreground/90"}`}>{body}</p>
        <span className="inline-flex items-center gap-2 font-semibold pt-2 group-hover:gap-3 transition-all">
          {cta} <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
