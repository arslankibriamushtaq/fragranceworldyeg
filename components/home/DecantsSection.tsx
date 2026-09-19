"use client";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { Droplets, ArrowRight } from "lucide-react";
import { AnimatedHeading, FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/MotionElements";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: { name: string };
  images: string[];
  basePrice: number;
  discount: number;
  averageRating: number;
  totalReviews: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  variants: { id: string; size: string; price: number; stock: number; sku: string }[];
}

export default function DecantsSection({ products }: { products: Product[] }) {
  return (
    <section className="py-20 bg-luxury-light relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <FadeUp>
          <div className="flex justify-center mb-4">
            <Droplets className="text-gold-500" size={36} />
          </div>
        </FadeUp>

        <AnimatedHeading subtitle="Try Before You Buy" title="Fragrance Decants" />

        <FadeUp delay={0.2}>
          <p className="text-gray-500 text-center text-sm max-w-lg mx-auto mb-12 -mt-6">
            Sample luxury fragrances in small quantities. Available in 5ml and 10ml sizes.
          </p>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12" staggerDelay={0.08}>
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard
                id={product.id}
                slug={product.slug}
                name={product.name}
                brand={product.brand.name}
                image={product.images[0]}
                basePrice={product.basePrice}
                discount={product.discount}
                rating={product.averageRating}
                reviews={product.totalReviews}
                isNew={product.isNewArrival}
                isBestSeller={product.isBestSeller}
                variants={product.variants}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/decants" className="group inline-flex items-center gap-2 btn-gold">
            <Droplets size={14} />
            Explore All Decants
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
    </section>
  );
}
