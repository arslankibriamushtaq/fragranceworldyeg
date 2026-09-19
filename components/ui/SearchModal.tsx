"use client";
import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  brand: { name: string };
  images: string[];
  basePrice: number;
  discount: number;
}

const trendingSearches = ["Lattafa", "Armaf", "Rasasi", "Ajmal", "Oud", "Attar", "Musk", "Amber"];

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-forest-900/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto mt-20 md:mt-28 max-w-2xl bg-white rounded-2xl shadow-luxury-lg border border-gold-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-5">
              {/* Search Input */}
              <div className="flex items-center gap-3 rounded-full bg-luxury-cream border border-gold-200 focus-within:border-gold-400 focus-within:bg-white transition-colors pl-4 pr-1.5 py-1.5">
                <Search size={18} className="text-gold-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 min-w-0 text-base outline-none bg-transparent placeholder:text-forest-300 py-1.5"
                />
                {loading && <Loader2 size={18} className="animate-spin text-gold-400 flex-shrink-0" />}
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="p-2 rounded-full hover:bg-gold-100 text-forest-500 transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>


              {/* Trending - show when no query */}
              {query.length < 2 && (
                <div className="mt-5 px-1 pb-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <TrendingUp size={12} /> Trending Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="text-xs px-3.5 py-1.5 rounded-full border border-gold-200 text-forest-600 hover:border-gold-400 hover:text-gold-600 hover:bg-luxury-cream transition-all duration-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  <div className="space-y-1">
                    {results.map((product, i) => {
                      const discountedPrice = product.basePrice - (product.basePrice * product.discount) / 100;
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-14 h-14 bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                              {product.images[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate group-hover:text-gold-600 transition-colors">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-gold-500 uppercase tracking-widest mt-0.5">
                                {product.brand.name}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-sm text-gray-900">
                                {formatPrice(discountedPrice)}
                              </p>
                              {product.discount > 0 && (
                                <p className="text-[10px] text-gray-400 line-through">
                                  {formatPrice(product.basePrice)}
                                </p>
                              )}
                            </div>
                            <ArrowRight size={14} className="text-gray-300 group-hover:text-gold-400 transition-colors flex-shrink-0" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* View all link */}
                  <Link
                    href={`/shop?search=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 mt-4 py-3 text-sm text-gold-500 hover:text-gold-600 border-t border-gray-100 transition-colors group"
                  >
                    View all results
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {/* No results */}
              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="mt-6 pb-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">No fragrances found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-gray-300">Try a different keyword or browse our collection</p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 mt-3 text-xs text-gold-500 hover:text-gold-600 transition-colors"
                  >
                    Browse Shop <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>

            {/* Keyboard hint */}
            <div className="border-t border-gray-100 py-2 px-6">
              <div className="max-w-3xl mx-auto flex items-center justify-end gap-4">
                <span className="text-[10px] text-gray-300">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] border border-gray-200">ESC</kbd> to close
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
