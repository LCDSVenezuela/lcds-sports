"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo iniciar sesión");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Correo</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none transition focus:border-emerald-500"
          placeholder="tu@correo.com"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Contraseña</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none transition focus:border-emerald-500"
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" disabled={loading} className="min-h-12 w-full rounded-xl bg-neutral-950 px-5 text-sm font-black text-white transition hover:bg-emerald-500 hover:text-neutral-950 disabled:opacity-50">
        {loading ? "ENTRANDO..." : "ENTRAR AL PANEL"}
      </button>

      {status && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{status}</p>}
    </form>
  );
}
