"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, crearTokenSesion, passwordValido } from "@/lib/admin/auth";

export type EstadoLogin = { error: string | null };

// Rutas a las que el login puede redirigir tras autenticar — el resto de
// /admin/** cae a /admin/productos. Un allowlist cerrado en vez de
// `startsWith("/admin")`, que un path como "/admin/../../evil.com" o
// versiones URL-encoded podían bypassear.
const RUTAS_ADMIN_PERMITIDAS = new Set(["/admin/productos", "/admin/categorias"]);

export async function iniciarSesionAdmin(
  _prevState: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/productos");

  if (!passwordValido(password)) {
    // Delay artificial para encarecer un ataque de fuerza bruta contra el
    // único password de admin — no reemplaza un rate limit real, pero sube
    // el costo de intentos automatizados sin infraestructura adicional.
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));
    return { error: "Contraseña incorrecta." };
  }

  const token = await crearTokenSesion();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  redirect(RUTAS_ADMIN_PERMITIDAS.has(next) ? next : "/admin/productos");
}

export async function cerrarSesionAdmin() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESION);
  redirect("/admin/login");
}
