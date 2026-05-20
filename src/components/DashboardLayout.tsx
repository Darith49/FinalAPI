import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

export default function DashboardLayout({
  title,
  subtitle,
  nav,
  brandLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  brandLabel: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-72 lg:min-h-screen bg-ink text-background flex lg:flex-col flex-row items-center lg:items-stretch lg:py-8 lg:px-5 px-4 py-3 gap-2 lg:gap-0 sticky top-0 z-30 border-b lg:border-b-0 lg:border-r border-background/10">
        <Link to="/" className="flex items-center gap-2 lg:mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-warm grid place-items-center shadow-warm">
            <span className="font-display font-black text-primary-foreground text-lg leading-none">S</span>
          </div>
          <div className="hidden lg:block">
            <p className="font-display text-xl font-bold leading-tight">Saveur</p>
            <p className="text-[11px] text-background/60 uppercase tracking-wider">{brandLabel}</p>
          </div>
        </Link>

        <nav className="flex lg:flex-col flex-row flex-1 lg:gap-1 gap-1 overflow-x-auto lg:overflow-visible scrollbar-none">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end
              className={({ isActive }) =>
                `flex-shrink-0 flex items-center gap-3 px-3 lg:px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive ? "bg-background/10 text-background" : "text-background/65 hover:text-background hover:bg-background/5"
                }`
              }>
              <n.icon className="w-4 h-4" />
              <span className="lg:inline hidden md:inline">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block mt-auto pt-6 border-t border-background/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-warm grid place-items-center font-display font-bold text-primary-foreground">
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-background/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-background/75 hover:text-background hover:bg-background/5 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        <button onClick={() => { logout(); navigate("/login"); }}
          className="lg:hidden ml-auto flex-shrink-0 w-9 h-9 rounded-full bg-background/10 grid place-items-center">
          <LogOut className="w-4 h-4" />
        </button>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="px-5 sm:px-8 lg:px-10 pt-8 lg:pt-10 pb-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Link to="/" className="hover:text-foreground">Saveur</Link>
              <ChevronRight className="w-3 h-3" /> {brandLabel}
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-semibold mt-1">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Link to="/"><Button variant="outline" className="rounded-full">View site</Button></Link>
        </header>

        <div className="px-5 sm:px-8 lg:px-10 pb-12">{children}</div>
      </main>
    </div>
  );
}
