// Thin API client for the Django REST backend.
// The app now requires the backend to be running (no demo fallback).

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";

const TOKEN_KEY = "saveur_jwt_access";
const REFRESH_KEY = "saveur_jwt_refresh";

export const tokenStore = {
  get access() { return localStorage.getItem(TOKEN_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set(access: string, refresh?: string) {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const token = tokenStore.access;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && "detail" in data && (data as { detail?: string }).detail) ||
      (data && typeof data === "object" && Object.values(data as Record<string, unknown>).flat().join(" ")) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(res.status, String(detail), data);
  }
  return data as T;
}

function safeJson(t: string) { try { return JSON.parse(t); } catch { return t; } }

export async function isApiAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE}/restaurants/`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// Pagination wrapper from DRF.
export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

// ---- Types matching DRF serializers ----
export type ApiUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "restaurant" | "delivery" | "customer";
  phone?: string;
};

export type ApiMenuItem = {
  id: number;
  restaurant: number;
  category: number | null;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
  is_featured: boolean;
};

export type ApiCategory = { id: number; restaurant: number; name: string; sort_order: number };

export type ApiRestaurantList = {
  id: number;
  name: string;
  slug: string;
  cuisine: string;
  image: string | null;
  rating: string;
  delivery_time: number;
  delivery_fee: string;
  is_open: boolean;
};

export type ApiRestaurant = ApiRestaurantList & {
  owner: number;
  description: string;
  address: string;
  phone: string;
  is_active: boolean;
  menu_items: ApiMenuItem[];
  categories: ApiCategory[];
};

export type ApiOrderItem = { id?: number; menu_item?: number | null; name: string; price: string; quantity: number; line_total?: string };
export type ApiOrder = {
  id: number;
  customer: number;
  customer_name: string;
  restaurant: number;
  restaurant_name: string;
  driver: number | null;
  address: number | null;
  subtotal: string;
  delivery_fee: string;
  tax: string;
  total: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  payment_method: "cash" | "card" | "wallet";
  payment_paid: boolean;
  payment_receipt: string | null;
  notes: string;
  items: ApiOrderItem[];
  created_at: string;
  updated_at: string;
};

// Helper for paginated list endpoints — DRF returns either an array or a {results} wrapper.
function unwrap<T>(d: T[] | Paginated<T>): T[] {
  return Array.isArray(d) ? d : d.results ?? [];
}

export type ApiReview = {
  id: number;
  customer: number;
  customer_name: string;
  restaurant: number;
  order: number | null;
  rating: number;
  comment: string;
  created_at: string;
};

export const api = {
  ApiError,

  // ---- Auth ----
  async register(payload: { username: string; email: string; password: string; role?: string; phone?: string; first_name?: string; last_name?: string }) {
    const data = await request<{ user: ApiUser; access: string; refresh: string }>(
      "/auth/register/",
      { method: "POST", body: JSON.stringify(payload) },
    );
    tokenStore.set(data.access, data.refresh);
    return data;
  },
  async login(username: string, password: string) {
    const data = await request<{ access: string; refresh: string }>(
      "/auth/login/",
      { method: "POST", body: JSON.stringify({ username, password }) },
    );
    tokenStore.set(data.access, data.refresh);
    const user = await request<ApiUser>("/auth/me/");
    return { user, ...data };
  },
  async me() { return request<ApiUser>("/auth/me/"); },
  async updateMe(id: number, payload: { first_name?: string; last_name?: string; email?: string; phone?: string; password?: string }) {
    return request<ApiUser>(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  logout() { tokenStore.clear(); },

  // ---- Restaurants ----
  async listRestaurants(params: { search?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    const d = await request<ApiRestaurantList[] | Paginated<ApiRestaurantList>>(
      `/restaurants/${qs.toString() ? `?${qs}` : ""}`,
    );
    return unwrap(d);
  },
  async getRestaurant(slug: string) { return request<ApiRestaurant>(`/restaurants/${slug}/`); },
  async myRestaurants() {
    const d = await request<ApiRestaurant[] | Paginated<ApiRestaurant>>("/restaurants/mine/");
    return unwrap(d);
  },
  async createRestaurant(payload: Partial<ApiRestaurant>) {
    return request<ApiRestaurant>("/restaurants/", { method: "POST", body: JSON.stringify(payload) });
  },
  async createRestaurantWithImage(fields: Record<string, string | number | boolean>, file: File | null) {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
    });
    if (file) fd.append("image", file);
    const headers = new Headers();
    const token = tokenStore.access;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_BASE}/restaurants/`, { method: "POST", headers, body: fd });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      const detail =
        (data && typeof data === "object" && "detail" in data && (data as { detail?: string }).detail) ||
        (data && typeof data === "object" && Object.entries(data as Record<string, unknown>).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")) ||
        `Create failed (${res.status})`;
      throw new ApiError(res.status, String(detail), data);
    }
    return data as ApiRestaurant;
  },
  async updateRestaurant(slug: string, payload: Partial<ApiRestaurant>) {
    return request<ApiRestaurant>(`/restaurants/${slug}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  async uploadRestaurantImage(slug: string, file: File) {
    const fd = new FormData();
    fd.append("image", file);
    const headers = new Headers();
    const token = tokenStore.access;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_BASE}/restaurants/${slug}/`, { method: "PATCH", headers, body: fd });
    if (!res.ok) throw new ApiError(res.status, `Upload failed (${res.status})`, await res.text());
    return res.json() as Promise<ApiRestaurant>;
  },

  // ---- Menu items ----
  async listMenuItems(restaurant?: string | number) {
    const qs = restaurant ? `?restaurant=${encodeURIComponent(restaurant)}` : "";
    const d = await request<ApiMenuItem[] | Paginated<ApiMenuItem>>(`/menu-items/${qs}`);
    return unwrap(d);
  },
  async createMenuItem(payload: Omit<Partial<ApiMenuItem>, "id">) {
    return request<ApiMenuItem>("/menu-items/", { method: "POST", body: JSON.stringify(payload) });
  },
  async createMenuItemWithImage(fields: Record<string, string | number | boolean>, file: File | null) {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v)));
    if (file) fd.append("image", file);
    const headers = new Headers();
    const token = tokenStore.access;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_BASE}/menu-items/`, { method: "POST", headers, body: fd });
    if (!res.ok) throw new ApiError(res.status, `Upload failed (${res.status})`, await res.text());
    return res.json() as Promise<ApiMenuItem>;
  },
  async updateMenuItem(id: number, payload: Partial<ApiMenuItem>) {
    return request<ApiMenuItem>(`/menu-items/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  async deleteMenuItem(id: number) {
    return request<void>(`/menu-items/${id}/`, { method: "DELETE" });
  },

  // ---- Users (admin) ----
  async listUsers(role?: string) {
    const qs = role ? `?role=${encodeURIComponent(role)}` : '';
    const d = await request<ApiUser[] | Paginated<ApiUser>>(`/users/${qs}`);
    return unwrap(d);
  },

  // ---- Orders ----
  async listOrders() {
    const d = await request<ApiOrder[] | Paginated<ApiOrder>>("/orders/");
    return unwrap(d);
  },
  async createOrder(payload: {
    restaurant: number;
    address?: number | null;
    subtotal: number;
    delivery_fee: number;
    tax: number;
    total: number;
    payment_method: "cash" | "card" | "wallet";
    notes?: string;
    items: { menu_item?: number | null; name: string; price: number; quantity: number }[];
  }) {
    return request<ApiOrder>("/orders/", { method: "POST", body: JSON.stringify(payload) });
  },
  async updateOrderStatus(id: number, status: ApiOrder["status"]) {
    return request<ApiOrder>(`/orders/${id}/update_status/`, { method: "POST", body: JSON.stringify({ status }) });
  },

  // ---- Delivery ----
  async availableDeliveries() {
    const d = await request<ApiOrder[]>("/orders/available/");
    return d;
  },
  async acceptDelivery(id: number) {
    return request<ApiOrder>(`/orders/${id}/accept/`, { method: "POST" });
  },

  async uploadReceipt(orderId: number, file: File) {
    const fd = new FormData();
    fd.append('payment_receipt', file);
    const headers = new Headers();
    const token = tokenStore.access;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(`${API_BASE}/orders/${orderId}/upload_receipt/`, {
      method: 'POST', headers, body: fd,
    });
    if (!res.ok) throw new ApiError(res.status, `Receipt upload failed (${res.status})`, await res.text());
    return res.json() as Promise<ApiOrder>;
  },

  // ---- Reviews ----
  async listReviews(restaurantId?: number) {
    const qs = restaurantId ? `?restaurant=${restaurantId}` : "";
    const d = await request<ApiReview[] | Paginated<ApiReview>>(`/reviews/${qs}`);
    return unwrap(d);
  },

  // Allow restaurant to push items directly to delivery pool
  async createDeliveryOrder(payload: {
    restaurant: number;
    subtotal: number;
    delivery_fee: number;
    tax: number;
    total: number;
    notes?: string;
    items: { menu_item?: number | null; name: string; price: number; quantity: number }[];
  }) {
    const order = await request<ApiOrder>("/orders/", {
      method: "POST",
      body: JSON.stringify({ ...payload, payment_method: "cash" }),
    });
    // Immediately advance to 'ready' so it appears in the delivery pool
    return request<ApiOrder>(`/orders/${order.id}/update_status/`, {
      method: "POST",
      body: JSON.stringify({ status: "ready" }),
    });
  },
};