import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Shipping rules (CAD). Free shipping threshold matches the published shipping policy.
export const FREE_SHIPPING_THRESHOLD = 250;
export const FLAT_SHIPPING_FEE = 15;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

// Decants are sold in these sizes only.
export const DECANT_SIZES = ["5ml", "10ml"];

export function isAllowedDecantSize(size: string): boolean {
  return DECANT_SIZES.includes(size.replace(/\s+/g, "").toLowerCase());
}

export function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FW-${timestamp}-${random}`;
}

export function generateSKU(brand: string, size: string): string {
  const brandCode = brand.substring(0, 3).toUpperCase();
  const sizeCode = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${brandCode}-${sizeCode}-${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getStarRating(rating: number): string {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
