"use client";
import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Shield, Truck, RefreshCw, Share2, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { formatPrice, calculateDiscountedPrice, isAllowedDecantSize } from "@/lib/utils";
import toast from "react-hot-toast";
import { useEffect } from "react";
import ReviewSection from "@/components/product/ReviewSection";

interface Variant {
  id: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: { name: string };
  category: { name: string };
  type: string;
  description: string;
  fragranceNotes?: { top: string[]; middle: string[]; base: string[] } | null;
  gender: string;
  images: string[];
  basePrice: number;
  discount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  averageRating: number;
  totalReviews: number;
  variants: Variant[];
  reviews: any[];
}

export default function ProductDetail({ product: rawProduct }: { product: Product }) {
  // Decants are only offered in 5ml / 10ml; hide any legacy sizes.
  const product = rawProduct.type === "DECANT"
    ? { ...rawProduct, variants: rawProduct.variants.filter((v) => isAllowedDecantSize(v.size)) }
    : rawProduct;
  const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "notes" | "reviews">("description");

  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addProduct } = useRecentlyViewedStore();
  const inWishlist = isInWishlist(product.id);

  useEffect(() => {
    addProduct({
      id: product.id,
      name: product.name,
      brand: product.brand.name,
      image: product.images[0],
      price: selectedVariant?.price || product.basePrice,
      slug: product.slug,
    });
  }, []);

  const discountedBasePrice = calculateDiscountedPrice(product.basePrice, product.discount);
  const currentPrice = selectedVariant ? selectedVariant.price : discountedBasePrice;

  const handleAddToCart = () => {
    if (!selectedVariant) { toast.error("Please select a size"); return; }
    if (selectedVariant.stock === 0) { toast.error("Out of stock"); return; }
    if (quantity > selectedVariant.stock) { toast.error(`Only ${selectedVariant.stock} left in stock`); return; }
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      brand: product.brand.name,
      image: product.images[0],
      size: selectedVariant.size,
      price: currentPrice,
      quantity,
      stock: selectedVariant.stock,
    });
    toast.success("Added to cart!");
  };

  const handleWishlist = () => {
    toggleItem({ productId: product.id, name: product.name, brand: product.brand.name, image: product.images[0], price: currentPrice, slug: product.slug });
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-2">
        <a href="/" className="hover:text-gold-500 transition-colors">Home</a>
        <span>/</span>
        <a href="/shop" className="hover:text-gold-500 transition-colors">Shop</a>
        <span>/</span>
        <a href={`/brands/${product.brand.name.toLowerCase()}`} className="hover:text-gold-500 transition-colors">{product.brand.name}</a>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square relative bg-gray-50 mb-4 overflow-hidden">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 uppercase tracking-wider">
                -{product.discount}% OFF
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square relative overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-gold-400" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-gold-500 uppercase tracking-[0.3em]">{product.brand.name}</p>
            <button onClick={() => {
              navigator.share?.({ title: product.name, url: window.location.href })
                .catch(() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); });
            }} className="p-2 hover:text-gold-500 transition-colors">
              <Share2 size={16} />
            </button>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} size={14} className={star <= Math.round(product.averageRating) ? "fill-gold-400 text-gold-400" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.totalReviews} reviews</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 text-gray-600 uppercase tracking-wider">{product.gender}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-serif text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
            {product.discount > 0 && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
            )}
            {product.discount > 0 && (
              <span className="text-sm text-green-600 font-medium">Save {product.discount}%</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.isNewArrival && <span className="badge-gold">New Arrival</span>}
            {product.isBestSeller && <span className="badge-dark">Best Seller</span>}
            {product.isFeatured && <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 uppercase tracking-wider">Featured</span>}
          </div>

          {/* Variant Selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Select Size: <span className="text-gold-500 font-normal normal-case tracking-normal">{selectedVariant?.size}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                  className={`px-4 py-2 text-sm border-2 transition-all duration-200 font-medium ${
                    selectedVariant?.id === variant.id
                      ? "border-gold-400 bg-gold-400 text-white"
                      : variant.stock === 0
                      ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                      : "border-gray-200 hover:border-gold-400 text-gray-700"
                  }`}
                >
                  {variant.size}
                  {variant.stock === 0 && <span className="ml-1 text-[10px]">(Out)</span>}
                </button>
              ))}
            </div>
            {selectedVariant && (
              <p className={`text-xs mt-2 ${selectedVariant.stock <= 5 ? "text-red-500" : "text-green-600"}`}>
                {selectedVariant.stock === 0 ? "Out of stock" : selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} left!` : `In stock (${selectedVariant.stock} available)`}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Quantity</p>
            <div className="flex items-center border border-gray-200 w-32">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50 text-lg font-light">−</button>
              <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))} className="px-3 py-2 hover:bg-gray-50 text-lg font-light">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleWishlist}
              className={`p-4 border-2 transition-colors ${inWishlist ? "border-red-400 text-red-500" : "border-gray-200 hover:border-gold-400 hover:text-gold-500"}`}
            >
              <Heart size={20} className={inWishlist ? "fill-current" : ""} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-gray-100">
            {[
              { icon: Shield, text: "100% Authentic" },
              { icon: Truck, text: "Fast Delivery" },
              { icon: RefreshCw, text: "Easy Returns" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center text-center gap-2">
                <Icon size={20} className="text-gold-400" />
                <span className="text-xs text-gray-500">{text}</span>
              </div>
            ))}
          </div>

          {/* SKU */}
          {selectedVariant && (
            <p className="text-xs text-gray-400">SKU: {selectedVariant.sku}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            {(["description", "notes", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm uppercase tracking-widest font-medium border-b-2 transition-colors ${
                  activeTab === tab ? "border-gold-400 text-gold-500" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "notes" ? "Fragrance Notes" : tab === "reviews" ? `Reviews (${product.totalReviews})` : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "description" && (
          <div className="max-w-3xl prose prose-gray">
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {activeTab === "notes" && product.fragranceNotes && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
            {[
              { label: "Top Notes", notes: product.fragranceNotes.top, color: "text-amber-600" },
              { label: "Heart Notes", notes: product.fragranceNotes.middle, color: "text-rose-600" },
              { label: "Base Notes", notes: product.fragranceNotes.base, color: "text-gray-700" },
            ].map(({ label, notes, color }) => (
              <div key={label} className="text-center p-6 bg-gray-50">
                <h4 className={`font-serif text-lg font-semibold mb-3 ${color}`}>{label}</h4>
                <div className="space-y-1">
                  {notes.map((note) => (
                    <p key={note} className="text-sm text-gray-600">{note}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <ReviewSection productId={product.id} reviews={product.reviews} rating={product.averageRating} totalReviews={product.totalReviews} />
        )}
      </div>
    </div>
  );
}
