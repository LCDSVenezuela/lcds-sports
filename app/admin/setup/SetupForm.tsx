"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (password !== confirmPassword) {
      setStatus("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo crear el administrador");
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
        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Correo administrador</label>
        <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none transition focus:border-emerald-500" placeholder="tu@correo.com" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Contraseña</label>
          <input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none transition focus:border-emerald-500" placeholder="Mínimo 8 caracteres" />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Confirmar contraseña</label>
          <input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="min-h-12 w-full rounded-xl border border-neutral-200 px-4 text-base outline-none transition focus:border-emerald-500" placeholder="Repite la contraseña" />
        </div>
      </div>
      <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">
        Este usuario será el administrador principal. La contraseña se guarda cifrada mediante hash y nunca se almacena en texto plano.
      </div>
      <button type="submit" disabled={loading} className="min-h-12 w-full rounded-xl bg-neutral-950 px-5 text-sm font-black text-white transition hover:bg-emerald-500 hover:text-neutral-950 disabled:opacity-50">
        {loading ? "CREANDO..." : "CREAR ADMINISTRADOR"}
      </button>
      {status && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{status}</p>}
    </form>
  );
}
