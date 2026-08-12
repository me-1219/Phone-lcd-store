import { useState, useEffect } from "react";
import { AlertTriangle, ClipboardList, PackagePlus } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ProductSearchSelect from "../../components/common/ProductSearchSelect";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import * as inventoryService from "../../services/inventoryService";

const MOVEMENT_TYPES = ["adjustment", "damage", "purchase_receipt"];

const TYPE_VARIANT = {
  sale: "neutral", return: "success", purchase_receipt: "brand",
  adjustment: "amber", damage: "danger",
};

const AdminInventory = () => {
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ product: null, quantityChange: "", type: "purchase_receipt", reason: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadLowStock = async () => {
    setLoadingLowStock(true);
    try {
      const res = await inventoryService.getLowStockProducts();
      setLowStock(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load low-stock report.");
    } finally {
      setLoadingLowStock(false);
    }
  };

  const loadMovements = async () => {
    setLoadingMovements(true);
    try {
      const res = await inventoryService.getStockMovements({ limit: 20 });
      setMovements(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stock movements.");
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([loadLowStock(), loadMovements()]);
    };
    fetchData();
  }, []);

  const openAdjust = (product = null) => {
    setForm({ product, quantityChange: "", type: "purchase_receipt", reason: "" });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.product || !form.quantityChange || !form.reason.trim()) {
      setFormError("Select a product, enter a quantity change, and a reason.");
      return;
    }

    setSaving(true);
    try {
      await inventoryService.adjustStock({
        productId: form.product._id,
        quantityChange: Number(form.quantityChange),
        type: form.type,
        reason: form.reason,
      });
      setModalOpen(false);
      loadLowStock();
      loadMovements();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not adjust stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Inventory</h1>
          <p className="mt-1 text-sm text-ink-500">Stock levels and movement history.</p>
        </div>
        <Button icon={PackagePlus} onClick={() => openAdjust()}>Adjust Stock</Button>
      </div>

      {/* Low stock */}
      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-danger-500" />
          <h2 className="font-display text-base font-semibold text-ink-950">Low Stock</h2>
        </div>

        <div className="mt-4">
          {loadingLowStock ? (
            <Spinner label="Loading" />
          ) : lowStock.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing is running low right now.</p>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink-950">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.category?.name} {p.sku && `· ${p.sku}`}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-sm text-danger-500">
                      {p.stock} / {p.reorderPoint} reorder pt.
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openAdjust(p)}>
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Movement history */}
      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-base font-semibold text-ink-950">Recent Stock Movements</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          {loadingMovements ? (
            <Spinner label="Loading" />
          ) : error ? (
            <ErrorMessage message={error} onRetry={loadMovements} />
          ) : movements.length === 0 ? (
            <EmptyState title="No movements yet" message="Stock changes will be logged here." />
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Change</th>
                  <th className="px-3 py-2">Stock After</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.map((m) => (
                  <tr key={m._id}>
                    <td className="px-3 py-2.5 text-ink-900">{m.product?.name}</td>
                    <td className="px-3 py-2.5"><Badge variant={TYPE_VARIANT[m.type] || "neutral"}>{m.type}</Badge></td>
                    <td className={`px-3 py-2.5 font-mono-data ${m.quantityChange > 0 ? "text-success-500" : "text-danger-500"}`}>
                      {m.quantityChange > 0 ? "+" : ""}{m.quantityChange}
                    </td>
                    <td className="px-3 py-2.5 font-mono-data text-ink-950">{m.stockAfter}</td>
                    <td className="px-3 py-2.5 text-ink-500">{m.reason || "—"}</td>
                    <td className="px-3 py-2.5 text-ink-500">
                      {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Adjust Stock">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{formError}</p>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Product</label>
            <ProductSearchSelect
              value={form.product}
              onChange={(product) => setForm({ ...form, product })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <Input
            label="Quantity change"
            type="number"
            placeholder="Positive to add, negative to remove"
            value={form.quantityChange}
            onChange={(e) => setForm({ ...form, quantityChange: e.target.value })}
          />

          <Input
            label="Reason"
            placeholder="e.g. Restocked from supplier"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInventory;