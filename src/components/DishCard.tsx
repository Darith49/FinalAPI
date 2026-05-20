import { Plus } from "lucide-react";
import type { Dish } from "@/data/menu";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function DishCard({ dish, restaurant }: { dish: Dish; restaurant?: { slug: string; name: string } }) {
  const { add } = useCart();
  return (
    <div className="group flex gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:shadow-soft transition-all">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-display text-lg font-semibold leading-tight">{dish.name}</h4>
          {dish.tags?.map(t => (
            <span key={t} className="chip bg-primary/10 text-primary">{t}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
        <p className="font-semibold pt-1">${dish.price.toFixed(2)}</p>
      </div>
      <div className="relative flex-shrink-0">
        <img src={dish.image} alt={dish.name} loading="lazy" width={120} height={120}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover" />
        <button
          onClick={() => { add(dish, restaurant); toast.success(`${dish.name} added`); }}
          aria-label={`Add ${dish.name}`}
          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-warm hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
