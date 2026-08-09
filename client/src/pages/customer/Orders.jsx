import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { formatPrice } from "../../utils/formatPrice";
import * as orderService from "../../services/orderService";

const STATUS_VARIANT = {
  pending: "amber",
  processing: "brand",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner fullPage label="Loading your orders" />;
  if (error) return <div className="mx-auto max-w-2xl px-4 py-16"><ErrorMessage message={error} onRetry={load} /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink-950">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="Your order history will show up here."
            action={<Link to="/products"><Button>Browse Products</Button></Link>}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-mono-data text-sm font-medium text-ink-950">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                  {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono-data text-sm font-semibold text-ink-950">
                  {formatPrice(order.totalAmount)}
                </span>
                <Badge variant={STATUS_VARIANT[order.orderStatus] || "neutral"}>
                  {order.orderStatus}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;