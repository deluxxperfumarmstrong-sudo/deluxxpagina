// El header es `fixed` para poder ser transparente sobre el hero (ver
// Header.tsx). En cualquier otra página, que no tiene hero, hace falta este
// espaciador para que el contenido no arranque tapado debajo del header.
//
// Antes esto se suprimía condicionalmente en "/" comparando usePathname()
// contra "/" — pero SiteChrome (que envuelve este componente) vive en el
// layout raíz, compartido entre todas las rutas, y Next.js puede optimizarlo
// como una "cáscara" estática reusada entre páginas. Cuando eso pasa, el
// valor de usePathname() en esa cáscara no siempre corresponde a la ruta
// real que se está sirviendo, y el spacer terminaba renderizándose también
// en "/" de forma intermitente (confirmado con curl: aparecía en el HTML
// servido por el propio servidor, sin JS de por medio). Ahora se renderiza
// siempre, sin condicional de ruta, y es el Hero (único que lo necesita)
// el que se compensa con un margin-top negativo — ver Hero.tsx.
export default function HeaderSpacer() {
  return (
    <div style={{ height: "var(--header-height, 72px)" }} aria-hidden="true" />
  );
}
