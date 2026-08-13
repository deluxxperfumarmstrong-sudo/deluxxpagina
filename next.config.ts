import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Estos son los anchos entre los que next/image arma el srcset, y con
    // CldImage cada uno se traduce en un pedido w_… a Cloudinary — o sea,
    // en ancho de banda facturado. Por defecto Next llega hasta 3840, pero
    // en este sitio nada se muestra por encima de ~1200 px reales: la foto
    // más grande es la principal de producto en mobile (100vw) y el catálogo
    // usa tarjetas de ~330 px. Dejar 2048 y 3840 en la lista significaba que
    // un monitor 4K, o un celular con DPR alto sobre un slot ancho, podía
    // pedir un archivo varias veces más pesado que el que se ve en pantalla.
    // Se recorta la cola: nadie pierde nitidez porque esos tamaños nunca
    // corresponden a un slot real de esta interfaz.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
