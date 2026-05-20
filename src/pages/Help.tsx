import { Link } from "react-router-dom";
import { ShoppingBag, CreditCard, Bike, RefreshCw, Shield, MessageSquare, Search, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";

const topics = [
  { icon: ShoppingBag, title: "Orders", body: "Placing, editing, scheduling" },
  { icon: CreditCard, title: "Payments & refunds", body: "Cards, wallets, billing" },
  { icon: Bike, title: "Delivery", body: "Tracking, address, late orders" },
  { icon: RefreshCw, title: "Returns & cancellations", body: "Cancelling and refunds" },
  { icon: Shield, title: "Account & security", body: "Password, privacy, data" },
  { icon: MessageSquare, title: "Restaurant support", body: "Becoming a partner" },
];

const popular = [
  "How do I track my order in real time?",
  "Why was my order cancelled?",
  "How do I update my delivery address?",
  "I was charged twice — what should I do?",
  "How do I close my Saveur account?",
];

export default function Help() {
  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-16 lg:py-24 text-center max-w-2xl mx-auto space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Help center</p>
          <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">How can we help?</h1>
          <div className="bg-card border border-border rounded-full px-5 py-1.5 flex items-center gap-3 shadow-soft text-left">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input placeholder="Describe your issue…" className="flex-1 bg-transparent outline-none text-sm py-2.5" />
          </div>
        </div>
      </section>

      <section className="container-x py-12 lg:py-20">
        <h2 className="font-display text-2xl lg:text-3xl font-semibold mb-6">Browse by topic</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(t => (
            <Link to="/faq" key={t.title} className="card-elevated p-6 hover:border-primary/30 transition-colors flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center"><t.icon className="w-5 h-5" /></div>
              <div className="flex-1">
                <p className="font-display text-lg font-semibold">{t.title}</p>
                <p className="text-sm text-muted-foreground">{t.body}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pb-20 grid lg:grid-cols-2 gap-8">
        <div className="card-elevated p-7">
          <h3 className="font-display text-2xl font-semibold mb-4">Popular questions</h3>
          <ul className="divide-y divide-border">
            {popular.map(p => (
              <li key={p}>
                <Link to="/faq" className="block py-3 text-sm hover:text-primary transition-colors">{p}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-ink text-background p-8 lg:p-10 flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-glow mb-2">Still need help?</p>
          <h3 className="font-display text-3xl font-semibold mb-3">Talk to a human, 24/7.</h3>
          <p className="text-background/70 mb-6">Our support team responds in under 2 minutes via live chat.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground font-semibold shadow-warm">Contact support</Link>
            <a href="mailto:hello@saveur.com" className="px-6 py-3 rounded-full border border-background/20 hover:bg-background/10 font-semibold">Email us</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
