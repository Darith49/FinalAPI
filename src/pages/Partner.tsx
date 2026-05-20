import { Link } from "react-router-dom";
import { TrendingUp, Users, BarChart3, Headphones, Check, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import chef from "@/assets/partner-chef.jpg";

export default function Partner() {
  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="chip bg-background border border-border/60">For restaurants</span>
            <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">
              Grow your kitchen with <em className="text-gradient-warm not-italic">Saveur.</em>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Reach hungry diners in your neighbourhood with zero set-up fees, transparent commissions and tools that put your craft first.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-7 gap-2">
                Get started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="rounded-full h-12 px-7">Talk to sales</Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img src={chef} alt="Chef plating" className="rounded-3xl w-full aspect-[4/5] object-cover shadow-elegant" />
          </div>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { v: "+38%", l: "Avg. revenue lift in 90 days" },
            { v: "12k+", l: "Restaurant partners" },
            { v: "0$", l: "Set-up fee" },
            { v: "24/7", l: "Partner support" },
          ].map(s => (
            <div key={s.l} className="card-elevated p-6 text-center">
              <p className="font-display text-4xl font-bold text-gradient-warm">{s.v}</p>
              <p className="text-sm text-muted-foreground mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-12 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: "More orders", body: "Get discovered by diners actively searching your cuisine." },
            { icon: Users, title: "Loyal customers", body: "Built-in loyalty and re-order tools turn first-timers into regulars." },
            { icon: BarChart3, title: "Smart insights", body: "A clean dashboard for trends, top items, and revenue forecasting." },
            { icon: Headphones, title: "Real human support", body: "Dedicated account managers — not chatbots — for every partner." },
          ].map(b => (
            <div key={b.title} className="card-elevated p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center"><b.icon className="w-6 h-6" /></div>
              <h3 className="font-display text-xl font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-cream">
        <div className="container-x py-20 lg:py-28 grid lg:grid-cols-2 gap-12">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">Simple commissions. No surprises.</h2>
            <p className="text-muted-foreground">Pick the plan that fits your kitchen. Switch anytime.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: "Marketplace", price: "15%", body: "Listing, ordering & payments. We bring you the diners.", features: ["Free menu setup", "Daily payouts", "Basic analytics"] },
              { name: "Plus", price: "25%", body: "Everything in Marketplace + Saveur courier delivery.", features: ["Insulated delivery", "Priority placement", "Loyalty tools"], featured: true },
            ].map(p => (
              <div key={p.name} className={`rounded-3xl p-7 border-2 ${p.featured ? "border-primary bg-card shadow-warm" : "border-border bg-card"}`}>
                {p.featured && <span className="chip bg-primary text-primary-foreground mb-3 inline-flex">Most popular</span>}
                <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                <p className="font-display text-5xl font-bold mt-2">{p.price}<span className="text-base font-normal text-muted-foreground">/order</span></p>
                <p className="text-sm text-muted-foreground mt-2">{p.body}</p>
                <ul className="space-y-2 mt-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-herb" />{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 lg:py-28">
        <div className="rounded-3xl bg-ink text-background p-10 lg:p-16 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">Ready to fill more tables — virtually?</h2>
            <p className="text-background/70 mt-4">Sign up in 5 minutes. Start receiving orders in 48 hours.</p>
          </div>
          <form className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Restaurant name" className="bg-background/10 border border-background/20 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-background/50 focus:border-primary-glow" />
            <input placeholder="City" className="bg-background/10 border border-background/20 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-background/50 focus:border-primary-glow" />
            <input placeholder="Email" className="bg-background/10 border border-background/20 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-background/50 focus:border-primary-glow sm:col-span-2" />
            <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 sm:col-span-2">Apply now</Button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
