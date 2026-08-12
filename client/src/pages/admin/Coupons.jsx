import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { formatPrice } from "../../utils/formatPrice";
import * as couponService from "../../services/couponService";

const EMPTY_FORM = {
  code: "", discountType: "percentage", discountValue: "",
  maxDiscountAmount: "", minOrderAmount: "", usageLimit: "", expirationDate: "",
};

const STATUS_VARIANT = { active: "success", expired: "danger", disabled: "neutral" };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (initial = false) => {
    if (!initial) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await couponService.getCoupons();
      setCoupons(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialCoupons = async () => {
      await load(true);
    };
    loadInitialCoupons();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      maxDiscountAmount: c.maxDiscountAmount ?? "", minOrderAmount: c.minOrderAmount ?? "",
      usageLimit: c.usageLimit ?? "", expirationDate: c.expirationDate?.slice(0, 10) || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.code || !form.discountValue || !form.expirationDate) {
      setFormError("Code, discount value, and expiration date are required.");
      return;
    }

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    setSaving(true);
    try {
      if (editingId) {
        await couponService.updateCoupon(editingId, payload);
      } else {
        await couponService.createCoupon(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await couponService.deleteCoupon(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete coupon.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Coupons</h1>
          <p className="mt-1 text-sm text-ink-500">{coupons.length} coupons</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Coupon</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        {loading ? (
          <Spinner fullPage label="Loading coupons" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : coupons.length === 0 ? (
          <EmptyState title="No coupons yet" message="Create your first discount code." />
        ) : (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min. Order</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-mono-data font-medium text-ink-950">{c.code}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-ink-700">{formatPrice(c.minOrderAmount)}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {new Date(c.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[c.status] || "neutral"}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-950">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Coupon" : "Add Coupon"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{formError}</p>}

          <Input
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="uppercase"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <Input
              label={form.discountType === "percentage" ? "Discount %" : "Discount amount"}
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            />
          </div>

          {form.discountType === "percentage" && (
            <Input
              label="Max discount amount (optional cap)"
              type="number"
              value={form.maxDiscountAmount}
              onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min. order amount"
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            />
            <Input
              label="Usage limit (blank = unlimited)"
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
          </div>

          <Input
            label="Expiration date"
            type="date"
            value={form.expirationDate}
            onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? "Save Changes" : "Create Coupon"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;