import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { formatPrice } from "../../utils/formatPrice";
import { QUALITY_GRADES, SORT_OPTIONS } from "../../utils/constants";
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import ImageUpload from "../../components/common/ImageUpload";

const EMPTY_FORM = {
  name: "", description: "", brand: "", compatibleModels: "", qualityGrade: "",
  category: "", sku: "", price: "", discountPrice: "",
  stock: "", imageUrls: [], featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const loadCategories = () => categoryService.getCategories().then((res) => setCategories(res.data));

  const loadProducts = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15, ...filters };
      const res = await productService.getProducts(params);
      setProducts(res.data);
      setPagination({ page: res.page, pages: res.pages, total: res.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    Promise.resolve().then(() => loadProducts(1, {}));
  }, [loadProducts]);

  // debounced filter/search: triggers when search or filters change
  useEffect(() => {
    const t = setTimeout(() => {
      const filters = {
        q: search || undefined,
        category: categoryFilter || undefined,
        sort: sortOrder || undefined,
      };
      // map high-level stock filter to numeric query params the API can understand
      if (stockFilter === "in") {
        filters.minStock = 1;
      } else if (stockFilter === "out") {
        filters.maxStock = 0;
      } else if (stockFilter === "low") {
        // treat low stock as <= 5
        filters.maxStock = 5;
      }
      loadProducts(1, filters);
    }, 400);
    return () => clearTimeout(t);
  }, [search, categoryFilter, stockFilter, sortOrder, loadProducts]);

  const buildFilters = () => {
    const filters = {
      q: search || undefined,
      category: categoryFilter || undefined,
      sort: sortOrder || undefined,
    };
    if (stockFilter === "in") filters.minStock = 1;
    else if (stockFilter === "out") filters.maxStock = 0;
    else if (stockFilter === "low") filters.maxStock = 5;
    return filters;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || "", description: p.description || "", brand: p.brand || "",
      compatibleModels: (p.compatibleModels || []).join(", "),
      qualityGrade: p.qualityGrade || "",
      category: p.category?._id || "", sku: p.sku || "",
      price: p.price ?? "", discountPrice: p.discountPrice ?? "",
      stock: p.stock ?? "", imageUrls: p.images || [],
      featured: !!p.featured,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name || !form.category || !form.price) {
      setFormError("Name, category, and price are required.");
      return;
    }

    const payload = {
      ...form,
      compatibleModels: form.compatibleModels
        ? form.compatibleModels.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      images: form.imageUrls || [],
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: form.stock !== "" ? Number(form.stock) : undefined,
    };

    setSaving(true);
    try {
      if (editingId) {
        // Stock is intentionally omitted on edit — manage stock changes
        // through Inventory so every change gets logged in StockMovement.
        const { ...updatePayload } = payload;
        await productService.updateProduct(editingId, updatePayload);
      } else {
        await productService.createProduct(payload);
      }
      setModalOpen(false);
      loadProducts(pagination.page, buildFilters());
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await productService.deleteProduct(id);
      loadProducts(pagination.page, buildFilters());
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete product.");
    }
  };
const [importOpen, setImportOpen] = useState(false);
const [importJson, setImportJson] = useState("");
const [importFile, setImportFile] = useState(null);
const [importing, setImporting] = useState(false);
const [importResults, setImportResults] = useState(null);
const [importError, setImportError] = useState("");
  // add handlers:
  const handleImportJson = async () => {
    setImportError("");
    setImportResults(null);
    let parsed;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      setImportError("Invalid JSON — check for a trailing comma or missing bracket.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setImportError("JSON must be an array of products.");
      return;
    }
    setImporting(true);
    try {
      const res = await productService.bulkCreateProducts(parsed);
      setImportResults(res.data);
      loadProducts(1, buildFilters());
    } catch (err) {
      setImportError(err.response?.data?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const handleImportCsv = async () => {
    if (!importFile) {
      setImportError("Choose a CSV file first.");
      return;
    }
    setImportError("");
    setImportResults(null);
    setImporting(true);
    try {
      const res = await productService.bulkCreateProductsFromCsv(importFile);
      setImportResults(res.data);
      loadProducts(1, buildFilters());
    } catch (err) {
      setImportError(err.response?.data?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };


  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Products</h1>
          <p className="mt-1 text-sm text-ink-500">{pagination.total} products</p>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:flex xl:w-auto xl:flex-wrap xl:items-center">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full xl:w-64"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-10 rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-10 rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">Sort</option>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" icon={Upload} onClick={() => setImportOpen(true)} className="w-full sm:w-auto">Import</Button>
            <Button icon={Plus} onClick={openCreate} className="w-full sm:w-auto">Add Product</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        {loading ? (
          <Spinner fullPage label="Loading products" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => loadProducts(pagination.page, buildFilters())} />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" message="Add your first product to get started." />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Quality</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink-950">{p.name}</p>
                            <p className="font-mono-data text-xs text-ink-500">{p.sku || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 text-ink-700">{p.brand || "—"}</td>
                      <td className="px-4 py-3 text-ink-700">{p.compatibleModels?.join(", ") || "—"}</td>
                      <td className="px-4 py-3">
                        {p.qualityGrade ? <Badge variant="brand">{p.qualityGrade}</Badge> : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono-data text-ink-950">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock <= (p.reorderPoint ?? 5) ? "font-mono-data text-danger-500" : "font-mono-data text-ink-950"}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-950">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {products.map((p) => (
                <div key={p._id} className="rounded-xl border border-border bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-950">{p.name}</p>
                      <p className="font-mono-data text-xs text-ink-500">{p.sku || "—"}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-950">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-ink-700">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-ink-500">Category</span>
                      <span className="text-right font-medium">{p.category?.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-ink-500">Brand</span>
                      <span className="text-right font-medium">{p.brand || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-ink-500">Price</span>
                      <span className="font-mono-data font-medium text-ink-950">{formatPrice(p.price)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-ink-500">Stock</span>
                      <span className={p.stock <= (p.reorderPoint ?? 5) ? "font-mono-data font-medium text-danger-500" : "font-mono-data font-medium text-ink-950"}>
                        {p.stock}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.qualityGrade && <Badge variant="brand">{p.qualityGrade}</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && !error && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => loadProducts(p, buildFilters())}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === pagination.page ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Product" : "Add Product"} size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{formError}</p>}

          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Compatible models (comma-separated)"
            placeholder="iPhone 11, iPhone 11 Pro"
            value={form.compatibleModels}
            onChange={(e) => setForm({ ...form, compatibleModels: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Quality Grade</label>
              <select
                value={form.qualityGrade}
                onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">—</option>
                {QUALITY_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Discount price" type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>

          {editingId ? (
            <div className="rounded-lg bg-muted px-3 py-2.5 text-xs text-ink-500">
              Stock is managed from the <span className="font-medium text-ink-900">Inventory</span> page so every
              change is logged — it can't be edited here.
            </div>
          ) : (
            <Input label="Opening stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          )}

          <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">Product Images</label>
          <ImageUpload
            value={form.imageUrls || []}
            onChange={(urls) => setForm({ ...form, imageUrls: urls })}
            multiple
            maxFiles={6}
          />
        </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 accent-brand-600"
            />
            Featured on homepage
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" loading={saving} className="w-full sm:w-auto">{editingId ? "Save Changes" : "Create Product"}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Bulk Import Products" size="lg">
  <div className="flex flex-col gap-5">
    {importError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{importError}</p>}

    {importResults && (
      <div className="rounded-lg border border-border p-3 text-sm">
        <p className="font-medium text-ink-950">
          {importResults.created.length} created, {importResults.failed.length} failed
        </p>
        {importResults.failed.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-danger-500">
            {importResults.failed.map((f, i) => (
              <li key={i}>{f.row}: {f.reason}</li>
            ))}
          </ul>
        )}
      </div>
    )}

    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-900">Paste JSON array</label>
      <textarea
        value={importJson}
        onChange={(e) => setImportJson(e.target.value)}
        rows={8}
        placeholder='[{ "name": "...", "category": "...", "price": 0, ... }]'
        className="w-full rounded-lg border border-border p-3 font-mono-data text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <Button className="mt-2" loading={importing} onClick={handleImportJson}>Import JSON</Button>
    </div>

    <div className="border-t border-border pt-4">
      <label className="mb-1.5 block text-sm font-medium text-ink-900">Or upload a CSV</label>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setImportFile(e.target.files[0])}
        className="text-sm"
      />
      <Button className="mt-2" variant="outline" loading={importing} onClick={handleImportCsv}>Import CSV</Button>
    </div>
  </div>
</Modal>
    </div>
  );
};

export default AdminProducts;
