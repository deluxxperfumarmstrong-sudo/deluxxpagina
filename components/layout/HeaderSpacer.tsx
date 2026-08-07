"use client";

import { usePathname } from "next/navigation";

// El header es `fixed` para poder ser transparente sobre el hero (ver
// Header.tsx). En cualquier otra página, que no tiene hero, hace falta este
// espaciador para que el contenido no arranque tapado debajo del header.
// En "/" no se renderiza: el Hero está diseñado para ocupar el alto
// completo desde arriba, con el header flotando transparente encima.
export default function HeaderSpacer() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div style={{ height: "var(--header-height, 88px)" }} aria-hidden="true" />
  );
}
