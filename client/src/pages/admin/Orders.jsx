
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { formatPrice } from "../../utils/formatPrice";
import * as orderService from "../../services/orderService";

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_VARIANT = {
  pending: "amber",
  processing: "brand",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const res = await orderService.getAllOrders({
          page,
          limit: 15,
          ...(statusFilter ? { status: statusFilter } : {}),
        });

        setOrders(res.data);

        setPagination({
          page: res.page,
          pages: res.pages,
          total: res.total,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    try {
      await orderService.updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: newStatus }
            : o
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setVerifyingId(orderId);

    try {
      await orderService.verifyPayment(orderId);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                paymentStatus: "paid",
              }
            : o
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not verify payment."
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRejectPayment = async (orderId) => {
    const reason = window.prompt(
      "Reason (shown to customer):",
      "Transaction number not found."
    );

    if (reason === null) return;

    setVerifyingId(orderId);

    try {
      await orderService.rejectPayment(orderId, reason);

      alert("Customer notified.");

      // Optional local update if your backend changes
      // payment status after rejection.
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                paymentStatus: "rejected",
              }
            : o
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not send notification."
      );
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">
            Orders
          </h1>

          <p className="mt-1 text-sm text-ink-500">
            {pagination.total} orders
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All statuses</option>

          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        {loading ? (
          <Spinner fullPage label="Loading orders" />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => load(pagination.page)}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            message="Try a different status filter."
          />
        ) : (
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Transaction #</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-mono-data text-ink-950">
                    #{o._id.slice(-8).toUpperCase()}
                  </td>

                  <td className="px-4 py-3 text-ink-700">
                    <p className="text-ink-950">
                      {o.user?.name}
                    </p>

                    <p className="text-xs text-ink-500">
                      {o.user?.email}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-ink-700">
                    {o.items?.length || 0}
                  </td>

                  <td className="px-4 py-3 font-mono-data text-ink-950">
                    {formatPrice(o.totalAmount)}
                  </td>

                  {/* Payment Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          o.paymentStatus === "paid"
                            ? "success"
                            : o.paymentStatus === "rejected"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {o.paymentStatus}
                      </Badge>

                      <span className="text-xs text-ink-500">
                        {o.paymentMethod === "telebirr"
                          ? "Telebirr"
                          : "Cash on Delivery"}
                      </span>
                    </div>
                  </td>

                  {/* Telebirr Transaction Number */}
                  <td className="px-4 py-3 font-mono-data text-xs text-ink-700">
                    {o.paymentMethod === "telebirr"
                      ? o.paymentDetails?.transactionNumber || "—"
                      : "—"}
                  </td>

                  {/* Order Status */}
                  <td className="px-4 py-3">
                    <select
                      value={o.orderStatus}
                      disabled={updatingId === o._id}
                      onChange={(e) =>
                        handleStatusChange(
                          o._id,
                          e.target.value
                        )
                      }
                      className="h-8 rounded-lg border border-border bg-white px-2 text-xs focus:border-brand-500 focus:outline-none"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Payment Actions */}
                  <td className="px-4 py-3">
                    {o.paymentMethod === "telebirr" &&
                      o.paymentStatus !== "paid" && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleVerifyPayment(o._id)
                            }
                            disabled={verifyingId === o._id}
                            title="Verify payment"
                            className="rounded-lg p-1.5 text-success-500 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRejectPayment(o._id)
                            }
                            disabled={verifyingId === o._id}
                            title="Reject / request resubmission"
                            className="rounded-lg p-1.5 text-danger-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from(
            { length: pagination.pages },
            (_, i) => i + 1
          ).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => load(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === pagination.page
                  ? "bg-brand-600 text-white"
                  : "text-ink-700 hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

