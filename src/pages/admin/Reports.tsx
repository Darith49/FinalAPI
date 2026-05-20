import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { adminNav } from "@/components/dashboardNav";
import { api, ApiOrder } from "@/lib/api";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--herb))", "hsl(var(--ring))", "hsl(var(--secondary-foreground))", "hsl(var(--muted-foreground))"];

export default function AdminReports() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.listOrders();
        setOrders(data);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const delivered = orders.filter(o => o.status === "delivered");
  const revenue = delivered.reduce((s, o) => s + parseFloat(o.total), 0);
  const cancelled = orders.filter(o => o.status === "cancelled").length;
  const aov = delivered.length ? revenue / delivered.length : 0;

  // By restaurant
  const byRest: Record<number, { name: string; orders: number; revenue: number }> = {};
  delivered.forEach(o => {
    if (!byRest[o.restaurant]) byRest[o.restaurant] = { name: o.restaurant_name, orders: 0, revenue: 0 };
    byRest[o.restaurant].orders++;
    byRest[o.restaurant].revenue += parseFloat(o.total);
  });
  const top = Object.values(byRest).sort((a, b) => b.revenue - a.revenue);

  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86_400_000;
    const dayOrders = orders.filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= start && t < end;
    });
    const dayDelivered = dayOrders.filter(o => o.status === "delivered");
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      revenue: Number(dayDelivered.reduce((s, o) => s + parseFloat(o.total), 0).toFixed(2)),
      orders: dayOrders.length,
    };
  });

  // Status breakdown
  const statusGroups = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;
  const statusData = statusGroups.map(s => ({
    name: s.replace(/_/g, " "),
    value: orders.filter(o => o.status === s).length,
  })).filter(s => s.value > 0);

  // Payment mix
  const payments = ["card", "wallet", "cash"] as const;
  const paymentData = payments.map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: orders.filter(o => o.payment_method === p).length,
  })).filter(p => p.value > 0);

  const exportCSV = () => {
    const header = ["Order ID", "Date", "Restaurant", "Customer", "Status", "Payment", "Total"];
    const rows = orders.map(o => [
      `#${o.id}`,
      new Date(o.created_at).toISOString(),
      `"${o.restaurant_name}"`,
      `"${o.customer_name}"`,
      o.status,
      o.payment_method,
      parseFloat(o.total).toFixed(2),
    ].join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saveur-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${orders.length} orders to CSV`);
  };

  const exportPDF = () => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) { toast.error("Pop-up blocked. Allow pop-ups to export PDF."); return; }
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Saveur Sales Report</title>
      <style>
        body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:40px;max-width:780px;margin:auto}
        h1{font-size:28px;margin:0 0 4px;color:#c2410c}
        .sub{color:#777;margin-bottom:28px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
        .stat{border:1px solid #e5e5e5;border-radius:12px;padding:14px}
        .stat .l{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#888}
        .stat .v{font-size:22px;font-weight:700;margin-top:4px}
        table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
        th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
        th{background:#fafafa;text-transform:uppercase;font-size:11px;letter-spacing:.05em;color:#666}
        h2{font-size:18px;margin:32px 0 8px;color:#1a1a1a}
        .meta{color:#888;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px}
        @media print{body{padding:24px}}
      </style></head><body>
      <h1>Saveur — Platform Sales Report</h1>
      <p class="sub">Generated ${new Date().toLocaleString()}</p>
      <div class="grid">
        <div class="stat"><div class="l">Revenue</div><div class="v">$${revenue.toFixed(2)}</div></div>
        <div class="stat"><div class="l">Orders</div><div class="v">${orders.length}</div></div>
        <div class="stat"><div class="l">Avg. order</div><div class="v">$${aov.toFixed(2)}</div></div>
        <div class="stat"><div class="l">Cancelled</div><div class="v">${cancelled}</div></div>
      </div>
      <h2>Top restaurants</h2>
      <table><thead><tr><th>#</th><th>Restaurant</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>
        ${top.slice(0, 10).map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.orders}</td><td>$${r.revenue.toFixed(2)}</td></tr>`).join("")}
      </tbody></table>
      <h2>Daily revenue (last 7 days)</h2>
      <table><thead><tr><th>Day</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>
        ${days.map(d => `<tr><td>${d.label}</td><td>${d.orders}</td><td>$${d.revenue.toFixed(2)}</td></tr>`).join("")}
      </tbody></table>
      <h2>All orders</h2>
      <table><thead><tr><th>ID</th><th>Date</th><th>Restaurant</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>
        ${orders.slice(0, 50).map(o => `<tr><td>#${o.id}</td><td>${new Date(o.created_at).toLocaleDateString()}</td><td>${o.restaurant_name}</td><td>${o.customer_name}</td><td>${o.status}</td><td>$${parseFloat(o.total).toFixed(2)}</td></tr>`).join("")}
      </tbody></table>
      <p class="meta">Saveur · saveur.com · This report is generated for internal use only.</p>
      <script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
      </body></html>`;
    win.document.write(html);
    win.document.close();
    toast.success("Report ready — choose 'Save as PDF' in the print dialog");
  };

  return (
    <DashboardLayout title="Reports" subtitle="Sales, orders & operational insights" nav={adminNav} brandLabel="Admin">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={exportCSV} variant="outline" className="rounded-full">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
        <Button onClick={exportPDF} className="rounded-full bg-gradient-warm text-primary-foreground border-0 shadow-warm">
          <FileText className="w-4 h-4 mr-1" /> Export PDF
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading report data…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Revenue" value={`$${revenue.toFixed(2)}`} accent="primary" />
            <StatCard label="Orders" value={String(orders.length)} accent="herb" />
            <StatCard label="Avg. order value" value={`$${aov.toFixed(2)}`} accent="accent" />
            <StatCard label="Cancellations" value={String(cancelled)} sub={`${((cancelled / Math.max(1, orders.length)) * 100).toFixed(1)}% of orders`} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 card-elevated p-6">
              <h2 className="font-display text-xl font-semibold mb-1">Revenue trend</h2>
              <p className="text-sm text-muted-foreground mb-4">Daily delivered revenue (last 7 days)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#adminRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-elevated p-6">
              <h2 className="font-display text-xl font-semibold mb-1">Order status</h2>
              <p className="text-sm text-muted-foreground mb-4">Live distribution</p>
              <div className="h-64">
                {statusData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={3}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center mt-12">No orders yet.</p>}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="card-elevated p-6">
              <h2 className="font-display text-xl font-semibold mb-1">Orders per day</h2>
              <p className="text-sm text-muted-foreground mb-4">Volume trend</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-elevated p-6">
              <h2 className="font-display text-xl font-semibold mb-1">Payment mix</h2>
              <p className="text-sm text-muted-foreground mb-4">By order count</p>
              <div className="h-56">
                {paymentData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center mt-12">No payment data.</p>}
              </div>
            </div>

            <div className="card-elevated p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Top restaurants</h2>
              <ul className="space-y-3">
                {top.slice(0, 6).map((r, i) => (
                  <li key={r.name} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-secondary grid place-items-center font-bold text-sm">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.orders} orders</p>
                    </div>
                    <span className="font-semibold text-sm">${r.revenue.toFixed(0)}</span>
                  </li>
                ))}
                {top.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
              </ul>
            </div>
          </div>

          <div className="card-elevated p-6">
            <h2 className="font-display text-xl font-semibold mb-1">Revenue by restaurant</h2>
            <p className="text-sm text-muted-foreground mb-4">Side-by-side comparison</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
