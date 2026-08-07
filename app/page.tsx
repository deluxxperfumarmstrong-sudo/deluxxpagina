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
    getProductosDestacados(8),
  ]);

  return (
    <div>
      <Hero />
      <CintaBeneficios />
      <CategoriasGrid categorias={categorias} />
      <DestacadosGrid productos={destacados} />
      <BloqueResenas />
      <BloqueEnviosPagos />
    </div>
  );
}
