"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDecantsPage() {
  const [decants, setDecants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products?type=decant&limit=100")
      .then((r) => r.json())
      .then((d) => setDecants(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this decant?")) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setDecants((prev) => prev.filter((p) => p.slug !== slug));
        toast.success("Decant deleted");
      } else {
        toast.error("Failed to delete decant");
      }
    } catch {
      toast.error("Error deleting decant");
    }
  };

  const filtered = decants.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Decants</h1>
          <p className="text-sm text-gray-500">{decants.length} decants total</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-gold-400 text-white px-4 py-2 text-sm hover:bg-gold-500 transition-colors uppercase tracking-wider">
          <Plus size={16} /> Add Decant
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search decants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading decants...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Decant", "Brand", "Sizes", "Base Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => {
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0;
                  const sizes = product.variants?.map((v: any) => v.size).join(", ") || "-";
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 relative flex-shrink-0 bg-gray-100">
                            {product.images?.[0] && (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.brand?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sizes}</td>
                      <td className="px-4 py-3 text-sm font-semibold">CA$ {product.basePrice?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${totalStock === 0 ? "text-red-600" : totalStock <= 10 ? "text-yellow-600" : "text-green-600"}`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded">Featured</span>}
                          {product.isNewArrival && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">New</span>}
                          {product.isBestSeller && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Best Seller</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${product.slug}/edit`} className="p-1.5 text-gray-500 hover:text-gold-500 transition-colors">
                            <Edit size={15} />
                          </Link>
                          <button onClick={() => handleDelete(product.slug)} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No decants found</div>}
          </div>
        )}
      </div>
    </div>
  );
}
