"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Heart, Search, Menu, X, User, ChevronDown, Package, LogOut, Settings } from "lucide-react";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/ui/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/site";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import SearchModal from "@/components/ui/SearchModal";

type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };

const CATEGORY_LINKS = [
  { href: "/shop?category=men-fragrances", label: "Men Fragrances" },
  { href: "/shop?category=women-fragrances", label: "Women Fragrances" },
  { href: "/shop?category=unisex-fragrances", label: "Unisex Fragrances" },
  { href: "/shop?category=perfume-oils-attars", label: "Perfume Oils (Attars)" },
  { href: "/shop?category=body-sprays", label: "Body Sprays" },
  { href: "/shop?category=room-fresheners", label: "Room Fresheners" },
];

const MENU_BRAND_LIMIT = 8;

const DECANT_LINKS = [
  { href: "/decants", label: "All Decants" },
  { href: "/shop?type=decant&gender=MENS", label: "Men" },
  { href: "/shop?type=decant&gender=WOMENS", label: "Women" },
  { href: "/shop?type=decant&gender=UNISEX", label: "Unisex" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [brands, setBrands] = useState<{ href: string; label: string }[]>([]);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) return;
        // Show a short list in the menu (featured first); the rest live under "View All Brands".
        const sorted = [...data].sort((a: { featured?: boolean }, b: { featured?: boolean }) => Number(!!b.featured) - Number(!!a.featured));
        setBrands(sorted.slice(0, MENU_BRAND_LIMIT).map((b: { slug: string; name: string }) => ({ href: `/brands/${b.slug}`, label: b.name })));
      })
      .catch(() => {});
  }, []);

  const navLinks: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Categories", children: CATEGORY_LINKS },
    { href: "/shop?filter=new", label: "New Arrivals" },
    { href: "/brands", label: "Brands", children: [...brands, { href: "/brands", label: "View All Brands" }] },
    { href: "/decants", label: "Decants", children: DECANT_LINKS },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl/⌘ + K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      setTimeout(() => document.addEventListener("click", handleClick), 0);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [userMenuOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-forest-900 text-gold-200 text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.25em] uppercase whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center sm:justify-between py-2">
          <span className="hidden sm:block w-16" />
          <p className="text-center">100% Authentic / Canada Wide Shipping</p>
          <div className="hidden sm:flex items-center gap-3">
            {[
              { href: SOCIAL_LINKS.instagram, Icon: InstagramIcon, label: "Instagram" },
              { href: SOCIAL_LINKS.facebook, Icon: FacebookIcon, label: "Facebook" },
              { href: SOCIAL_LINKS.tiktok, Icon: TikTokIcon, label: "TikTok" },
            ].map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-white transition-colors">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-500 ${
          scrolled ? "shadow-lg shadow-black/5" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 -ml-1.5 flex-shrink-0" aria-label="Menu">
              <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0 group" aria-label="Fragrance World YEG — Home">
              <motion.div className="flex-shrink-0" whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                <Image
                  src="/logo-mark.png"
                  alt="Fragrance World YEG"
                  width={201}
                  height={246}
                  priority
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-[13px] sm:text-[17px] md:text-xl font-semibold tracking-[0.14em] sm:tracking-[0.22em] whitespace-nowrap text-forest-900">FRAGRANCE</span>
                <span className="mt-1 font-serif text-[9px] sm:text-[11px] md:text-[13px] tracking-[0.3em] sm:tracking-[0.42em] whitespace-nowrap text-gold-500">WORLD YEG</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => {
                const active = pathname === link.href.split("?")[0] && (link.href === "/" || link.href !== "/shop");
                return (
                  <div key={link.label} className="relative group">
                    <Link href={link.href} className="nav-link relative inline-flex items-center gap-1 py-2">
                      {link.label}
                      {link.children && <ChevronDown size={13} className="transition-transform duration-300 group-hover:rotate-180" />}
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] bg-gold-400 transition-all duration-300 ${
                          active ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                    {link.children && link.children.length > 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                        <div className="min-w-[230px] max-h-[70vh] overflow-y-auto bg-white border border-gold-100 shadow-luxury py-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.href + child.label}
                              href={child.href}
                              className="block px-5 py-2.5 text-sm text-forest-700 hover:bg-luxury-cream hover:text-gold-600 transition-colors whitespace-nowrap"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center flex-shrink-0 sm:space-x-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden xl:flex items-center gap-2 w-36 rounded-full bg-luxury-cream border border-gold-200/70 hover:border-gold-400 hover:bg-white px-3.5 py-2 text-xs text-forest-400 transition-all duration-300"
              >
                <Search size={14} className="text-gold-500" />
                <span className="flex-1" />
                <kbd className="text-[10px] font-sans text-forest-300 border border-gold-200 rounded px-1">⌘K</kbd>
              </button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="xl:hidden p-1.5 sm:p-2 hover:text-gold-500 transition-colors"
              >
                <Search size={20} />
              </motion.button>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link href="/wishlist" className="p-1.5 sm:p-2 hover:text-forest-600 transition-colors relative block">
                  <Heart size={20} />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-gold-400 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium"
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link href="/cart" className="p-1.5 sm:p-2 hover:text-forest-600 transition-colors relative block">
                  <ShoppingBag size={20} />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-gold-400 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                  className="flex items-center space-x-1 p-1.5 sm:p-2 hover:text-forest-600 transition-colors"
                >
                  <User size={20} />
                  {session && (
                    <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} />
                    </motion.div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white shadow-xl border border-gray-100 z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {session ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                          </div>
                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-forest-50 hover:text-forest-700 transition-colors">
                            <Package size={15} /> My Orders
                          </Link>
                          {(session.user as any)?.role === "ADMIN" && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-forest-50 hover:text-forest-700 transition-colors">
                              <Settings size={15} /> Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={() => { signOut(); setUserMenuOpen(false); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-forest-50 hover:text-forest-700 transition-colors font-medium">
                            Sign In
                          </Link>
                          <Link href="/register" onClick={() => setUserMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-forest-50 hover:text-forest-700 transition-colors border-t border-gray-50">
                            Create Account
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1 max-h-[75vh] overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.children ? (
                      <>
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                          className="w-full flex items-center justify-between py-3 px-2 nav-link text-sm"
                        >
                          {link.label}
                          <ChevronDown size={14} className={`transition-transform ${mobileExpanded === link.label ? "rotate-180" : ""}`} />
                        </button>
                        {mobileExpanded === link.label && (
                          <div className="pl-4 pb-2 border-l border-gold-200 ml-2">
                            {link.children.map((child) => (
                              <Link
                                key={child.href + child.label}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2 px-2 text-sm text-forest-600 hover:text-gold-500"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-3 px-2 nav-link text-sm ${pathname === link.href ? "text-gold-600 bg-luxury-cream" : ""}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
