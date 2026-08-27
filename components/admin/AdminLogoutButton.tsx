"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={logout} disabled={loading} className="flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-xs font-black text-white transition hover:bg-white/10 disabled:opacity-50">
      {loading ? "SALIENDO..." : "CERRAR SESIÓN"}
    </button>
  );
}
