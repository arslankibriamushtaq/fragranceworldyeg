"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Category waiting for a "move products to" choice before it can be deleted.
  const [deleting, setDeleting] = useState<{ id: string; count: number; moveTo: string } | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", description: "", image: "" });
    setShowForm((v) => !v || !!editingId);
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name: cat.name || "", description: cat.description || "", image: cat.image || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", image: "" });
  };

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories((prev) => (editingId ? prev.map((c) => (c.id === cat.id ? cat : c)) : [...prev, cat]));
        toast.success(editingId ? "Category updated!" : "Category created!");
        closeForm();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id: string, moveTo?: string) => {
    const url = moveTo ? `/api/categories/${id}?moveTo=${moveTo}` : `/api/categories/${id}`;
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setDeleting(null);
        toast.success(data.moved ? `Deleted — ${data.moved} product(s) moved` : "Deleted");
      } else if (res.status === 409) {
        // Category still has products: ask where to move them.
        const firstOther = categories.find((c) => c.id !== id);
        setDeleting({ id, count: data.productCount, moveTo: firstOther?.id || "" });
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this category?")) return;
    deleteCategory(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-gold-400 text-white px-4 py-2 text-sm hover:bg-gold-500 transition-colors uppercase tracking-wider">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">{editingId ? "Edit Category" : "New Category"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Category Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxury" placeholder="e.g., Men's Perfumes" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Image URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-luxury" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-luxury resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">{submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}</button>
              <button type="button" onClick={closeForm} className="btn-outline-gold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-red-700">
            <strong>{categories.find((c) => c.id === deleting.id)?.name}</strong> has {deleting.count} product(s).
            Move them to another category, then delete.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={deleting.moveTo}
              onChange={(e) => setDeleting({ ...deleting, moveTo: e.target.value })}
              className="input-luxury max-w-xs"
            >
              {categories.filter((c) => c.id !== deleting.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => deleteCategory(deleting.id, deleting.moveTo)}
              disabled={!deleting.moveTo}
              className="bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Move & Delete
            </button>
            <button onClick={() => setDeleting(null)} className="text-sm text-gray-600 hover:text-gray-900">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                  {cat.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(cat)} aria-label="Edit category" className="text-gray-400 hover:text-gold-500 transition-colors p-1">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} aria-label="Delete category" className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <div className="col-span-3 p-8 text-center text-gray-400 text-sm">No categories yet</div>}
          </div>
        )}
      </div>
    </div>
  );
}
