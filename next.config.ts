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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js dev usa eval() para Fast Refresh — 'unsafe-eval' solo
              // en desarrollo, nunca en el build de producción.
              `script-src 'self' 'unsafe-inline'${
                process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
              }`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: res.cloudinary.com",
              "connect-src 'self' https://api.cloudinary.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // El panel de admin no debe quedar cacheado en el navegador ni en
        // proxies intermedios — muestra stock y precios que cambian seguido,
        // y es contenido detrás de sesión.
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" }],
      },
    ];
  },
};

export default nextConfig;
