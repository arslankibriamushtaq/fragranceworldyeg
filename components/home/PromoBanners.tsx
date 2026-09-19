import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
}

// Offer / sale banners managed from Admin → Banners. Hidden when there are no active banners.
export default function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  const single = banners.length === 1;

  return (
    <section className="py-12 md:py-16 bg-luxury-cream">
      <div className={`px-4 max-w-7xl mx-auto grid gap-4 md:gap-6 ${single ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {banners.map((banner) => {
          const content = (
            <div className={`group relative overflow-hidden ${single ? "aspect-[16/9] md:aspect-[21/7]" : "aspect-[16/9]"}`}>
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes={single ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 text-white">
                {banner.subtitle && (
                  <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-gold-300 mb-2">{banner.subtitle}</p>
                )}
                <h3 className="font-serif text-2xl md:text-4xl">{banner.title}</h3>
                {banner.link && (
                  <span className="inline-flex items-center gap-2 mt-3 text-sm uppercase tracking-wider border-b border-white/60 pb-0.5 group-hover:gap-3 transition-all">
                    Shop Now <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </div>
          );
          return banner.link ? (
            <Link key={banner.id} href={banner.link} className="block">{content}</Link>
          ) : (
            <div key={banner.id}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
