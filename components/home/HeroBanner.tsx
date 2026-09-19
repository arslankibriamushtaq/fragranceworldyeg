"use client";
import { useRef } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Sparkles } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "The Art of",
    titleAccent: "Fragrance",
    subtitle: "Authentic Arabic Perfumes",
    description: "An extensive range of authentic Arabic perfumes and perfume oils at highly competitive prices",
    accent: "100% Authentic",
    video: "/videos/hero-perfume.mp4",
  },
  {
    id: 2,
    title: "Exclusive",
    titleAccent: "Decants",
    subtitle: "Try Before You Commit",
    description: "Try your favourite fragrances in 5ml and 10ml decants before buying a full bottle",
    accent: "5ml \u2022 10ml",
    video: "/videos/hero-decant.mp4",
  },
  {
    id: 3,
    title: "New",
    titleAccent: "Arrivals",
    subtitle: "Fresh From The Maison",
    description: "The latest additions to our collection, shipped Canada wide",
    accent: "Canada Wide Shipping",
    video: "/videos/hero-gold-liquid.mp4",
  },
];

export default function HeroBanner() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Play only the currently active slide's video; pause (and reset) the rest.
  // This prevents all 3 hero videos from downloading + decoding at once.
  const playOnlyActive = (swiper: SwiperClass) => {
    const active = swiper.realIndex;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  return (
    <div className="relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index: number, className: string) =>
            `<span class="${className} !w-8 !h-1 !rounded-none"></span>`,
        }}
        navigation
        rewind
        onSwiper={playOnlyActive}
        onSlideChange={playOnlyActive}
        className="h-[60vh] md:h-[75vh] max-h-[760px]"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full bg-black flex items-center justify-center overflow-hidden">
              {/* Video Background — only the active slide plays; others don't preload */}
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "none"}
                poster={slide.video.replace(".mp4", ".jpg")}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              >
                <source src={slide.video} type="video/mp4" />
              </video>

              {/* Lighter overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

              {/* Subtle gold glow - static */}
              <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gold-400 rounded-full blur-[150px] opacity-[0.03]" />
              <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gold-300 rounded-full blur-[120px] opacity-[0.02]" />

              {/* Content */}
              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                {/* Accent tag */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles size={14} className="text-gold-400" />
                  <span className="text-gold-400 text-xs uppercase tracking-[0.5em] font-medium">
                    {slide.accent}
                  </span>
                  <Sparkles size={14} className="text-gold-400" />
                </div>

                {/* Title */}
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-[1.1] mb-4">
                  {slide.title}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300">
                    {slide.titleAccent}
                  </span>
                </h1>

                {/* Subtitle */}
                <h2 className="font-serif text-xl md:text-2xl text-gold-200/70 mb-6 italic">
                  {slide.subtitle}
                </h2>

                {/* Description */}
                <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  {slide.description}
                </p>

              </div>

              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-white/40 text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-gold-400 to-transparent" />
      </div>
    </div>
  );
}
