"use client";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/MotionElements";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/ui/SocialIcons";
import { CONTACT, SITE_NAME, SITE_TAGLINE, SOCIAL_LINKS } from "@/lib/site";

const socials = [
  { href: SOCIAL_LINKS.instagram, Icon: InstagramIcon, label: "Instagram" },
  { href: SOCIAL_LINKS.facebook, Icon: FacebookIcon, label: "Facebook" },
  { href: SOCIAL_LINKS.tiktok, Icon: TikTokIcon, label: "TikTok" },
];

const shopLinks = [
  { href: "/shop?category=men-fragrances", label: "Men Fragrances" },
  { href: "/shop?category=women-fragrances", label: "Women Fragrances" },
  { href: "/shop?category=unisex-fragrances", label: "Unisex Fragrances" },
  { href: "/shop?category=perfume-oils-attars", label: "Perfume Oils (Attars)" },
  { href: "/shop?category=body-sprays-room-fresheners", label: "Body Sprays & Room Fresheners" },
  { href: "/decants", label: "Decants" },
];

const serviceLinks = [
  { href: "/dashboard", label: "My Account" },
  { href: "/dashboard/orders", label: "Track Order" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/contact", label: "Contact Us" },
];

function LinkList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-white font-medium mb-5 uppercase tracking-widest text-xs">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="group text-sm text-gray-400 hover:text-gold-300 transition-colors inline-flex items-center gap-2">
              <span className="w-0 group-hover:w-3 h-[1px] bg-gold-400 transition-all duration-300" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-100">
      {/* Newsletter (compact) */}
      <div className="bg-luxury-light py-8">
        <FadeUp>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl text-forest-900">Join the Fragrance Circle</h3>
              <p className="text-forest-500 text-xs">New arrivals and exclusive offers, straight to your inbox.</p>
            </div>
            <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-64 bg-white border border-gold-200 text-forest-900 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 placeholder:text-gray-400"
              />
              <button type="submit" className="bg-forest-900 text-white px-5 py-2.5 text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:bg-gold-500 transition-colors">
                Subscribe <ArrowRight size={12} />
              </button>
            </form>
          </div>
        </FadeUp>
      </div>

      {/* Main Footer */}
      <div className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10" staggerDelay={0.1}>
            {/* Brand */}
            <StaggerItem>
              <div>
                <h2 className="font-serif text-2xl text-white mb-1 tracking-[0.15em] uppercase">{SITE_NAME}</h2>
                <p className="text-gold-300 text-[10px] tracking-[0.3em] uppercase mb-5">{SITE_TAGLINE}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  An extensive range of authentic Arabic perfumes and perfume oils at highly competitive prices.
                </p>
                <div className="flex space-x-3">
                  {socials.map(({ href, Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="p-2.5 border border-forest-600 hover:border-gold-400 hover:text-gold-300 hover:bg-gold-400/10 transition-all duration-300"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <LinkList title="Shop" links={shopLinks} />
            </StaggerItem>

            <StaggerItem>
              <LinkList title="Customer Service" links={serviceLinks} />
            </StaggerItem>

            {/* Contact */}
            <StaggerItem>
              <div>
                <h4 className="text-white font-medium mb-5 uppercase tracking-widest text-xs">Get In Touch</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <MapPin size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
                    <span>{CONTACT.location}</span>
                  </li>
                  {CONTACT.phone && (
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                      <Phone size={16} className="text-gold-400 flex-shrink-0" />
                      <a href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`} className="hover:text-gold-300 transition-colors">{CONTACT.phone}</a>
                    </li>
                  )}
                  {CONTACT.email && (
                    <li className="flex items-center gap-3 text-sm text-gray-400">
                      <Mail size={16} className="text-gold-400 flex-shrink-0" />
                      <a href={`mailto:${CONTACT.email}`} className="hover:text-gold-300 transition-colors">{CONTACT.email}</a>
                    </li>
                  )}
                </ul>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-forest-700 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="text-xs text-gray-500">Secure card payments &middot; Visa &middot; Mastercard &middot; Amex</p>
        </div>
      </div>
    </footer>
  );
}
