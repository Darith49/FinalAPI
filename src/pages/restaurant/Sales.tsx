import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { restaurantNav } from "@/components/dashboardNav";
import { api, ApiOrder, ApiRestaurant } from "@/lib/api";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--herb))", "hsl(var(--muted-foreground))", "hsl(var(--ring))", "hsl(var(--secondary-foreground))"];

export default function RestaurantSales() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const mine = await api.myRestaurants();
        const r = mine[0] ?? null;
        setRestaurant(r);
        if (r) {
          const all = await api.listOrders();
          setOrders(all.filter(o => o.restaurant === r.id));
        }
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const delivered = orders.filter(o => o.status === "delivered");
  const revenue = delivered.reduce((s, o) => s + parseFloat(o.total), 0);
  const aov = delivered.length ? revenue / delivered.length : 0;

  // Today's sales
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = delivered.filter(o => new Date(o.created_at) >= todayStart);
  const todayRevenue = todayOrders.reduce((s, o) => s + parseFloat(o.total), 0);

  // Top items
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  delivered.forEach(o => o.items.forEach(i => {
    const key = i.name;
    if (!itemMap[key]) itemMap[key] = { name: i.name, qty: 0, revenue: 0 };
    itemMap[key].qty += i.quantity;
    itemMap[key].revenue += parseFloat(i.price) * i.quantity;
  }));
  const top = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);

  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86_400_000;
    const dayOrders = orders.filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= start && t < end && o.status === "delivered";
    });
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      revenue: Number(dayOrders.reduce((s, o) => s + parseFloat(o.total), 0).toFixed(2)),
      orders: dayOrders.length,
    };
  });

  // Peak hours
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 10;
    const v = orders.filter(o => new Date(o.created_at).getHours() === h).length;
    const label = `${h > 12 ? h - 12 : h}${h >= 12 ? "p" : "a"}`;
    return { label, orders: v };
  });

  if (loading) {
    return <DashboardLayout title="Sales report" subtitle="Loading…" nav={restaurantNav} brandLabel="Restaurant"><p className="text-muted-foreground py-12 text-center">Loading…</p></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Sales report" subtitle={`Performance of ${restaurant?.name ?? "your restaurant"}`} nav={restaurantNav} brandLabel="Restaurant">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's revenue" value={`$${todayRevenue.toFixed(2)}`} sub={`${todayOrders.length} orders today`} accent="primary" />
        <StatCard label="Total revenue" value={`$${revenue.toFixed(2)}`} accent="herb" />
        <StatCard label="Avg. order value" value={`$${aov.toFixed(2)}`} accent="accent" />
        <StatCard label="Cancelled" value={String(orders.filter(o => o.status === "cancelled").length)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card-elevated p-6">
          <h2 className="font-display text-xl font-semibold mb-1">Revenue (last 7 days)</h2>
          <p className="text-sm text-muted-foreground mb-4">Daily delivered revenue</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h2 className="font-display text-xl font-semibold mb-1">Top items</h2>
          <p className="text-sm text-muted-foreground mb-4">Revenue share</p>
          <div className="h-64">
            {top.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={top.slice(0, 5)} dataKey="revenue" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {top.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center mt-10">No sales yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated p-6">
          <h2 className="font-display text-xl font-semibold mb-1">Peak hours</h2>
          <p className="text-sm text-muted-foreground mb-4">Orders by hour of day</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Top-selling items</h2>
          <ul className="space-y-3">
            {top.slice(0, 6).map((t, i) => (
              <li key={t.name} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-secondary grid place-items-center font-bold text-sm">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.qty} sold</p>
                </div>
                <span className="font-semibold text-sm">${t.revenue.toFixed(0)}</span>
              </li>
            ))}
            {top.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
