"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, crearTokenSesion, passwordValido } from "@/lib/admin/auth";

export type EstadoLogin = { error: string | null };

export async function iniciarSesionAdmin(
  _prevState: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/productos");

  if (!passwordValido(password)) {
    return { error: "Contraseña incorrecta." };
  }

  const token = await crearTokenSesion();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  redirect(next.startsWith("/admin") ? next : "/admin/productos");
}

export async function cerrarSesionAdmin() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESION);
  redirect("/admin/login");
}
