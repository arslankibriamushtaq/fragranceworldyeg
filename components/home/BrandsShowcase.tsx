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

// One row on the homepage; the full list lives on /brands.
const MAX_BRANDS = 6;

export default function BrandsShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null;
  return (
    <section className="py-16 bg-luxury-cream relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4">
        <AnimatedHeading subtitle="Explore Our Houses" title="Shop by Brands" />

        <StaggerContainer className="flex lg:grid lg:grid-cols-6 gap-4 md:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-2 -mx-4 px-4 lg:mx-0 lg:px-0" staggerDelay={0.05}>
          {brands.slice(0, MAX_BRANDS).map((brand) => (
            <StaggerItem key={brand.id} className="shrink-0 w-[42%] sm:w-[30%] lg:w-auto snap-start">
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center h-full bg-white border border-gray-800 p-4 md:p-5 hover:shadow-gold hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-serif text-2xl text-gray-800 text-center leading-tight">{brand.name}</span>
                  )}
                </div>
                <p className="mt-4 text-center text-sm md:text-base font-bold uppercase text-gray-900 leading-tight">
                  {brand.name}
                </p>
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
