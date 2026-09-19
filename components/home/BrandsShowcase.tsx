"use client";
import Link from "next/link";
import Image from "next/image";
import { AnimatedHeading, StaggerContainer, StaggerItem } from "@/components/ui/MotionElements";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export default function BrandsShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;
  return (
    <section className="py-16 bg-luxury-cream relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4">
        <AnimatedHeading subtitle="Explore Our Houses" title="Shop by Brands" />

        <StaggerContainer className="flex flex-wrap justify-center gap-4" staggerDelay={0.05}>
          {brands.map((brand) => (
            <StaggerItem key={brand.id}>
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center p-5 bg-white border border-gray-100 hover:border-gold-400/40 hover:shadow-gold transition-all duration-500 min-h-[80px] min-w-[120px]"
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={80}
                    height={40}
                    className="object-contain h-10 grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  />
                ) : (
                  <span className="font-serif text-sm font-bold text-gray-700 group-hover:text-gold-500 transition-colors duration-300 text-center">
                    {brand.name}
                  </span>
                )}
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/brands" className="group inline-flex items-center gap-2 btn-outline-gold">
            View All Brands
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
