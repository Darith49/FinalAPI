import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Layout from "@/components/Layout";
import RestaurantCard from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { cuisines, Restaurant } from "@/data/menu";
import { api, ApiRestaurantList } from "@/lib/api";
import { toast } from "sonner";

const sorts = [
  { id: "recommended", label: "Recommended" },
  { id: "rating", label: "Top rated" },
  { id: "fastest", label: "Fastest" },
  { id: "free", label: "Free delivery" },
];

const PLACEHOLDER = "/placeholder.svg";

function adapt(api: ApiRestaurantList): Restaurant {
  return {
    id: String(api.id),
    slug: api.slug,
    name: api.name,
    cuisine: api.cuisine,
    description: "",
    image: api.image || PLACEHOLDER,
    rating: parseFloat(api.rating) || 0,
    reviews: 0,
    deliveryTime: `${api.delivery_time} min`,
    deliveryFee: parseFloat(api.delivery_fee) || 0,
    minOrder: 0,
    distance: "",
    priceLevel: 2,
    tags: api.is_open ? [] : ["Closed"],
    menu: [],
  };
}

export default function Restaurants() {
  const [list, setList] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.listRestaurants()
      .then(d => { if (!cancelled) setList(d.map(adapt)); })
      .catch(e => { if (!cancelled) { setError(e.message); toast.error(e.message); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let l = [...list];
    if (q) l = l.filter(r => (r.name + r.cuisine + r.description).toLowerCase().includes(q.toLowerCase()));
    if (cuisine) l = l.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
    if (sort === "rating") l.sort((a, b) => b.rating - a.rating);
    if (sort === "fastest") l.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    if (sort === "free") l.sort((a, b) => a.deliveryFee - b.deliveryFee);
    return l;
  }, [list, q, cuisine, sort]);

  return (
    <Layout>
      <section className="bg-gradient-sunset border-b border-border/60">
        <div className="container-x py-12 lg:py-16 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Restaurants nearby</p>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight">
              {list.length} kitchens delivering to <span className="text-gradient-warm">your area</span>
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 bg-card border border-border rounded-full px-5 py-2 flex items-center gap-3 shadow-soft">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search restaurants or dishes"
                className="flex-1 bg-transparent outline-none text-sm py-2" />
            </div>
            <Button variant="outline" className="rounded-full bg-card gap-2 h-12">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            <button onClick={() => setCuisine(null)}
              className={`flex-shrink-0 chip px-4 py-2 transition-colors ${
                !cuisine ? "bg-ink text-background" : "bg-card border border-border hover:border-foreground/40"
              }`}>All</button>
            {cuisines.map(c => (
              <button key={c.name} onClick={() => setCuisine(c.name === cuisine ? null : c.name)}
                className={`flex-shrink-0 chip px-4 py-2 transition-colors ${
                  cuisine === c.name ? "bg-ink text-background" : "bg-card border border-border hover:border-foreground/40"
                }`}>
                <span>{c.emoji}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-10 lg:py-14">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> restaurants
          </p>
          <div className="flex gap-2">
            {sorts.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)}
                className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
                  sort === s.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading restaurants…</div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">Couldn't reach the backend: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {list.length === 0 ? "No restaurants yet. Sign up as a restaurant owner to add the first one!" : "No restaurants match your search."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => <RestaurantCard key={r.id} r={r} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
