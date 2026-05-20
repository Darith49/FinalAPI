import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingBag, MapPin, X, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/restaurants", label: "Restaurants" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/partner", label: "For restaurants" },
  { to: "/rider", label: "For riders" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const dashHref =
    user?.role === "admin" ? "/admin" :
    user?.role === "restaurant" ? "/restaurant" :
    user?.role === "delivery" ? "/delivery" : "/orders";

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="container-x flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-warm grid place-items-center shadow-warm transition-transform group-hover:scale-105">
            <span className="font-display font-black text-primary-foreground text-lg leading-none">S</span>
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">Saveur</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map(n => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-full hover:bg-secondary/60 transition-colors">
            <MapPin className="w-4 h-4" />
            <span className="hidden xl:inline">Phnom Penh, Cambodia</span>
          </button>
          <Link to="/cart" className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center shadow-warm">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden sm:block">
              <button onClick={() => setMenu(v => !v)}
                className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                <span className="w-8 h-8 rounded-full bg-gradient-warm grid place-items-center text-primary-foreground font-display font-bold text-sm">
                  {user.name[0]}
                </span>
                <span className="text-sm font-semibold">{user.name.split(" ")[0]}</span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-elegant p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role} · {user.email}</p>
                  </div>
                  <Link to={dashHref} onClick={() => setMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary">
                    <LayoutDashboard className="w-4 h-4" /> {user.role === "customer" ? "My orders" : "Dashboard"}
                  </Link>
                  {user.role === "customer" && (
                    <Link to="/profile" onClick={() => setMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary">
                      <UserIcon className="w-4 h-4" /> Profile
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMenu(false); navigate("/"); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary text-destructive">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" className="rounded-full">Sign in</Button>
              </Link>
              <Link to="/signup" className="hidden sm:inline-flex">
                <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm hover:opacity-95">Get started</Button>
              </Link>
            </>
          )}

          <button onClick={() => setOpen(v => !v)} className="lg:hidden w-10 h-10 grid place-items-center rounded-full bg-secondary">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
          <div className="container-x py-4 flex flex-col gap-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold hover:bg-secondary">
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashHref} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-semibold hover:bg-secondary">
                  {user.role === "customer" ? "My orders" : "Dashboard"}
                </Link>
                <button onClick={() => { logout(); setOpen(false); navigate("/"); }}
                  className="text-left px-4 py-3 rounded-xl text-sm font-semibold hover:bg-secondary text-destructive">
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full">Sign in</Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-full bg-gradient-warm text-primary-foreground border-0">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
