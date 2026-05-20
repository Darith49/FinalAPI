import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartItem } from "./CartContext";

export type OrderStatus = "pending" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export type Review = {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: number;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  restaurantSlug: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  address: string;
  notes?: string;
  paymentMethod: "card" | "cash" | "wallet";
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  driverId?: string;
  driverName?: string;
  rating?: number;
  reviewId?: string;
};

type OrdersCtx = {
  orders: Order[];
  reviews: Review[];
  createOrder: (o: Omit<Order, "id" | "status" | "createdAt" | "updatedAt">) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  assignDriver: (id: string, driverId: string, driverName: string) => void;
  addReview: (orderId: string, rating: number, comment: string, customerName: string) => Review;
  getOrdersByCustomer: (customerId: string) => Order[];
  getOrdersByRestaurant: (slug: string) => Order[];
  getOrdersByDriver: (driverId: string) => Order[];
  getReviewsByRestaurant: (slug: string) => Review[];
};

const Ctx = createContext<OrdersCtx | null>(null);
const STORAGE = "saveur_orders_v2";
const REVIEWS_STORAGE = "saveur_reviews_v2";

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(REVIEWS_STORAGE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(REVIEWS_STORAGE, JSON.stringify(reviews)); }, [reviews]);

  const createOrder: OrdersCtx["createOrder"] = (o) => {
    const order: Order = {
      ...o,
      id: `SV-${Math.floor(4800 + Math.random() * 200)}`,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const setStatus: OrdersCtx["setStatus"] = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt: Date.now() } : o));
  };
  const assignDriver: OrdersCtx["assignDriver"] = (id, driverId, driverName) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, driverId, driverName, updatedAt: Date.now() } : o));
  };
  const addReview: OrdersCtx["addReview"] = (orderId, rating, comment, customerName) => {
    const review: Review = {
      id: `rv-${Date.now()}`,
      orderId, rating, comment, customerName,
      createdAt: Date.now(),
    };
    setReviews(prev => [review, ...prev]);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating, reviewId: review.id } : o));
    return review;
  };

  const value = useMemo<OrdersCtx>(() => ({
    orders, reviews,
    createOrder, setStatus, assignDriver, addReview,
    getOrdersByCustomer: (id) => orders.filter(o => o.customerId === id),
    getOrdersByRestaurant: (slug) => orders.filter(o => o.restaurantSlug === slug),
    getOrdersByDriver: (id) => orders.filter(o => o.driverId === id),
    getReviewsByRestaurant: (slug) => {
      const orderIds = new Set(orders.filter(o => o.restaurantSlug === slug).map(o => o.id));
      return reviews.filter(r => orderIds.has(r.orderId));
    },
  }), [orders, reviews]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useOrders = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-accent/15 text-accent-foreground border-accent/30",
  preparing: "bg-primary/15 text-primary border-primary/30",
  out_for_delivery: "bg-primary text-primary-foreground border-transparent",
  delivered: "bg-herb/15 text-herb border-herb/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};
