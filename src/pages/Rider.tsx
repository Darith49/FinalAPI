import { Bike, Wallet, Calendar, Shield, ArrowRight, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import rider from "@/assets/delivery-rider.jpg";

export default function Rider() {
  return (
    <Layout>
      <section className="bg-ink text-background">
        <div className="container-x py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="chip bg-background/10 border border-background/20 text-background">For riders</span>
            <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">
              Earn on your <em className="text-gradient-warm not-italic">own schedule.</em>
            </h1>
            <p className="text-lg text-background/75 max-w-xl">
              Deliver with Saveur in over 80 cities. Pick your hours, keep 100% of your tips, cash out daily.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-7 gap-2">
                Apply in 5 minutes <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="rounded-full h-12 px-7 bg-transparent border-background/20 text-background hover:bg-background/10 hover:text-background">
                See earnings calculator
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img src={rider} alt="Smiling courier on bicycle" className="rounded-3xl w-full aspect-[4/5] object-cover shadow-elegant" />
          </div>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { v: "$24/hr", l: "Avg. earnings + tips" },
            { v: "100%", l: "Of tips kept" },
            { v: "Daily", l: "Cash-out available" },
            { v: "0$", l: "Sign-up cost" },
          ].map(s => (
            <div key={s.l} className="card-elevated p-6 text-center">
              <p className="font-display text-4xl font-bold text-gradient-warm">{s.v}</p>
              <p className="text-sm text-muted-foreground mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-12 lg:py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Calendar, title: "Total flexibility", body: "Work mornings, weekends, or whenever it suits you. No minimum hours." },
          { icon: Wallet, title: "Daily payouts", body: "Cash out your earnings any day, instantly to your bank or card." },
          { icon: Shield, title: "Insurance included", body: "Free third-party liability and accident cover on every active trip." },
          { icon: Bike, title: "Bike or car", body: "Deliver on bicycle, e-scooter, motorbike or car. Whichever works for you." },
        ].map(b => (
          <div key={b.title} className="card-elevated p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center"><b.icon className="w-6 h-6" /></div>
            <h3 className="font-display text-xl font-semibold">{b.title}</h3>
            <p className="text-sm text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </section>

      <section className="bg-gradient-cream">
        <div className="container-x py-20 lg:py-28 max-w-3xl mx-auto text-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How to start</p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">From application to first delivery in 48 hours.</h2>
          <ol className="grid sm:grid-cols-3 gap-4 mt-10 text-left">
            {[
              ["Apply online", "Fill out a 5-minute form."],
              ["Get verified", "Quick background and right-to-work check."],
              ["Start earning", "Open the app and accept your first order."],
            ].map(([t, b], i) => (
              <li key={t} className="card-elevated p-6">
                <span className="font-display text-3xl font-bold text-primary">0{i+1}</span>
                <h4 className="font-semibold mt-2">{t}</h4>
                <p className="text-sm text-muted-foreground mt-1">{b}</p>
              </li>
            ))}
          </ol>
          <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm h-12 px-7 mt-4">Apply now</Button>
        </div>
      </section>
    </Layout>
  );
}
