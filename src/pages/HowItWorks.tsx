import { Link } from "react-router-dom";
import { Search, Utensils, Bike, Smile, Shield, Clock, Wallet } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const steps = [
  { n: 1, icon: Search, title: "Discover", body: "Type your address. We instantly show kitchens delivering to you, sorted by what's loved most.", img: "from-primary/10 to-accent/10" },
  { n: 2, icon: Utensils, title: "Order", body: "Build your bag, add custom notes, apply a promo code, and check out in two taps.", img: "from-accent/10 to-primary/20" },
  { n: 3, icon: Bike, title: "Track", body: "Watch your order live — restaurant prep, courier on the way, and arrival down to the minute.", img: "from-primary/20 to-primary/10" },
  { n: 4, icon: Smile, title: "Enjoy", body: "Hot, fresh and exactly as ordered. Rate your meal and earn loyalty stars on every order.", img: "from-accent/20 to-primary/10" },
];

export default function HowItWorks() {
  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-20 lg:py-28 text-center max-w-3xl mx-auto space-y-5">
          <span className="chip bg-background border border-border/60">How it works</span>
          <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">
            Great food, <em className="text-gradient-warm not-italic">four simple steps.</em>
          </h1>
          <p className="text-lg text-muted-foreground">From craving to first bite — we've thought about every detail so you don't have to.</p>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map(s => (
            <div key={s.n} className={`card-elevated p-8 lg:p-10 bg-gradient-to-br ${s.img} relative overflow-hidden`}>
              <div className="absolute top-6 right-6 font-display text-7xl font-black text-foreground/5">0{s.n}</div>
              <div className="w-14 h-14 rounded-2xl bg-foreground text-background grid place-items-center mb-5">
                <s.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-3xl font-semibold mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-background">
        <div className="container-x py-20 lg:py-28">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-glow mb-2">Promises</p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">What you can expect every time.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "On time, every time", body: "If we're more than 15 minutes late, your delivery is on us." },
              { icon: Shield, title: "Hot & fresh guarantee", body: "Insulated bags and live ETAs keep your meal at restaurant temperature." },
              { icon: Wallet, title: "Honest pricing", body: "No hidden fees. The price you see at the restaurant is the price you pay." },
            ].map(p => (
              <div key={p.title} className="rounded-3xl border border-background/10 bg-background/[0.04] p-7 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-warm grid place-items-center text-primary-foreground"><p.icon className="w-6 h-6" /></div>
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="text-background/70">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 text-center">
        <Link to="/restaurants">
          <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-8">Order something delicious</Button>
        </Link>
      </section>
    </Layout>
  );
}
