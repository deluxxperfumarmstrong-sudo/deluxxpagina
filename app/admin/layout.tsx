import { Suspense } from "react";
import Wordmark from "@/components/layout/Wordmark";
import AdminNav from "@/components/admin/AdminNav";
import ToastAdmin from "@/components/admin/ToastAdmin";
import { usandoDatosMock } from "@/lib/data";
import { cerrarSesionAdmin } from "./login/actions";

// Todo /admin lee directo de la base en cada visita, nunca HTML
// pre-renderizado en build — un admin editando stock/productos/categorías
// necesita ver el estado real, no una foto de cuando corrió el último
// `next build`. Sin esto, Next.js pre-renderizaba /admin/productos y
// /admin/categorias como páginas estáticas (no leen cookies/searchParams
// directamente, así que no había nada que las forzara a ser dinámicas por
// sí solas) — cualquier cambio hecho fuera de una Server Action de este
// mismo Next.js (ej. un script contra Neon) no se reflejaba hasta el
// próximo deploy, aunque la base ya tuviera el dato correcto.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-on-background">
      <header className="border-b border-border-subtle">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3 sm:gap-8">
            <Wordmark size="sm" />
            <AdminNav />
          </div>
          <form action={cerrarSesionAdmin}>
            <button
              type="submit"
              className="text-sm text-on-surface-muted hover:text-accent transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {usandoDatosMock && (
        <div className="bg-accent/15 border-b border-accent px-6 py-2 text-center text-xs text-accent">
          Modo demo: sin <code>DATABASE_URL</code> los cambios se guardan en un archivo local
          (<code>.mock-data/</code>), no en Neon. Ver docs/BLOQUEOS.md.
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">{children}</main>

      <Suspense fallback={null}>
        <ToastAdmin />
      </Suspense>
    </div>
  );
}
