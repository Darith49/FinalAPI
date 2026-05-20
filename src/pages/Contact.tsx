import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Contact() {
  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-16 lg:py-24 max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get in touch</p>
          <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[0.95]">
            We'd love to <em className="text-gradient-warm not-italic">hear from you.</em>
          </h1>
          <p className="text-lg text-muted-foreground">Questions, feedback or just to say hi — we usually reply within 4 hours.</p>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-4">
          {[
            { icon: Mail, title: "Email us", body: "hello@saveur.com", sub: "General enquiries" },
            { icon: MessageSquare, title: "Live chat", body: "Available 24/7", sub: "Avg. response under 2 min" },
            { icon: Phone, title: "Call support", body: "+1 (555) 010-2210", sub: "Mon–Sun, 8am–11pm" },
            { icon: MapPin, title: "Visit us", body: "61 Greene St, Brooklyn, NY", sub: "Headquarters" },
          ].map(c => (
            <div key={c.title} className="card-elevated p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center flex-shrink-0">
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-foreground">{c.body}</p>
                <p className="text-sm text-muted-foreground">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! We'll be in touch soon."); }}
          className="lg:col-span-7 card-elevated p-6 lg:p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name" placeholder="Jane Doe" />
            <Field label="Email" type="email" placeholder="you@example.com" />
          </div>
          <Field label="Subject" placeholder="How can we help?" />
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</span>
            <textarea rows={6} placeholder="Tell us more…"
              className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm resize-none" />
          </label>
          <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm gap-2 h-12 px-7">
            Send message <Send className="w-4 h-4" />
          </Button>
        </form>
      </section>
    </Layout>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
    </label>
  );
}
