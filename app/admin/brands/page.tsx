"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", featured: false, logo: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then(setBrands).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const brand = await res.json();
        setBrands((prev) => [...prev, brand]);
        setForm({ name: "", description: "", featured: false, logo: "" });
        setShowForm(false);
        toast.success("Brand created!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) { setBrands((prev) => prev.filter((b) => b.id !== id)); toast.success("Deleted"); }
      else toast.error((await res.json().catch(() => ({}))).error || "Failed to delete", { duration: 6000 });
    } catch { toast.error("Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gold-400 text-white px-4 py-2 text-sm hover:bg-gold-500 transition-colors uppercase tracking-wider">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">New Brand</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Brand Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxury" placeholder="e.g., Dior" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Logo URL</label>
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="input-luxury" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-luxury resize-none" placeholder="Brand description..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="featured" className="text-sm">Featured Brand</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">{submitting ? "Saving..." : "Create Brand"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {brands.map((brand) => (
              <div key={brand.id} className="border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} width={40} height={24} className="object-contain h-6" />
                  ) : (
                    <div className="w-10 h-10 bg-gold-50 flex items-center justify-center">
                      <span className="text-gold-600 font-bold text-sm">{brand.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{brand.name}</p>
                    {brand.featured && <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5">Featured</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(brand.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {brands.length === 0 && <div className="col-span-3 p-8 text-center text-gray-400 text-sm">No brands yet</div>}
          </div>
        )}
      </div>
    </div>
  );
}
