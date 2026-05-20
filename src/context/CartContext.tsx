import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Dish } from "@/data/menu";

export type CartItem = Dish & { qty: number; restaurantSlug?: string; restaurantName?: string };

type CartCtx = {
  items: CartItem[];
  add: (dish: Dish, restaurant?: { slug: string; name: string }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("saveur_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("saveur_cart", JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (dish, restaurant) => {
    setItems(prev => {
      // Use a composite key so the same menu item ID from different restaurants don't collide
      const cartId = restaurant ? `${restaurant.slug}__${dish.id}` : dish.id;
      const existing = prev.find(i => i.id === cartId);
      if (existing) return prev.map(i => i.id === cartId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...dish, id: cartId, qty: 1, restaurantSlug: restaurant?.slug, restaurantName: restaurant?.name }];
    });
  };
  const remove: CartCtx["remove"] = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const setQty: CartCtx["setQty"] = (id, qty) => setItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
  const clear = () => setItems([]);

  const value = useMemo<CartCtx>(() => ({
    items, add, remove, setQty, clear,
    subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
    count: items.reduce((s, i) => s + i.qty, 0),
  }), [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
