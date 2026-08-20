import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Banknote, Clock, AlertTriangle, Users, Package, TrendingUp,
  Wallet, Receipt, Tag,
} from "lucide-react";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import * as adminService from "../../services/adminService";

const StatCard = ({ icon: Icon, label, value, tone = "brand" }) => {
  const TONES = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-100 text-amber-600",
    danger: "bg-red-50 text-danger-500",
    success: "bg-emerald-50 text-success-500",
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-mono-data text-2xl font-semibold text-ink-950">{value}</p>
      <p className="mt-0.5 text-sm text-ink-500">{label}</p>
    </div>
  );
};

const PAYMENT_METHOD_LABEL = { cod: "Cash on Delivery", telebirr: "Telebirr", card: "Card" };

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async ({ suppressLoading = false } = {}) => {
    if (!suppressLoading) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await adminService.getDashboardSummary();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const res = await adminService.getDashboardSummary();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    void initializeDashboard();
  }, []);

  if (loading) return <Spinner fullPage label="Loading dashboard" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const normalizedData = {
    totalSales: 0,
    pendingPayments: 0,
    averageOrderValue: 0,
    totalDiscountGiven: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueByPaymentMethod: [],
    topSellingProducts: [],
    ...(data || {}),
  };

  const paymentTotal = normalizedData.revenueByPaymentMethod.reduce((sum, r) => sum + r.total, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">A quick look at how the store is doing.</p>

      {/* Finance */}
      <h2 className="mt-6 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
        Finance
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote} label="Total Collected" value={formatPrice(normalizedData.totalSales)} tone="success" />
        <StatCard icon={Wallet} label="Pending Payments" value={formatPrice(normalizedData.pendingPayments)} tone="amber" />
        <StatCard icon={Receipt} label="Avg. Order Value" value={formatPrice(normalizedData.averageOrderValue)} />
        <StatCard icon={Tag} label="Discounts Given" value={formatPrice(normalizedData.totalDiscountGiven)} />
      </div>

      {/* Store activity */}
      <h2 className="mt-6 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
        Store Activity
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Pending Orders" value={normalizedData.pendingOrders} tone="amber" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={normalizedData.lowStockCount} tone="danger" />
        <StatCard icon={Users} label="Customers" value={normalizedData.totalUsers} />
        <StatCard icon={Package} label="Items in Stock" value={normalizedData.totalProducts} />
      </div>

      {/* Revenue by payment method */}
      {normalizedData.revenueByPaymentMethod.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-base font-semibold text-ink-950">Revenue by Payment Method</h2>

          <div className="mt-4 space-y-3">
            {normalizedData.revenueByPaymentMethod.map((r) => {
              const pct = paymentTotal > 0 ? Math.round((r.total / paymentTotal) * 100) : 0;
              return (
                <div key={r.method}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-900">{PAYMENT_METHOD_LABEL[r.method] || r.method}</span>
                    <span className="font-mono-data text-ink-950">
                      {formatPrice(r.total)} <span className="text-ink-500">({r.count} orders)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top selling products */}
      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-base font-semibold text-ink-950">Top Selling Products</h2>
        </div>

        {data.topSellingProducts.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">No sales data yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {data.topSellingProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-ink-500">
                    {i + 1}
                  </span>
                  <Link to="/admin/products" className="text-sm font-medium text-ink-950 hover:text-brand-600">
                    {p.name}
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-ink-500">{p.totalSold} sold</span>
                  <span className="font-mono-data text-ink-950">{p.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/admin/inventory" className="rounded-xl border border-border bg-white p-4 text-sm font-medium text-ink-950 hover:border-brand-500 hover:text-brand-600">
          View low-stock items →
        </Link>
        <Link to="/admin/orders" className="rounded-xl border border-border bg-white p-4 text-sm font-medium text-ink-950 hover:border-brand-500 hover:text-brand-600">
          Review pending orders →
        </Link>
        <Link to="/admin/products" className="rounded-xl border border-border bg-white p-4 text-sm font-medium text-ink-950 hover:border-brand-500 hover:text-brand-600">
          Manage products →
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
