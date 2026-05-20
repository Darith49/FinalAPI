import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Apple, Smartphone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-background mt-24">
      <div className="container-x py-16 lg:py-20 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm grid place-items-center shadow-warm">
              <span className="font-display font-black text-primary-foreground text-xl leading-none">S</span>
            </div>
            <span className="font-display text-3xl font-bold">Saveur</span>
          </Link>
          <p className="text-background/70 max-w-sm leading-relaxed">
            Crafted meals from your city's best kitchens — delivered hot, fast and exactly how you like them.
          </p>
          <div className="flex gap-3">
            <a className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 grid place-items-center transition-colors" href="#" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
            <a className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 grid place-items-center transition-colors" href="#" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
            <a className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 grid place-items-center transition-colors" href="#" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>

        <FooterCol title="Discover" links={[
          ["Restaurants", "/restaurants"], ["Cuisines", "/restaurants"], ["Top rated", "/restaurants"], ["Offers", "/restaurants"],
        ]} />
        <FooterCol title="Company" links={[
          ["About", "/about"], ["How it works", "/how-it-works"], ["Careers", "/about"], ["Press", "/about"],
        ]} />
        <FooterCol title="Partners" links={[
          ["For restaurants", "/partner"], ["For riders", "/rider"], ["Enterprise", "/partner"], ["Affiliate", "/partner"],
        ]} />
        <FooterCol title="Help" links={[
          ["Help center", "/help"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Order tracking", "/track"],
        ]} />
      </div>

      <div className="border-t border-background/10">
        <div className="container-x py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
          <p>© {new Date().getFullYear()} Saveur. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/legal" className="hover:text-background">Terms</Link>
            <Link to="/legal" className="hover:text-background">Privacy</Link>
            <Link to="/legal" className="hover:text-background">Cookies</Link>
          </div>
          <div className="flex gap-3">
            <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
              <Apple className="w-4 h-4" /> iOS
            </a>
            <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors">
              <Smartphone className="w-4 h-4" /> Android
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <h4 className="font-display text-base font-semibold text-background">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-background/65 hover:text-background transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
