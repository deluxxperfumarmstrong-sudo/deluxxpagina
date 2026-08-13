"use server";

import crypto from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";

export type FirmaSubidaCloudinary = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

// Firma para "signed upload" de Cloudinary — reemplaza el upload preset
// "unsigned", que dejaba subir archivos arbitrarios a la cuenta a cualquiera
// que leyera el cloud name y el nombre del preset del código fuente público
// del sitio (ambos viajan como NEXT_PUBLIC_*). Con signed upload, el browser
// nunca ve el API secret: pide esta firma de un solo uso al servidor (que sí
// valida sesión de admin) y la manda junto con el archivo a Cloudinary.
//
// Algoritmo de Cloudinary: concatenar los parámetros que van a firmar
// (menos file, cloud_name, resource_type y api_key) ordenados alfabéticamente
// por nombre como "clave=valor&clave=valor", agregar el api_secret al final,
// y hashear con SHA-1. https://cloudinary.com/documentation/authentication_signatures
export async function firmarSubidaCloudinary(folder: string): Promise<FirmaSubidaCloudinary> {
  await requireAdmin();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsAFirmar = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(paramsAFirmar + apiSecret).digest("hex");

  return { timestamp, signature, apiKey, cloudName, folder };
}
