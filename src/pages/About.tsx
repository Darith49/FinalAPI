import { Link } from "react-router-dom";
import { Heart, Users, Globe, Sparkles, ArrowRight, Leaf } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import chefImg from "@/assets/partner-chef.jpg";
import heroImg from "@/assets/hero-feast.jpg";

export default function About() {
  const stats = [
    { v: "2.4M", l: "Meals delivered" },
    { v: "12,000+", l: "Restaurant partners" },
    { v: "85", l: "Cities worldwide" },
    { v: "4.9★", l: "Avg. diner rating" },
  ];
  const values = [
    { icon: Heart, title: "Quality, always", body: "We curate kitchens that cook the way we eat at home — with care and good ingredients." },
    { icon: Users, title: "People first", body: "Fair pay for couriers, fair fees for restaurants, fair prices for diners." },
    { icon: Leaf, title: "Lighter footprint", body: "100% recyclable packaging by default and EV-first deliveries in 30 cities." },
  ];

  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="chip bg-background border border-border/60">About Saveur</span>
            <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">
              We bring your city's <em className="text-gradient-warm not-italic">best tables</em> to you.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Saveur began in 2018 in a tiny Brooklyn loft, with three friends and one idea: ordering food online should feel as joyful as eating out.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img src={heroImg} alt="" className="rounded-3xl w-full aspect-square object-cover shadow-elegant" />
          </div>
        </div>
      </section>

      <section className="container-x py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.l} className="card-elevated p-6 text-center">
              <p className="font-display text-4xl lg:text-5xl font-bold text-gradient-warm">{s.v}</p>
              <p className="text-sm text-muted-foreground mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <img src={chefImg} alt="A chef plating a dish" className="rounded-3xl w-full aspect-[4/5] object-cover shadow-elegant" />
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our story</p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">From a single street to 85 cities.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Six years ago we were a side-project — a way for our favourite neighbourhood spots to reach more diners without losing their soul to a faceless platform. Today, Saveur powers thousands of independent kitchens, family-run restaurants and ambitious chefs across four continents.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Through every order, our north star hasn't changed: protect the craft, support the people behind it, and make every meal feel like an occasion.
          </p>
        </div>
      </section>

      <section className="bg-gradient-cream">
        <div className="container-x py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">What we believe</p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold">Three values, every order.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(v => (
              <div key={v.title} className="card-elevated p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-warm text-primary-foreground grid place-items-center shadow-warm">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 lg:py-28">
        <div className="rounded-3xl bg-ink text-background p-10 lg:p-16 text-center">
          <h2 className="font-display text-4xl lg:text-5xl font-semibold mb-4">Hungry yet?</h2>
          <p className="text-background/70 max-w-xl mx-auto mb-8">Browse hand-picked restaurants near you and order in under a minute.</p>
          <Link to="/restaurants">
            <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-8 gap-2">
              Order food <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
