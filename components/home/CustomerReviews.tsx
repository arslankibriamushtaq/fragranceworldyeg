"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star } from "lucide-react";
import { AnimatedHeading, FadeUp } from "@/components/ui/MotionElements";
import { motion } from "framer-motion";

const reviews = [
  { id: 1, name: "Ayesha Khan", rating: 5, text: "Amazing quality! Got a decant of Baccarat Rouge 540 and it's absolutely identical to the original. Will definitely order again.", product: "Baccarat Rouge 540 Decant", initials: "AK" },
  { id: 2, name: "Ahmed Malik", rating: 5, text: "Fast delivery and packaging was beautiful. The Dior Sauvage I ordered is 100% authentic. Fragrance World YEG is now my go-to for fragrances.", product: "Dior Sauvage 100ml", initials: "AM" },
  { id: 3, name: "Sara Ahmed", rating: 5, text: "Ordered three decants to test before buying full bottles. Such a smart concept! The fragrances are spot on and customer service is excellent.", product: "Multiple Decants", initials: "SA" },
  { id: 4, name: "Usman Raza", rating: 4, text: "Great selection of niche fragrances that you won't find elsewhere. Packaging is beautiful and delivery was quick.", product: "Tom Ford Oud Wood", initials: "UR" },
  { id: 5, name: "Fatima Zahra", rating: 5, text: "Absolutely love Fragrance World YEG! The quality is unmatched and prices are reasonable for luxury fragrances. Highly recommend!", product: "Chanel No. 5", initials: "FZ" },
];

export default function CustomerReviews() {
  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <AnimatedHeading subtitle="What Our Clients Say" title="Customer Reviews" />

        <FadeUp delay={0.2}>
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1.2}
            spaceBetween={16}
            autoplay={{ delay: 4000 }}
            pagination={{ clickable: true }}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
            className="pb-10"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-luxury-cream border border-gold-100 p-5 h-full hover:border-gold-400/30 hover:shadow-gold transition-all duration-500"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-serif font-bold text-xs">
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{review.name}</p>
                    </div>
                  </div>

                  <div className="flex mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={12} className={star <= review.rating ? "fill-gold-400 text-gold-400" : "text-gray-200"} />
                    ))}
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-4">{review.text}</p>

                  <div className="border-t border-gold-100 pt-2">
                    <p className="text-xs text-gold-500 font-medium">{review.product}</p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </FadeUp>
      </div>
    </section>
  );
}
