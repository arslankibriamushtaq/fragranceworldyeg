"use client";
import Link from "next/link";
import Image from "next/image";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionElements";
import { ChevronRight } from "lucide-react";

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
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900">Shop by Brands</h2>
          <Link href="/brands" className="group inline-flex items-center gap-1 text-sm md:text-base text-gray-800 hover:text-gold-600 transition-colors whitespace-nowrap">
            More brands
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6" staggerDelay={0.05}>
          {brands.map((brand) => (
            <StaggerItem key={brand.id}>
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
      </div>
    </section>
  );
}
