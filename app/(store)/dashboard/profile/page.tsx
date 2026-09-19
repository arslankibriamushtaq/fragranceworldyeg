"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
          });
        })
        .catch(() => {});
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Profile updated!");
        await update({ name: form.name });
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gold-500 transition-colors text-sm">← Dashboard</Link>
        <h1 className="font-serif text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxury" placeholder="Your name" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Email Address</label>
          <input value={session?.user?.email || ""} disabled className="input-luxury bg-gray-50 text-gray-400 cursor-not-allowed" />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Phone Number</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-luxury" placeholder="+1 780 000 0000" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-luxury" placeholder="Street address" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">City</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-luxury" placeholder="City" />
        </div>
        <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-50">
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
