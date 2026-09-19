"use client";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

export default function DecantHero() {
  return (
    <section className="relative h-[50vh] md:h-[60vh] max-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-decant.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-decant.mp4" type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-5"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Droplets size={40} className="text-gold-400" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-4xl md:text-6xl font-bold text-white mb-4"
        >
          Fragrance{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300">
            Decants
          </span>
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="h-0.5 bg-gold-400 mx-auto mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-gray-300 text-lg max-w-xl mx-auto mb-8"
        >
          Sample the world&apos;s finest fragrances before committing to a full bottle.
          Available in 5ml and 10ml sizes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {["5ml", "10ml"].map((size, i) => (
            <motion.span
              key={size}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="border border-gold-400/60 text-gold-400 px-5 py-1.5 text-sm backdrop-blur-sm bg-white/5 hover:bg-gold-400 hover:text-white transition-all duration-300 cursor-default"
            >
              {size}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-400/20" />
    </section>
  );
}
