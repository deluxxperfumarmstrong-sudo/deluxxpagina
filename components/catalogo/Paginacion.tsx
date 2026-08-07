import Link from "next/link";

export default function Paginacion({
  pagina,
  totalPaginas,
  basePath,
  searchParams,
}: {
  pagina: number;
  totalPaginas: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    params.set("pagina", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={href(Math.max(1, pagina - 1))}
        aria-disabled={pagina <= 1}
        className={`px-4 py-2 text-sm border border-border ${
          pagina <= 1 ? "pointer-events-none opacity-30" : "hover:border-accent hover:text-accent"
        }`}
      >
        Anterior
      </Link>
      <span className="px-4 py-2 text-sm text-on-surface-muted">
        Página {pagina} de {totalPaginas}
      </span>
      <Link
        href={href(Math.min(totalPaginas, pagina + 1))}
        aria-disabled={pagina >= totalPaginas}
        className={`px-4 py-2 text-sm border border-border ${
          pagina >= totalPaginas
            ? "pointer-events-none opacity-30"
            : "hover:border-accent hover:text-accent"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
