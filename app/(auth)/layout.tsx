// Auth pages (login/register) render without the store Navbar/Footer.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen">{children}</main>;
}
