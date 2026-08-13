"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import HeaderSpacer from "./HeaderSpacer";
import Footer from "./Footer";
import DrawerCarrito from "@/components/carrito/DrawerCarrito";
import ToastCarrito from "@/components/carrito/ToastCarrito";
import type { CategoriaNav } from "@/lib/types";

// El panel de admin tiene su propio layout (app/admin/layout.tsx) — no
// necesita el header/carrito/footer del sitio de cara al cliente.
export default function SiteChrome({
  children,
  categorias,
}: {
  children: React.ReactNode;
  categorias: CategoriaNav[];
}) {
  const pathname = usePathname();
  const esAdmin = pathname?.startsWith("/admin");

  if (esAdmin) return <>{children}</>;

  return (
    <>
      <Header categorias={categorias} />
      <HeaderSpacer />
      <main className="flex-1">{children}</main>
      <Footer />
      <DrawerCarrito />
      <ToastCarrito />
    </>
  );
}
