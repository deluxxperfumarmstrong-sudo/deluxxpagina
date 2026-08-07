"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import HeaderSpacer from "./HeaderSpacer";
import Footer from "./Footer";

// El panel de admin tiene su propio layout (app/admin/layout.tsx) — no
// necesita el header/carrito/footer del sitio de cara al cliente.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esAdmin = pathname?.startsWith("/admin");

  if (esAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <HeaderSpacer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
