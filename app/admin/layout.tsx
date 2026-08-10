import Wordmark from "@/components/layout/Wordmark";
import AdminNav from "@/components/admin/AdminNav";
import { usandoDatosMock } from "@/lib/data";
import { cerrarSesionAdmin } from "./login/actions";

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
    </div>
  );
}
