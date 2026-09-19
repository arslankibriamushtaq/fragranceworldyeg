"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: 0, minOrder: 0, maxUses: "", freeShipping: false, expiresAt: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/coupons").then((r) => r.json()).then(setCoupons).catch(() => setCoupons([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error("Code is required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code: form.code.toUpperCase(), maxUses: form.maxUses ? Number(form.maxUses) : null }),
      });
      if (res.ok) {
        const coupon = await res.json();
        setCoupons((prev) => [...prev, coupon]);
        setForm({ code: "", type: "PERCENTAGE", value: 0, minOrder: 0, maxUses: "", freeShipping: false, expiresAt: "" });
        setShowForm(false);
        toast.success("Coupon created!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gold-400 text-white px-4 py-2 text-sm hover:bg-gold-500 transition-colors uppercase tracking-wider">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Coupon Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-luxury font-mono" placeholder="LUXE20" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Discount Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-luxury">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (CAD)</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Value ({form.type === "PERCENTAGE" ? "%" : "CAD"})</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="input-luxury" placeholder="20" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Minimum Order (CAD)</label>
              <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="input-luxury" placeholder="0" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Max Uses (blank = unlimited)</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="input-luxury" placeholder="100" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input-luxury" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="freeShipping" checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="freeShipping" className="text-sm">Include Free Shipping</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">{submitting ? "Creating..." : "Create Coupon"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Code", "Type", "Value", "Min Order", "Used/Max", "Free Ship", "Expires", "Active", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">{coupon.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{coupon.type}</td>
                  <td className="px-4 py-3 text-sm font-medium">{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `CA$${coupon.value}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">CA$ {coupon.minOrder}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{coupon.usedCount}/{coupon.maxUses || "∞"}</td>
                  <td className="px-4 py-3">{coupon.freeShipping ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-gray-300" />}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3">{coupon.isActive ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-400" />}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(coupon.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-gray-400 text-sm">No coupons yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
