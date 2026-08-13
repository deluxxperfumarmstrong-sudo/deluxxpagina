"use client";

import { useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import { firmarSubidaCloudinary } from "@/lib/admin/cloudinary-firma";

const CLOUD_NAME_LISTO =
  !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "dxxxxxx";
const CLOUDINARY_LISTO = CLOUD_NAME_LISTO;

// Variante de una sola imagen de ImagenesOrdenables.tsx (esa es para las
// varias fotos de un producto, con reorden) — la imagen de categoría es una
// sola, obligatoria, y se usa como tarjeta de acceso directo en la home.
export default function ImagenCategoriaSubidor({
  name,
  valorInicial,
}: {
  name: string;
  valorInicial?: string;
}) {
  const [publicId, setPublicId] = useState(valorInicial ?? "");
  const [publicIdManual, setPublicIdManual] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  async function subirArchivo(archivo: File) {
    setSubiendo(true);
    setErrorSubida(null);
    try {
      const { timestamp, signature, apiKey, cloudName, folder } =
        await firmarSubidaCloudinary("deluxx/categorias");
      const form = new FormData();
      form.append("file", archivo);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Error al subir la imagen.");
      if (data.public_id) setPublicId(data.public_id);
    } catch (e) {
      setErrorSubida(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={publicId} />

      {publicId && (
        <div className="relative w-32 aspect-square rounded-sm overflow-hidden border border-border bg-surface-raised mb-3">
          {CLOUD_NAME_LISTO ? (
            <CldImage src={publicId} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-on-surface-muted text-xs break-all">
              {publicId}
            </div>
          )}
          <button
            type="button"
            onClick={() => setPublicId("")}
            aria-label="Quitar imagen"
            className="absolute top-1 right-1 flex items-center justify-center min-w-7 min-h-7 rounded-full bg-black/70 text-white hover:bg-error transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {CLOUDINARY_LISTO ? (
        <div>
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirArchivo(archivo);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputArchivoRef.current?.click()}
            disabled={subiendo}
            className="border border-border text-on-surface text-sm font-semibold px-4 py-2 hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subiendo ? "Subiendo…" : publicId ? "Cambiar imagen" : "+ Subir imagen"}
          </button>
          {errorSubida && <p className="text-xs text-error mt-2">{errorSubida}</p>}
        </div>
      ) : (
        <div className="border border-dashed border-border-subtle p-4 flex flex-col gap-3">
          <p className="text-xs text-on-surface-muted leading-relaxed">
            Falta configurar Cloudinary (<code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> en{" "}
            <code>.env.local</code>) para subir la imagen desde acá. Mientras tanto, pegá el{" "}
            <code>public_id</code> a mano:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicIdManual}
              onChange={(e) => setPublicIdManual(e.target.value)}
              placeholder="deluxx/categorias/mi-imagen"
              className="campo-admin flex-1"
              aria-label="public_id de Cloudinary"
            />
            <button
              type="button"
              onClick={() => {
                setPublicId(publicIdManual.trim());
                setPublicIdManual("");
              }}
              className="border border-border text-on-surface text-sm font-semibold px-4 hover:border-accent hover:text-accent transition-colors"
            >
              Usar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
