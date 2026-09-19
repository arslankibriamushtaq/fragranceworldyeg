import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Get in touch with Fragrance World YEG in Edmonton for questions about orders, perfumes and perfume oils.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
