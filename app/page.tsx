import Hero from "@/components/hero/Hero";
import CintaBeneficios from "@/components/home/CintaBeneficios";
import CategoriasGrid from "@/components/home/CategoriasGrid";
import DestacadosGrid from "@/components/home/DestacadosGrid";
import BloqueResenas from "@/components/home/BloqueResenas";
import BloqueEnviosPagos from "@/components/home/BloqueEnviosPagos";
import { getCategoriasActivas, getProductosDestacados } from "@/lib/data";

export default async function Home() {
  const [categorias, destacados] = await Promise.all([
    getCategoriasActivas(),
    getProductosDestacados(9),
  ]);

  return (
    <div>
      <Hero />
      {/* relative: le da a CintaBeneficios (sticky) el recorrido exacto de
          Categorías + Destacados — se despega sola apenas termina este
          bloque, no persiste el resto de la página. */}
      <div className="relative">
        <CintaBeneficios />
        <CategoriasGrid categorias={categorias} />
        <DestacadosGrid productos={destacados} />
      </div>
      <BloqueResenas />
      <BloqueEnviosPagos />
    </div>
  );
}
