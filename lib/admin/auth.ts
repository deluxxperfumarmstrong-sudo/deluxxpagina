export const COOKIE_SESION = "deluxx_admin_session";
const VALOR_FIRMADO = "admin-ok";

// Web Crypto (`crypto.subtle`) en vez de `node:crypto`: el middleware que
// valida la cookie corre en Edge Runtime, donde el módulo `crypto` de Node
// no existe. `crypto.subtle` sí está disponible tanto en Edge como en
// Node — una sola implementación sirve para middleware y Server Actions.

function secreto() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) {
    throw new Error(
      "Falta ADMIN_SESSION_SECRET en el entorno — ver .env.example. El panel de admin no puede firmar sesiones sin esto."
    );
  }
  return s;
}

async function claveHmac() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function bytesAHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// No hay next-auth ni tabla de usuarios: es un único password de admin
// (ADMIN_PASSWORD) y una cookie httpOnly con un valor firmado por HMAC, para
// que no se pueda falsificar sin conocer ADMIN_SESSION_SECRET. Suficiente
// para un panel interno de un solo operador — no es un sistema de usuarios.
export async function crearTokenSesion(): Promise<string> {
  const clave = await claveHmac();
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(VALOR_FIRMADO));
  return `${VALOR_FIRMADO}.${bytesAHex(firma)}`;
}

export async function tokenValido(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [valor, firma] = token.split(".");
  if (valor !== VALOR_FIRMADO || !firma) return false;
  const esperado = await crearTokenSesion();
  const [, firmaEsperada] = esperado.split(".");
  // Comparación de igual longitud, no early-return por carácter — evita
  // filtrar la firma por timing.
  if (firma.length !== firmaEsperada.length) return false;
  let diff = 0;
  for (let i = 0; i < firma.length; i++) {
    diff |= firma.charCodeAt(i) ^ firmaEsperada.charCodeAt(i);
  }
  return diff === 0;
}

export function passwordValido(password: string): boolean {
  const esperado = process.env.ADMIN_PASSWORD;
  if (!esperado || password.length !== esperado.length) return false;
  let diff = 0;
  for (let i = 0; i < password.length; i++) {
    diff |= password.charCodeAt(i) ^ esperado.charCodeAt(i);
  }
  return diff === 0;
}

// El middleware ya bloquea la navegación a /admin/**, pero las Server
// Actions son endpoints POST propios e invocables directamente conociendo su
// id — hay que tratarlas como si fueran públicas y no confiar solo en que el
// usuario haya pasado por una página protegida antes de llegar acá. Cada
// action de escritura en /admin llama esto como primera línea.
export async function requireAdmin(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESION)?.value;
  if (!(await tokenValido(token))) {
    throw new Error("No autorizado.");
  }
}
