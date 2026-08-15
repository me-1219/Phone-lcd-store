import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import * as categoryService from "../../services/categoryService";
import ImageUpload from "../../components/common/ImageUpload";

const EMPTY_FORM = { name: "", description: "", image: "" };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Avoid synchronous state updates during effect execution which can cause
    // cascading renders. Schedule load to run after the current call stack.
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, description: c.description || "", image: c.image || "" });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, form);
      } else {
        await categoryService.createCategory(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await categoryService.deleteCategory(id);
      load();
    } catch (err) {
      // Backend blocks deletion if products still reference it — surface that clearly.
      alert(err.response?.data?.message || "Could not delete category.");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Categories</h1>
          <p className="mt-1 text-sm text-ink-500">{categories.length} categories</p>
        </div>
        <Button icon={Plus} onClick={openCreate} className="w-full sm:w-auto">Add Category</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
        {loading ? (
          <Spinner fullPage label="Loading categories" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" message="Add your first category." />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink-950">{c.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{c.description || "No description"}</td>
                      <td className="px-4 py-3 text-ink-700">{c.image ? "Yes" : "No"}</td>
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
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {categories.map((c) => (
                <div key={c._id} className="rounded-xl border border-border bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-950">{c.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-950">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-ink-700">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-ink-500">Description</span>
                      <span className="text-right">{c.description || "No description"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-ink-500">Image</span>
                      <span>{c.image ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
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

          <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">Category Image</label>
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
          />
        </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" loading={saving} className="w-full sm:w-auto">{editingId ? "Save Changes" : "Create Category"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;