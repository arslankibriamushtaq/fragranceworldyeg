"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { DECANT_SIZES, isAllowedDecantSize } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plus, Trash2, Sparkles, Upload, ArrowLeft } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2),
  brandId: z.string().min(1, "Select a brand"),
  categoryId: z.string().min(1, "Select a category"),
  type: z.enum(["FULL_BOTTLE", "DECANT"]),
  gender: z.enum(["MENS", "WOMENS", "UNISEX"]),
  description: z.string().min(10),
  basePrice: z.coerce.number().min(1),
  discount: z.coerce.number().min(0).max(100).default(0),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  topNotes: z.string().optional(),
  middleNotes: z.string().optional(),
  baseNotes: z.string().optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1),
    price: z.coerce.number().min(1),
    stock: z.coerce.number().min(0),
    sku: z.string().min(1),
  })).min(1, "Add at least one variant"),
}).refine((d) => d.type !== "DECANT" || d.variants.every((v) => isAllowedDecantSize(v.size)), {
  message: "Decants are only available in 5ml and 10ml",
  path: ["variants"],
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { type: "FULL_BOTTLE", gender: "UNISEX", discount: 0, isFeatured: false, isNewArrival: false, isBestSeller: false, variants: [{ size: "", price: 0, stock: 0, sku: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/products/${slug}`).then((r) => r.json()),
    ]).then(([b, c, product]) => {
      setBrands(b);
      setCategories(c);

      if (product.error) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }

      setImages(product.images || []);
      reset({
        name: product.name,
        brandId: product.brandId,
        categoryId: product.categoryId,
        type: product.type,
        gender: product.gender,
        description: product.description,
        basePrice: product.basePrice,
        discount: product.discount || 0,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        topNotes: product.fragranceNotes?.top?.join(", ") || "",
        middleNotes: product.fragranceNotes?.middle?.join(", ") || "",
        baseNotes: product.fragranceNotes?.base?.join(", ") || "",
        variants: product.variants?.map((v: any) => ({
          id: v.id,
          size: v.size,
          price: v.price,
          stock: v.stock,
          sku: v.sku,
        })) || [{ size: "", price: 0, stock: 0, sku: "" }],
      });
    }).finally(() => setLoading(false));
  }, [slug, reset, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = async () => {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: reader.result, folder: "luxe-scents/products" }),
          });
          const data = await res.json();
          if (data.url) setImages((prev) => [...prev, data.url]);
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setTimeout(() => setUploading(false), 2000);
    }
  };

  const handleGenerateDescription = async () => {
    const name = watch("name");
    const brandId = watch("brandId");
    const gender = watch("gender");
    const type = watch("type");
    const topNotes = watch("topNotes");
    const middleNotes = watch("middleNotes");
    const baseNotes = watch("baseNotes");
    const brand = brands.find((b) => b.id === brandId)?.name || "";
    const notes = [topNotes, middleNotes, baseNotes].filter(Boolean).join(", ");

    if (!name || !brand) { toast.error("Enter product name and select brand first"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: name, brand, notes, gender, type }),
      });
      const data = await res.json();
      if (data.description) {
        setValue("description", data.description);
        toast.success("Description generated!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch {
      toast.error("AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    if (images.length === 0) { toast.error("Upload at least one image"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          brandId: data.brandId,
          categoryId: data.categoryId,
          type: data.type,
          gender: data.gender,
          description: data.description,
          basePrice: data.basePrice,
          discount: data.discount,
          isFeatured: data.isFeatured,
          isNewArrival: data.isNewArrival,
          isBestSeller: data.isBestSeller,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          images,
          fragranceNotes: {
            top: data.topNotes ? data.topNotes.split(",").map((s) => s.trim()) : [],
            middle: data.middleNotes ? data.middleNotes.split(",").map((s) => s.trim()) : [],
            base: data.baseNotes ? data.baseNotes.split(",").map((s) => s.trim()) : [],
          },
          variants: data.variants,
        }),
      });
      if (res.ok) {
        toast.success("Product updated!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-gray-400">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Product Name *</label>
              <input {...register("name")} className="input-luxury" placeholder="e.g., Dior Sauvage" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Brand *</label>
              <select {...register("brandId")} className="input-luxury">
                <option value="">Select Brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Category *</label>
              <select {...register("categoryId")} className="input-luxury">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Type *</label>
              <select {...register("type")} className="input-luxury">
                <option value="FULL_BOTTLE">Full Bottle</option>
                <option value="DECANT">Decant</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Gender *</label>
              <select {...register("gender")} className="input-luxury">
                <option value="MENS">Men&apos;s</option>
                <option value="WOMENS">Women&apos;s</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Base Price (CAD) *</label>
              <input {...register("basePrice")} type="number" className="input-luxury" placeholder="99.99" />
              {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Discount (%)</label>
              <input {...register("discount")} type="number" className="input-luxury" placeholder="0" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { name: "isFeatured", label: "Featured" },
              { name: "isNewArrival", label: "New Arrival" },
              { name: "isBestSeller", label: "Best Seller" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
                <input {...register(name as any)} type="checkbox" className="w-4 h-4 text-gold-500" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Description</h2>
            <button type="button" onClick={handleGenerateDescription} disabled={generating} className="flex items-center gap-2 text-xs bg-purple-600 text-white px-3 py-1.5 hover:bg-purple-700 transition-colors disabled:opacity-50">
              <Sparkles size={14} /> {generating ? "Generating..." : "AI Generate"}
            </button>
          </div>
          <textarea {...register("description")} rows={6} className="input-luxury resize-none" placeholder="Product description..." />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Fragrance Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Fragrance Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Top Notes</label>
              <input {...register("topNotes")} className="input-luxury" placeholder="Bergamot, Lemon (comma separated)" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Heart/Middle Notes</label>
              <input {...register("middleNotes")} className="input-luxury" placeholder="Lavender, Rose" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Base Notes</label>
              <input {...register("baseNotes")} className="input-luxury" placeholder="Amber, Musk, Sandalwood" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-28">
                <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs">&times;</button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-gold-400 p-4 cursor-pointer transition-colors w-fit">
            <Upload size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500">{uploading ? "Uploading..." : "Upload Images"}</span>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Variants (Sizes)</h2>
            <datalist id="decant-sizes">{DECANT_SIZES.map((s) => <option key={s} value={s} />)}</datalist>
            <button type="button" onClick={() => append({ size: "", price: 0, stock: 0, sku: "" })} className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600">
              <Plus size={14} /> Add Variant
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Decants: 5ml and 10ml only.</p>
          {(errors as any).variants?.message && <p className="text-red-500 text-xs mb-3">{(errors as any).variants.message}</p>}
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-4 gap-3 items-start">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Size</label>
                  <input {...register(`variants.${idx}.size`)} list="decant-sizes" className="input-luxury text-sm" placeholder="e.g., 100ml" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price (CAD)</label>
                  <input {...register(`variants.${idx}.price`)} type="number" className="input-luxury text-sm" placeholder="8000" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                  <input {...register(`variants.${idx}.stock`)} type="number" className="input-luxury text-sm" placeholder="50" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">SKU</label>
                    <input {...register(`variants.${idx}.sku`)} className="input-luxury text-sm" placeholder="ABC-100ML-XYZ" />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(idx)} className="mt-6 text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.variants && <p className="text-red-500 text-xs mt-2">{errors.variants.message}</p>}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">SEO (Optional)</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Meta Title</label>
              <input {...register("metaTitle")} className="input-luxury" placeholder="SEO title..." />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Meta Description</label>
              <textarea {...register("metaDescription")} rows={3} className="input-luxury resize-none" placeholder="SEO description (max 160 chars)..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">
            {submitting ? "Updating..." : "Update Product"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline-gold">Cancel</button>
        </div>
      </form>
    </div>
  );
}
