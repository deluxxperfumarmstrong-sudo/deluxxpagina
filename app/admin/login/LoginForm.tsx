"use client";

import { useActionState } from "react";
import { iniciarSesionAdmin, type EstadoLogin } from "./actions";

const ESTADO_INICIAL: EstadoLogin = { error: null };

export default function LoginForm({ next }: { next: string }) {
  const [estado, formAction, pendiente] = useActionState(iniciarSesionAdmin, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="block text-xs uppercase tracking-widest text-on-surface-muted mb-2">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full bg-surface border border-border text-on-surface px-4 py-3 focus-visible:outline-accent"
        />
      </div>
      {estado.error && <p className="text-sm text-error">{estado.error}</p>}
      <button
        type="submit"
        disabled={pendiente}
        className="bg-primary text-on-primary font-[var(--font-body)] font-semibold text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#E8E8E8] transition-colors disabled:opacity-50"
      >
        {pendiente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
