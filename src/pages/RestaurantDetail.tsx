import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, Bike, MapPin, Heart, Share2, Info } from "lucide-react";
import Layout from "@/components/Layout";
import DishCard from "@/components/DishCard";
import { Button } from "@/components/ui/button";
import { Dish, Restaurant } from "@/data/menu";
import { api, ApiRestaurant } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const PLACEHOLDER = "/placeholder.svg";

function adapt(r: ApiRestaurant): Restaurant {
  const menu: Dish[] = r.menu_items.map(m => ({
    id: String(m.id),
    name: m.name,
    description: m.description,
    price: parseFloat(m.price) || 0,
    image: m.image || PLACEHOLDER,
    category: r.categories.find(c => c.id === m.category)?.name ?? "Menu",
    popular: m.is_featured,
  }));
  return {
    id: String(r.id),
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine,
    description: r.description,
    image: r.image || PLACEHOLDER,
    rating: parseFloat(r.rating) || 0,
    reviews: 0,
    deliveryTime: `${r.delivery_time} min`,
    deliveryFee: parseFloat(r.delivery_fee) || 0,
    minOrder: 0,
    distance: r.address || "",
    priceLevel: 2,
    tags: r.is_open ? [] : ["Closed"],
    menu,
  };
}

export default function RestaurantDetail() {
  const { slug } = useParams();
  const [r, setR] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { count, subtotal } = useCart();
  const [isFav, setIsFav] = useState<boolean>(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('saveur_favs') || '[]');
      return favs.includes(String(slug));
    } catch { return false; }
  });

  const toggleFav = () => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('saveur_favs') || '[]');
      const next = isFav ? favs.filter(s => s !== String(slug)) : [...favs, String(slug)];
      localStorage.setItem('saveur_favs', JSON.stringify(next));
      setIsFav(!isFav);
      if (!isFav) toast.success('Added to favourites!');
      else toast('Removed from favourites');
    } catch {}
  };

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    api.getRestaurant(slug)
      .then(d => { if (!cancelled) setR(adapt(d)); })
      .catch(e => { if (!cancelled) { setError(e.message); toast.error(e.message); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const categories = useMemo(() => {
    if (!r) return [];
    return Array.from(new Set(r.menu.map(d => d.category)));
  }, [r]);
  const [active, setActive] = useState<string | undefined>();
  useEffect(() => { if (categories.length && !active) setActive(categories[0]); }, [categories, active]);

  if (loading) return <Layout><div className="container-x py-20 text-center text-muted-foreground">Loading restaurant…</div></Layout>;
  if (error || !r) return <Layout><div className="container-x py-20 text-center text-destructive">{error || "Restaurant not found"}</div></Layout>;

  return (
    <Layout>
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <section className="container-x -mt-24 relative">
        <div className="card-elevated p-6 lg:p-8 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/restaurants" className="hover:text-foreground">Restaurants</Link>
                <span>·</span>
                <span>{r.cuisine}</span>
              </div>
              <h1 className="font-display text-3xl lg:text-5xl font-semibold leading-tight">{r.name}</h1>
              <p className="text-muted-foreground max-w-2xl">{r.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className={"rounded-full" + (isFav ? " bg-red-50 border-red-300" : "")} onClick={toggleFav}><Heart className={"w-4 h-4" + (isFav ? " fill-red-500 text-red-500" : "")} /></Button>
              <Button variant="outline" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-border/60 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Star className="w-4 h-4 fill-accent text-accent" /> {r.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {r.deliveryTime}</span>
            <span className="inline-flex items-center gap-1.5">
              <Bike className="w-4 h-4" />
              {r.deliveryFee === 0 ? <span className="text-herb font-semibold">Free delivery</span> : `$${r.deliveryFee.toFixed(2)} delivery`}
            </span>
            {r.distance && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {r.distance}</span>}
            <span className="inline-flex items-center gap-1.5"><Info className="w-4 h-4" /> {r.menu.length} items</span>
          </div>
        </div>
      </section>

      <section className="container-x py-10 lg:py-14 grid lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-1 -mx-1 lg:mx-0 overflow-x-auto lg:overflow-visible flex lg:block gap-1 lg:gap-0 pb-2 lg:pb-0">
            {categories.map(c => (
              <button key={c} onClick={() => setActive(c)}
                className={`flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-colors whitespace-nowrap ${
                  active === c ? "bg-foreground text-background" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-12">
          {r.menu.length === 0 ? (
            <div className="card-elevated p-10 text-center text-muted-foreground">
              This restaurant hasn't added any menu items yet.
            </div>
          ) : (
            categories.map(c => (
              <div key={c} id={c} className="space-y-4">
                <h2 className="font-display text-2xl lg:text-3xl font-semibold">{c}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {r.menu.filter(d => d.category === c).map(d => (
                    <DishCard key={d.id} dish={d} restaurant={{ slug: r.slug, name: r.name }} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {count > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
          <Link to="/cart" className="pointer-events-auto bg-ink text-background rounded-full pl-3 pr-2 py-2 flex items-center gap-3 shadow-elegant hover:scale-105 transition-transform">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 grid place-items-center text-sm font-bold">{count}</span>
            <span className="font-semibold text-sm">View cart</span>
            <span className="bg-background/10 rounded-full px-3 py-1.5 text-sm font-semibold">${subtotal.toFixed(2)}</span>
          </Link>
        </div>
      )}
    </Layout>
  );
}
