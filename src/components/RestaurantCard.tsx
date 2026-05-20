import { Link } from "react-router-dom";
import { Star, Clock, Bike } from "lucide-react";
import type { Restaurant } from "@/data/menu";

export default function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <Link to={`/restaurants/${r.slug}`} className="group block card-elevated overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={r.image} alt={r.name} loading="lazy" width={1200} height={800}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {r.tags.slice(0, 2).map(t => (
            <span key={t} className="chip bg-background/95 text-foreground backdrop-blur-sm shadow-soft">{t}</span>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 chip bg-background/95 text-foreground shadow-soft">
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span>{r.rating}</span>
          <span className="text-muted-foreground">({r.reviews.toLocaleString()})</span>
        </div>
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold leading-tight">{r.name}</h3>
          <span className="text-xs font-semibold text-muted-foreground tracking-wider mt-1">
            {"$".repeat(r.priceLevel)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{r.cuisine}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/60 mt-3">
          <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />{r.deliveryTime}</span>
          <span className="inline-flex items-center gap-1.5">
            <Bike className="w-4 h-4" />
            {r.deliveryFee === 0 ? <span className="text-herb font-semibold">Free</span> : `$${r.deliveryFee.toFixed(2)}`}
          </span>
          <span className="ml-auto">{r.distance}</span>
        </div>
      </div>
    </Link>
  );
}
