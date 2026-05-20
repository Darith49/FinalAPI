import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { restaurantNav } from "@/components/dashboardNav";
import { api, ApiReview } from "@/lib/api";
import { toast } from "sonner";

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const mine = await api.myRestaurants();
      if (!mine.length) { setLoading(false); return; }
      const restaurantId = mine[0].id;
      const data = await api.listReviews(restaurantId);
      setReviews(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const counts = [5, 4, 3, 2, 1].map(n => reviews.filter(r => r.rating === n).length);

  return (
    <DashboardLayout
      title="Customer reviews"
      subtitle={`${reviews.length} reviews · ${avg.toFixed(1)} average`}
      nav={restaurantNav}
      brandLabel="Restaurant"
    >
      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading reviews…</p>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="card-elevated p-6 text-center">
              <p className="font-display text-6xl font-bold">{avg.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i <= Math.round(avg) ? "fill-accent text-accent" : "text-border"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{reviews.length} total reviews</p>
            </div>

            <div className="lg:col-span-2 card-elevated p-6 space-y-2">
              {[5, 4, 3, 2, 1].map((n, i) => {
                const c = counts[i];
                const pct = reviews.length ? (c / reviews.length) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-3 text-sm">
                    <span className="w-8 inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />{n}
                    </span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-warm" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="card-elevated p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-warm text-primary-foreground grid place-items-center font-display font-bold">
                      {(r.customer_name ?? "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.order ? `Order #${r.order} · ` : ""}
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No reviews yet.</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
