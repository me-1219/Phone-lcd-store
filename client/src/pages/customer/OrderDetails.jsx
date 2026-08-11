import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle2, ImageOff, Download } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { formatPrice } from "../../utils/formatPrice";
import * as orderService from "../../services/orderService";

const STATUS_VARIANT = {
  pending: "amber",
  processing: "brand",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
};

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Order not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;

    setCancelling(true);
    setCancelError("");
    try {
      await orderService.cancelOrder(id);
      await load();
    } catch (err) {
      setCancelError(err.response?.data?.message || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      await orderService.downloadInvoice(order._id);
    } catch (err) {
      alert("Could not download invoice.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) return <Spinner fullPage label="Loading order" />;
  if (error || !order) {
    return <div className="mx-auto max-w-2xl px-4 py-16"><ErrorMessage message={error} onRetry={load} /></div>;
  }

  const canCancel = ["pending", "processing"].includes(order.orderStatus);

  
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {justPlaced && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" />
          <p className="text-sm text-success-500">
            Order placed successfully! We'll update you as it moves through processing.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono-data font-display text-xl font-semibold text-ink-950">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Placed {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[order.orderStatus] || "neutral"}>
          {order.orderStatus}
        </Badge>
      </div>

      {cancelError && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
          {cancelError}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-sm font-semibold text-ink-950">Items</h2>
        <div className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.product._id} className="flex items-center gap-3 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-4 w-4 text-ink-300" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-950">{item.product.name}</p>
                <p className="text-xs text-ink-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-mono-data text-sm font-semibold text-ink-950">
                {formatPrice(item.priceAtOrder * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-success-500">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span className="font-mono-data">-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-ink-950">
            <span>Total</span>
            <span className="font-mono-data">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-sm font-semibold text-ink-950">Shipping Address</h2>
          <p className="mt-2 text-sm text-ink-500">
            {order.shippingAddress?.street}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.region}<br />
            {order.shippingAddress?.country}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-sm font-semibold text-ink-950">Payment</h2>
          <p className="mt-2 text-sm text-ink-500">
            Method: <span className="capitalize text-ink-900">{order.paymentMethod}</span><br />
            Status: <span className="capitalize text-ink-900">{order.paymentStatus}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>

        <Button variant="outline" icon={Download} loading={downloadingInvoice} onClick={handleDownloadInvoice}>
          Download Invoice
        </Button>

        {canCancel && (
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;