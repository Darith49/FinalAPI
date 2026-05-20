import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Clock, Bike, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { api, ApiRestaurantList } from "@/lib/api";
import { toast } from "sonner";

const FAVS_KEY = "saveur_favs";

function getFavSlugs(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]"); } catch { return []; }
}
function removeFav(slug: string) {
  const next = getFavSlugs().filter(s => s !== slug);
  localStorage.setItem(FAVS_KEY, JSON.stringify(next));
}

export default function Favourites() {
  const [restaurants, setRestaurants] = useState<ApiRestaurantList[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const slugs = getFavSlugs();
      if (!slugs.length) { setRestaurants([]); setLoading(false); return; }
      const all = await api.listRestaurants();
      setRestaurants(all.filter(r => slugs.includes(r.slug)));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unfav = (slug: string, name: string) => {
    removeFav(slug);
    setRestaurants(prev => prev.filter(r => r.slug !== slug));
    toast.success(`${name} removed from favourites.`);
  };

  return (
    <Layout>
      <section className="container-x py-10 lg:py-16">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Saved</p>
        <h1 className="font-display text-4xl font-semibold mt-1 mb-8">Favourites</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : restaurants.length === 0 ? (
          <div className="card-elevated p-12 text-center max-w-md mx-auto space-y-4">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground" />
            <h2 className="font-display text-2xl font-semibold">No favourites yet</h2>
            <p className="text-muted-foreground text-sm">Tap the heart on any restaurant to save it here.</p>
            <Link to="/restaurants">
              <Button className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">Browse restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map(r => (
              <div key={r.slug} className="card-elevated overflow-hidden group">
                <div className="relative">
                  <img
                    src={r.image ?? "/placeholder.svg"}
                    alt={r.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!r.is_open && (
                    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm bg-ink/70 px-3 py-1 rounded-full">Closed</span>
                    </div>
                  )}
                  <button
                    onClick={() => unfav(r.slug, r.name)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm grid place-items-center hover:bg-background transition-colors"
                    aria-label="Remove from favourites"
                  >
                    <Heart className="w-4 h-4 fill-destructive text-destructive" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold leading-tight">{r.name}</h3>
                      <p className="text-xs text-muted-foreground">{r.cuisine}</p>
                    </div>
                    <span className="chip bg-accent/15 text-foreground flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      {parseFloat(r.rating).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.delivery_time} min</span>
                    <span className="flex items-center gap-1"><Bike className="w-3 h-3" />
                      {parseFloat(r.delivery_fee) === 0 ? "Free delivery" : `$${parseFloat(r.delivery_fee).toFixed(2)} delivery`}
                    </span>
                  </div>
                  <Link to={`/restaurants/${r.slug}`}>
                    <Button variant="outline" className="w-full rounded-full text-sm h-9 mt-1">Order now</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
