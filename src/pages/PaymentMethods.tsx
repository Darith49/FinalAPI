import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Trash2, Check, Wallet, Banknote } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Card = { id: string; last4: string; brand: string; expiry: string; isDefault: boolean };
type WalletEntry = { id: string; type: "aba" | "acleda"; isDefault: boolean };

const CARDS_KEY = "saveur_payment_cards";
const WALLETS_KEY = "saveur_payment_wallets";

function loadCards(): Card[] {
  try { return JSON.parse(localStorage.getItem(CARDS_KEY) || "[]"); } catch { return []; }
}
function loadWallets(): WalletEntry[] {
  try { return JSON.parse(localStorage.getItem(WALLETS_KEY) || "[]"); } catch { return []; }
}

export default function PaymentMethods() {
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [wallets, setWallets] = useState<WalletEntry[]>(loadWallets);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const persist = (c: Card[], w: WalletEntry[]) => {
    localStorage.setItem(CARDS_KEY, JSON.stringify(c));
    localStorage.setItem(WALLETS_KEY, JSON.stringify(w));
  };

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = form.number.replace(/\s/g, "");
    if (digits.length < 13) { toast.error("Enter a valid card number."); return; }
    const last4 = digits.slice(-4);
    const card: Card = {
      id: `card-${Date.now()}`,
      last4,
      brand: digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card",
      expiry: form.expiry,
      isDefault: cards.length === 0,
    };
    const next = [...cards, card];
    setCards(next);
    persist(next, wallets);
    setForm({ number: "", expiry: "", cvc: "", name: "" });
    setAdding(false);
    toast.success("Card added!");
  };

  const removeCard = (id: string) => {
    const next = cards.filter(c => c.id !== id);
    setCards(next); persist(next, wallets);
    toast.success("Card removed.");
  };

  const setDefaultCard = (id: string) => {
    const next = cards.map(c => ({ ...c, isDefault: c.id === id }));
    setCards(next); persist(next, wallets);
  };

  const addWallet = (type: "aba" | "acleda") => {
    if (wallets.find(w => w.type === type)) { toast.error("Already added."); return; }
    const next = [...wallets, { id: `w-${Date.now()}`, type, isDefault: wallets.length === 0 }];
    setWallets(next); persist(cards, next);
    toast.success(`${type === "aba" ? "ABA" : "ACLEDA"} wallet added!`);
  };

  const removeWallet = (id: string) => {
    const next = wallets.filter(w => w.id !== id);
    setWallets(next); persist(cards, next);
  };

  // Format card number input with spaces
  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16 max-w-2xl">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Wallet</p>
        <h1 className="font-display text-4xl font-semibold mt-1 mb-8">Payment methods</h1>

        {/* Cards */}
        <div className="card-elevated p-6 space-y-4 mb-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Cards
          </h2>

          {cards.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground">No cards saved yet.</p>
          )}

          {cards.map(c => (
            <div key={c.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${c.isDefault ? "border-primary bg-primary/5" : "border-border"}`}>
              <CreditCard className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{c.brand} •••• {c.last4}</p>
                <p className="text-xs text-muted-foreground">Expires {c.expiry}</p>
              </div>
              {c.isDefault
                ? <span className="chip bg-primary/10 text-primary text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Default</span>
                : <button onClick={() => setDefaultCard(c.id)} className="text-xs text-primary font-semibold hover:underline">Set default</button>
              }
              <button onClick={() => removeCard(c.id)} className="w-8 h-8 rounded-full hover:bg-destructive/10 text-destructive grid place-items-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {adding ? (
            <form onSubmit={addCard} className="border-2 border-dashed border-border rounded-2xl p-4 space-y-3">
              <Field label="Cardholder name" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" required />
              <Field label="Card number" value={form.number}
                onChange={e => setForm(p => ({ ...p, number: fmtCard(e.target.value) }))}
                placeholder="1234 5678 9012 3456" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry" value={form.expiry}
                  onChange={e => setForm(p => ({ ...p, expiry: fmtExpiry(e.target.value) }))}
                  placeholder="MM/YY" required />
                <Field label="CVC" value={form.cvc}
                  onChange={e => setForm(p => ({ ...p, cvc: e.target.value.replace(/\D/g,"").slice(0,4) }))}
                  placeholder="123" required />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm text-sm h-9">Save card</Button>
                <Button type="button" variant="outline" className="rounded-full text-sm h-9" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary py-3 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add a card
            </button>
          )}
        </div>

        {/* E-wallets */}
        <div className="card-elevated p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5" /> E-wallets
          </h2>

          {wallets.map(w => (
            <div key={w.id} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border">
              <Wallet className="w-6 h-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{w.type === "aba" ? "ABA Bank (KHQR)" : "ACLEDA Bank (KHQR)"}</p>
                <p className="text-xs text-muted-foreground">Pay by scanning QR at checkout</p>
              </div>
              <button onClick={() => removeWallet(w.id)} className="w-8 h-8 rounded-full hover:bg-destructive/10 text-destructive grid place-items-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex gap-3 flex-wrap">
            {(["aba", "acleda"] as const).map(type => (
              <button key={type} onClick={() => addWallet(type)}
                disabled={!!wallets.find(w => w.type === type)}
                className="flex-1 rounded-2xl border-2 border-dashed border-border hover:border-primary py-3 px-4 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> {type === "aba" ? "ABA Bank" : "ACLEDA Bank"}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl">
            <Banknote className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Cash on delivery is always available at checkout — no setup needed.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-card transition-colors text-sm" />
    </label>
  );
}
