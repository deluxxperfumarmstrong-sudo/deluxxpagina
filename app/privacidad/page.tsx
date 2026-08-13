import type { Metadata } from "next";
import Link from "next/link";
import { SITE, WHATSAPP, ENVIOS } from "@/lib/config";
import IconoWhatsapp from "@/components/icons/IconoWhatsapp";
import Reveal from "@/components/ui/Reveal";
import { generarLinkConsultaWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos recoge Deluxx Perfum, para qué los usa y cómo ejercer tus derechos.",
};

// Fecha fija, no dinámica: si se pusiera new Date() acá, la página diría
// "actualizado hoy" todos los días aunque el contenido no cambie — lo que
// vuelve la fecha inútil como señal de cuándo se revisó por última vez.
// Actualizar a mano cuando de verdad cambie el contenido.
const ULTIMA_ACTUALIZACION = "13 de agosto de 2026";

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-12 py-12 md:py-16">
      <Reveal>
        <h1 className="font-display text-4xl md:text-5xl text-on-background mb-4">
          Política de privacidad
        </h1>
        <p className="text-on-surface-muted mb-2 max-w-lg">
          Qué datos recogemos, para qué los usamos, y cómo pedirnos que los corrijamos o
          los borremos.
        </p>
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-10">
          Última actualización: {ULTIMA_ACTUALIZACION}
        </p>
      </Reveal>

      <div className="flex flex-col gap-10 text-on-surface leading-relaxed">
        <Reveal as="section" delayMs={70}>
          <h2 className="font-display text-2xl text-on-background mb-3">Quién trata tus datos</h2>
          <p>
            {SITE.nombre}, con sede en {ENVIOS.ciudadZona}, Santa Fe, Argentina. Para cualquier
            consulta sobre esta política o tus datos, escribinos por{" "}
            <a
              href={`https://wa.me/${WHATSAPP.numero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-text hover:underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </Reveal>

        <Reveal as="section" delayMs={110}>
          <h2 className="font-display text-2xl text-on-background mb-3">
            Qué datos recogemos — y qué no
          </h2>
          <p className="mb-4">
            Este sitio no tiene formulario de registro ni de compra: no hay ningún paso en el que
            se te pida nombre, email, dirección o datos de tarjeta para navegar el catálogo o
            armar un pedido.
          </p>
          <ul className="flex flex-col gap-3 list-disc pl-5">
            <li>
              <strong className="text-on-background">El carrito de compras</strong> se guarda
              únicamente en la memoria de tu propio navegador (no en un servidor nuestro). Si
              cerrás el navegador o borrás sus datos, el carrito desaparece de ahí — nunca
              formó parte de una base de datos con tu información.
            </li>
            <li>
              <strong className="text-on-background">El pedido se cierra por WhatsApp.</strong>{" "}
              Al finalizar la compra, el sitio arma un mensaje con el detalle y lo abre en
              WhatsApp — de ahí en más, la conversación (y los datos que decidas compartir en
              ella, como tu dirección de envío) queda sujeta a la política de privacidad de
              WhatsApp/Meta, no a la de este sitio.
            </li>
            <li>
              <strong className="text-on-background">El panel de administración</strong>{" "}
              (uso interno, no público) usa una cookie técnica para mantener la sesión iniciada.
              No identifica visitantes del sitio ni se usa fuera de esa pantalla.
            </li>
            <li>
              <strong className="text-on-background">El mapa de la sección &quot;Quiénes somos&quot;</strong>{" "}
              es de Google y solo carga si hacés clic para verlo. Si lo hacés, Google puede
              registrar datos según su propia política — nosotros no vemos ni recibimos nada
              de eso.
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" delayMs={150}>
          <h2 className="font-display text-2xl text-on-background mb-3">
            Cookies y rastreo — por qué no hay un cartel pidiendo aceptarlas
          </h2>
          <p>
            No usamos cookies ni herramientas de analítica, publicidad o redes sociales que
            rastreen tu navegación. La única cookie que genera el sitio (la del panel de
            administración, arriba) es estrictamente necesaria para esa función interna, así
            que no corresponde pedir tu consentimiento para usarla — por eso no vas a
            encontrar un banner de cookies acá: no tenemos nada de ese tipo que pedirte permiso
            para usar.
          </p>
        </Reveal>

        <Reveal as="section" delayMs={190}>
          <h2 className="font-display text-2xl text-on-background mb-3">
            Con quién compartimos información
          </h2>
          <p className="mb-4">
            Usamos proveedores externos para que el sitio funcione. Ninguno recibe tus datos
            personales por navegar el catálogo — solo entran en juego si vos decidís
            interactuar con ellos:
          </p>
          <ul className="flex flex-col gap-2 list-disc pl-5">
            <li>
              <strong className="text-on-background">Vercel</strong> — aloja el sitio.
            </li>
            <li>
              <strong className="text-on-background">Neon</strong> — guarda el catálogo
              (productos, precios, stock), no datos de visitantes.
            </li>
            <li>
              <strong className="text-on-background">Cloudinary</strong> — aloja las fotos de
              los productos.
            </li>
            <li>
              <strong className="text-on-background">WhatsApp / Meta</strong> — solo si cerrás
              un pedido o nos escribís.
            </li>
            <li>
              <strong className="text-on-background">Google</strong> — solo si hacés clic en el
              mapa de &quot;Quiénes somos&quot;.
            </li>
          </ul>
        </Reveal>

        <Reveal as="section" delayMs={230}>
          <h2 className="font-display text-2xl text-on-background mb-3">Tus derechos</h2>
          <p>
            Como titular de tus datos, tenés derecho a acceder, rectificar, actualizar o pedir
            la supresión de la información que nos hayas compartido (por ejemplo, en una
            conversación de WhatsApp), conforme a la Ley 25.326 de Protección de Datos
            Personales. La Agencia de Acceso a la Información Pública, como autoridad de
            control, tiene atribución para atender reclamos que no se resuelvan directamente
            con nosotros. Para ejercer cualquiera de estos derechos, escribinos por WhatsApp.
          </p>
        </Reveal>

        <Reveal as="section" delayMs={270}>
          <h2 className="font-display text-2xl text-on-background mb-3">Cambios a esta política</h2>
          <p>
            Si en el futuro sumamos alguna herramienta que sí recoja datos personales o use
            cookies de rastreo (por ejemplo, para medir visitas), esta página se va a actualizar
            para reflejarlo antes de activarla, con la fecha de arriba puesta al día.
          </p>
        </Reveal>
      </div>

      <Reveal
        delayMs={310}
        className="mt-12 bg-surface rounded-sm p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-display text-xl text-on-background mb-1">
            ¿Tenés dudas sobre tus datos?
          </h2>
          <p className="text-sm text-on-surface-muted">Escribinos por WhatsApp, te respondemos directo.</p>
        </div>
        <a
          href={generarLinkConsultaWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 md:w-auto md:shrink-0 bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-[32px] py-[16px] hover:bg-[#E8E8E8] transition-colors"
        >
          <IconoWhatsapp className="w-4 h-4" />
          Escribir por WhatsApp
        </a>
      </Reveal>

      <p className="mt-8 text-xs text-on-surface-muted">
        Ver también:{" "}
        <Link href="/envios-y-pagos" className="text-accent-text hover:underline">
          Envíos y pagos
        </Link>{" "}
        ·{" "}
        <Link href="/soporte" className="text-accent-text hover:underline">
          Soporte
        </Link>
      </p>
    </div>
  );
}
