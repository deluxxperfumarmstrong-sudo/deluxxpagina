import Link from "next/link";
import Wordmark from "@/components/layout/Wordmark";
import { usandoDatosMock } from "@/lib/data";
import { cerrarSesionAdmin } from "./login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-on-background">
      <header className="border-b border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Wordmark size="sm" />
            <nav className="flex items-center gap-6">
              <Link
                href="/admin/productos"
                className="text-sm font-semibold uppercase tracking-wide text-on-surface hover:text-accent transition-colors"
              >
                Productos
              </Link>
              <Link
                href="/admin/categorias"
                className="text-sm font-semibold uppercase tracking-wide text-on-surface hover:text-accent transition-colors"
              >
                Categorías
              </Link>
            </nav>
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
    </div>
  );
}
