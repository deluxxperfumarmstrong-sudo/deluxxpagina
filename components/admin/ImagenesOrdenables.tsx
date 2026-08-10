"use client";

import { useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import IconoArrastre from "@/components/icons/IconoArrastre";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
// CldImage (mostrar) solo necesita el cloud name. El upload preset hace
// falta recién para el widget de subida — por eso son dos flags separadas:
// con cloud name pero sin preset todavía se pueden ver miniaturas de
// imágenes ya cargadas, aunque no se puedan subir nuevas.
const CLOUD_NAME_LISTO = !!CLOUD_NAME && CLOUD_NAME !== "dxxxxxx";
const CLOUDINARY_LISTO =
  CLOUD_NAME_LISTO && !!UPLOAD_PRESET && UPLOAD_PRESET !== "xxxxxxxx";

function Miniatura({
  id,
  publicId,
  onQuitar,
}: {
  id: string;
  publicId: string;
  onQuitar: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative aspect-square rounded-sm overflow-hidden border border-border bg-surface-raised ${
        isDragging ? "opacity-40 z-10" : ""
      }`}
    >
      {CLOUD_NAME_LISTO ? (
        <CldImage
          src={publicId}
          alt=""
          fill
          sizes="140px"
          className="object-cover pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-on-surface-muted text-xs break-all">
          {publicId}
        </div>
      )}
      <button
        type="button"
        onClick={onQuitar}
        aria-label="Quitar imagen"
        className="absolute top-1 right-1 flex items-center justify-center min-w-5 min-h-5 sm:min-w-7 sm:min-h-7 rounded-full bg-black/70 text-white text-xs sm:text-base hover:bg-error transition-colors"
      >
        ✕
      </button>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
        className="absolute bottom-1 left-1 flex items-center justify-center min-w-5 min-h-5 sm:min-w-7 sm:min-h-7 rounded-full bg-black/70 text-white cursor-grab active:cursor-grabbing touch-none"
      >
        <IconoArrastre className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}

export default function ImagenesOrdenables({
  name,
  valorInicial,
}: {
  name: string;
  valorInicial: string[];
}) {
  const [imagenes, setImagenes] = useState<string[]>(valorInicial);
  const [publicIdManual, setPublicIdManual] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function agregar(publicId: string) {
    if (!publicId || imagenes.includes(publicId)) return;
    setImagenes((prev) => [...prev, publicId]);
  }

  // Sube directo a la API de Cloudinary vía fetch en vez de CldUploadWidget
  // — el widget abre su propio diálogo con pestañas para elegir la fuente
  // (Mis archivos, Cámara, Google Drive, etc.), y lo que se quiere acá es
  // que el botón abra derecho el explorador de archivos del sistema, sin
  // ese paso intermedio. Mismo upload preset "unsigned", misma carpeta.
  async function subirArchivos(files: FileList) {
    setSubiendo(true);
    setErrorSubida(null);
    try {
      for (const archivo of Array.from(files)) {
        const form = new FormData();
        form.append("file", archivo);
        form.append("upload_preset", UPLOAD_PRESET!);
        form.append("folder", "deluxx/productos");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || "Error al subir la imagen.");
        if (data.public_id) agregar(data.public_id);
      }
    } catch (e) {
      setErrorSubida(e instanceof Error ? e.message : "No se pudo subir una de las imágenes.");
    } finally {
      setSubiendo(false);
    }
  }

  function quitar(publicId: string) {
    setImagenes((prev) => prev.filter((id) => id !== publicId));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setImagenes((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <div>
      {imagenes.map((publicId) => (
        <input key={publicId} type="hidden" name={name} value={publicId} />
      ))}

      {imagenes.length > 0 && (
        <DndContext
          id={`imagenes-ordenables-${name}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={imagenes} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {imagenes.map((publicId) => (
                <Miniatura
                  key={publicId}
                  id={publicId}
                  publicId={publicId}
                  onQuitar={() => quitar(publicId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {imagenes.length > 0 && (
        <p className="text-xs text-on-surface-muted mb-3">
          La primera imagen es la que se ve en el catálogo. Arrastrá para cambiar el orden.
        </p>
      )}

      {CLOUDINARY_LISTO ? (
        <div>
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                subirArchivos(e.target.files);
              }
              // Sin esto, elegir el mismo archivo dos veces seguidas no
              // dispara onChange la segunda vez (el input no detecta cambio).
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputArchivoRef.current?.click()}
            disabled={subiendo}
            className="border border-border text-on-surface text-sm font-semibold px-4 py-2 hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subiendo ? "Subiendo…" : "+ Subir imágenes"}
          </button>
          {errorSubida && <p className="text-xs text-error mt-2">{errorSubida}</p>}
        </div>
      ) : (
        <div className="border border-dashed border-border-subtle p-4 flex flex-col gap-3">
          <p className="text-xs text-on-surface-muted leading-relaxed">
            Falta configurar Cloudinary (<code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> y{" "}
            <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> en <code>.env.local</code>) para subir
            imágenes desde acá. Mientras tanto, pegá el <code>public_id</code> a mano:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicIdManual}
              onChange={(e) => setPublicIdManual(e.target.value)}
              placeholder="deluxx/productos/mi-imagen"
              className="campo-admin flex-1"
              aria-label="public_id de Cloudinary"
            />
            <button
              type="button"
              onClick={() => {
                agregar(publicIdManual.trim());
                setPublicIdManual("");
              }}
              className="border border-border text-on-surface text-sm font-semibold px-4 hover:border-accent hover:text-accent transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
