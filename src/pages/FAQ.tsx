import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import Layout from "@/components/Layout";

const faqs = [
  { q: "How long does delivery take?", a: "Most orders arrive in 25–35 minutes. You'll see a live, accurate estimate at checkout and can track your order in real time." },
  { q: "Are there delivery fees?", a: "Delivery fees vary by restaurant and distance, typically $0–$3.99. Many partners offer free delivery, and orders over $35 ship free." },
  { q: "Can I schedule an order in advance?", a: "Yes — at checkout, choose 'Schedule for later' to pick a 15-minute delivery window up to 7 days ahead." },
  { q: "What if my order is wrong or late?", a: "Tap 'Help' on the order and our 24/7 support team will resolve it instantly — refunds and re-deliveries on us." },
  { q: "How do I become a Saveur partner?", a: "Visit our For Restaurants page and apply in 5 minutes. Most partners are live within 48 hours." },
  { q: "Do you offer contactless delivery?", a: "Always. Add a delivery note at checkout and your courier will leave the order at your door." },
  { q: "Which payment methods are accepted?", a: "All major credit cards, Apple Pay, Google Pay, PayPal and cash in selected cities." },
  { q: "Can I cancel an order?", a: "Yes, free of charge until the restaurant accepts your order. After that, contact support." },
  { q: "Do you deliver alcohol?", a: "In selected cities, yes. ID verification is required at the door for diners 21+." },
  { q: "How does the loyalty program work?", a: "Earn 1 star per dollar spent. Stars unlock free delivery, exclusive discounts and chef collaborations." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const [q, setQ] = useState("");
  const filtered = faqs.filter(f => (f.q + f.a).toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-16 lg:py-24 text-center max-w-2xl mx-auto space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">Questions, answered.</h1>
          <div className="bg-card border border-border rounded-full px-5 py-1.5 flex items-center gap-3 shadow-soft text-left">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the FAQ"
              className="flex-1 bg-transparent outline-none text-sm py-2.5" />
          </div>
        </div>
      </section>

      <section className="container-x py-12 lg:py-16 max-w-3xl">
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={f.q} className="card-elevated overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left p-5 lg:p-6 flex items-center justify-between gap-4">
                <span className="font-display text-lg font-semibold">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 lg:px-6 pb-5 lg:pb-6 -mt-2 text-muted-foreground leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No results. Try different words.</p>}
        </div>
      </section>
    </Layout>
  );
}
